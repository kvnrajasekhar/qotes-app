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
