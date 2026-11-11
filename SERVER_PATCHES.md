# Server changes the profile screens depend on (qotes-server)

The app is written against the intended contract; these are the gaps found in the current NestJS code.

## 1. Bio is dropped on profile update  (users.controller.ts)
`PATCH /user/profile/me` only forwards `firstName, lastName, email`.
```ts
const { firstName, lastName, bio } = body;
const updated = await this.usersService.updateUserProfile(userId, { firstName, lastName, bio });
```
(and widen the `@Body()` type to include `bio?: string`).

## 2. Followers / following rows lose all user fields  (users.service.ts)
`.lean()` results have no `toObject`, so `...user.toObject?.()` spreads nothing and rows contain only
`isFollowing` / `followsYou`. Use a plain spread:
```ts
users: followerList.map(user => ({ ...user, isFollowing: followingSet.has(String(user._id)) })),
following: followingList.map(user => ({ ...user, followsYou: followedBySet.has(String(user._id)) })),
```

## 3. Profile response has no relationship flags  (users.controller.ts / users.service.ts)
`GET /user/u/:username` is unguarded and returns no viewer context, so the app cannot know
`isFollowing` / `followsYou`. Make the route optional-auth, then add both booleans:
```ts
const [iFollow, theyFollow] = await Promise.all([
  this.followModel.exists({ follower: viewerId, following: user._id }),
  this.followModel.exists({ follower: user._id, following: viewerId }),
]);
return { ...user.toObject(), isFollowing: !!iFollow, followsYou: !!theyFollow };
```
Also strip `email` from the public response.

## 4. Follow lists only report one direction
For someone else's `/following` list the server returns `followsYou` but not `isFollowing` (and the reverse
for `/followers`). Add the missing flag per row (one `$in` query) so "Follow" vs "Following" is correct everywhere.

## 5. `GET /user/profile/me` is broken
It calls `getUserByUsername(userId)`. Use `req.user.username` (the app currently reads the username from the access token instead).

## 6. Saved quotes endpoint doesn't exist
`CollectionsController` has no routes. The app calls `GET /collections/default/items?cursor&limit` and expects
`{ items: Quote[], pagination: { nextCursor, hasMore } }`. A 404 is treated as "nothing saved".

## 7. Block / report endpoints don't exist
`SafetyController` has no routes, so the profile "..." menu shows a "not available yet" notice until they exist.

---

# Added for compose / quote detail / reactions

## 8. Reaction routes don't exist  (reactions.controller.ts)
`ReactionsController` is empty, and the working logic lives in the legacy `reaction.service.ts` object.
The app calls `POST /reaction/:quoteId/toggle` with `{ type, action }` and ignores the response body.
Wire it to the sliding-window rate limit + Redis + Kafka path in `toggleReaction`.

## 9. Reaction enum is out of date  (reaction.model.ts, reaction.worker.ts)
The model still allows `like | inspriring | thoughtful | realatable | eye-opening`.
Replace with `insightful | empowering | resonant | artistic | clap` (note the typos in the old values),
and make the worker increment `reactions.<type>` with the new names.

## 10. Quote responses need the viewer's reaction
`GET /quote/:id` and the feeds should include `userReaction` (the viewer's current reaction or `null`) and
`isSaved`, otherwise the sheet can't show your selection after a reload. Populate `creator`
(`username firstName lastName avatarUrl`) in `getQuoteById`; today it returns a bare ObjectId.

## 11. Create-quote validation
`POST /quote` accepts any text length. Enforce 10 to 500 characters and at most 5 hashtags server-side.
The app already blocks invalid input, but the API should not trust it.

## 12. Optional: `/v1` prefix
The spec says `/v1/...`, but `main.ts` sets no global prefix, so routes are `/quote`, `/feed`, `/user/...`.
The feed client currently targets `/v1/feed/global` (see `FEED_GLOBAL_PATH`). Either call
`app.setGlobalPrefix('v1')` and add `/v1` to the other clients, or point `FEED_GLOBAL_PATH` at `/feed`.

---

# Added for requotes, reflections, reactions list, following / discover

## 13. Requotes: allow empty text and embed the root quote  (quote.model.ts, quotes.service.ts, feeds.service.ts)
- `text` is `required`, so a plain "requote to profile" (empty text) fails validation. Relax it when `isRequote` is true.
- Feed and detail responses must embed the root: `.populate('parentQuoteId')` and return it as `parentQuote`
  (plus `creator` populated on both). The app renders `isRequote && parentQuote` as a composite card
  (non-empty `text`) or an "@user requoted" banner over the original (empty `text`).
- Add `viewerRequoted: boolean` (does the viewer already have a requote of this quote?). The existing unique
  index `(creator, parentQuoteId)` already blocks duplicates; the sheets disable themselves from this flag.
- Hide requotes whose parent was deleted or hidden (`isHiddenBySystem`).

## 14. Reflections endpoint  (quotes.controller.ts)
`GET /quote/:id/reflections?cursor&limit` -> `{ quotes: Quote[], pagination: { nextCursor, hasMore } }`:
quotes where `parentQuoteId = :id`, `isRequote = true`, and `text != ''`, newest first. A 404 reads as "none yet".
Declare it before `@Get(':id')`.

## 15. "Who reacted" endpoint  (reactions.controller.ts)
`GET /reaction/:quoteId?type&cursor&limit` -> `{ users: [{ _id, type, createdAt, user: { _id, username, avatarUrl } }], pagination }`.
`getQuoteReactions` in the legacy `reaction.service.ts` already builds this; it projects `avatar`, but the field is `avatarUrl`
(the app accepts both).

## 16. Feed routes
The app calls `/v1/feed/global`, `/v1/feed/following`, `/v1/feed/discover` (see `FEED_PATHS` in `feedApi.ts`);
the controller serves `/feed`, `/feed/following`, `/feed/discover`. Fix with a global `v1` prefix or edit `FEED_PATHS`.
`following` filters by `creator`; make sure it also returns requotes made by followed users.

## 17. Suggested writers
`GET /user/suggested/public` returns the most-followed users, including the viewer and people they already follow.
Exclude both when a viewer is known (the app already hides the viewer client-side).
