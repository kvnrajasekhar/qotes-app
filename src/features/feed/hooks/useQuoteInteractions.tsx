import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Alert, Platform, Share } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../auth';
import { safetyApiV1 } from '../../../core/api/v1/safety.api';
import { userApiV1 } from '../../../core/api/v1/user.api';
import { LoginPromptCard } from '../components/LoginPromptCard';
import { QuoteOverflowSheet } from '../components/QuoteOverflowSheet';
import { ReactionPickerSheet } from '../../reactions/components/ReactionPickerSheet';
import { RequoteChoiceSheet } from '../components/RequoteChoiceSheet';
import { useCurrentIdentity } from '../../profile/public';
import type { QuoteCreator, QuoteHandlers, QuoteItem } from '../types/feed.types';

type ReportRequest = { username: string; reason?: string };
type NavigatorWithShare = Navigator & {
  share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
};

function quoteShareUrl(quote: QuoteItem) {
  const baseUrl = (process.env.EXPO_PUBLIC_SOCIAL_SHARE_URL ?? 'https://qotes.com').replace(/\/+$/, '');
  return `${baseUrl}/quote/${encodeURIComponent(quote._id)}`;
}

async function shareQuote(quote: QuoteItem) {
  const text = `“${quote.text}”\n— ${quote.author}`;
  const url = quoteShareUrl(quote);

  if (Platform.OS === 'web') {
    const share = typeof navigator === 'undefined' ? undefined : (navigator as NavigatorWithShare).share;
    if (share) {
      try {
        await share.call(navigator, { title: 'Share quote', text, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        throw error;
      }
    }

    await Clipboard.setStringAsync(`${text}\n\n${url}`);
    Alert.alert('Share unavailable', 'The quote and link were copied to your clipboard.');
    return;
  }

  await Share.share({ title: 'Share quote', message: `${text}\n\n${url}` });
}

/**
 * Default behaviour for every surface that lists quotes: React opens the reaction picker, Requote opens the
 * choice sheet, overflow actions are handled here, tapping a quote opens its detail, tapping a name opens the profile.
 * Render `sheets` once somewhere inside the screen.
 */
export function useQuoteInteractions(): { handlers: QuoteHandlers; sheets: ReactNode } {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { identity, isLoading: isIdentityLoading } = useCurrentIdentity();
  const [reactingId, setReactingId] = useState<string | null>(null);
  const [requoting, setRequoting] = useState<QuoteItem | null>(null);
  const [overflowQuote, setOverflowQuote] = useState<QuoteItem | null>(null);
  const [authPromptAction, setAuthPromptAction] = useState<string | null>(null);
  const isOwnQuote =
    !overflowQuote || !token
      ? false
      : isIdentityLoading
        ? null
        : Boolean(
            identity &&
              (identity.userId === overflowQuote.creator._id ||
                identity.username.toLowerCase() === overflowQuote.creator.username.toLowerCase()),
          );

  const saveNotInterested = useMutation({
    mutationFn: (quote: QuoteItem) =>
      userApiV1.saveNotInterested({ type: 'user', targetId: quote.creator._id }),
    onSuccess: (_result, quote) => {
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      Alert.alert('Preference saved', `We’ll show you fewer quotes from @${quote.creator.username}.`);
    },
  });
  const reportUser = useMutation({
    mutationFn: (request: ReportRequest) => safetyApiV1.reportUser(request),
    onSuccess: (_result, { username }) => {
      Alert.alert('Report submitted', `Thanks. We’ll review your report about @${username}.`);
    },
  });

  const onPressReact = useCallback((quote: QuoteItem) => setReactingId(quote._id), []);
  const onPressRepost = useCallback((quote: QuoteItem) => setRequoting(quote), []);
  const onPressMore = useCallback((quote: QuoteItem) => setOverflowQuote(quote), []);
  const onEdit = useCallback(
    (quote: QuoteItem) => {
      setOverflowQuote(null);
      router.push(`/compose?mode=edit&quoteId=${encodeURIComponent(quote._id)}`);
    },
    [router],
  );
  const onPressQuote = useCallback((quote: QuoteItem) => router.push(`/quote/${quote._id}`), [router]);
  const onPressUser = useCallback(
    (creator: QuoteCreator) => {
      if (creator.username && creator.username !== 'unknown') router.push(`/u/${creator.username}`);
    },
    [router],
  );
  const onNotInterested = useCallback(
    async (quote: QuoteItem) => {
      if (!token) {
        setAuthPromptAction('mark quotes as not interested');
        setOverflowQuote(null);
        return;
      }
      await saveNotInterested.mutateAsync(quote);
    },
    [saveNotInterested.mutateAsync, token],
  );
  const onReport = useCallback(
    async (quote: QuoteItem, reason?: string) => {
      await reportUser.mutateAsync({
        username: quote.creator.username,
        ...(reason ? { reason } : {}),
      });
    },
    [reportUser.mutateAsync],
  );
  const onShare = useCallback((quote: QuoteItem) => shareQuote(quote), []);
  const onCopyLink = useCallback(async (quote: QuoteItem) => {
    await Clipboard.setStringAsync(quoteShareUrl(quote));
    Alert.alert('Link copied', 'The quote link was copied to your clipboard.');
  }, []);

  const handlers = useMemo<QuoteHandlers>(
    () => ({ onPressReact, onPressRepost, onPressMore, onPressQuote, onPressUser }),
    [onPressMore, onPressReact, onPressRepost, onPressQuote, onPressUser],
  );

  const sheets = (
    <>
      <ReactionPickerSheet quoteId={reactingId} onClose={() => setReactingId(null)} />
      <RequoteChoiceSheet quote={requoting} onClose={() => setRequoting(null)} />
      <QuoteOverflowSheet
        quote={overflowQuote}
        isOwnQuote={isOwnQuote}
        onClose={() => setOverflowQuote(null)}
        onEdit={onEdit}
        onShare={onShare}
        onCopyLink={onCopyLink}
        onNotInterested={onNotInterested}
        onReport={onReport}
      />
      <LoginPromptCard
        visible={authPromptAction !== null}
        action={authPromptAction ?? 'react'}
        onDismiss={() => setAuthPromptAction(null)}
        onSignIn={() => {
          setAuthPromptAction(null);
          router.push('/auth');
        }}
        onSignUp={() => {
          setAuthPromptAction(null);
          router.push('/auth?mode=signup');
        }}
      />
    </>
  );

  return { handlers, sheets };
}
