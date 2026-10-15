import { useEffect, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';

import { useTheme } from '../../../shared/hooks/useTheme';
import { ApiError } from '../api/authApi';
import { requestPasswordReset } from '../api/passwordApi';
import { AuthLayout } from '../components/AuthLayout';
import { Field } from '../components/auth/Field';
import { NoticeCard } from '../components/auth/NoticeCard';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { validateEmail } from '../lib/passwordValidation';

const RESEND_COOLDOWN_SECONDS = 30;

export type ForgotPasswordScreenProps = {
  /** Header chevron. Omit to hide it. */
  onBack?: () => void;
  /** "Back to log in" link. */
  onBackToLogin: () => void;
  initialEmail?: string;
};

type Status = 'idle' | 'submitting' | 'sent';

export function ForgotPasswordScreen({ onBack, onBackToLogin, initialEmail = '' }: ForgotPasswordScreenProps) {
  const { colors } = useTheme('auth');

  const [email, setEmail] = useState(initialEmail);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const clientError = validateEmail(email);
  const shownError = apiError ?? (touched ? clientError : undefined);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onChangeEmail = (raw: string) => {
    setEmail(raw.replace(/\s/g, ''));
    if (apiError) setApiError(null);
    if (status === 'sent') setStatus('idle');
  };

  const submit = async () => {
    if (status === 'submitting' || cooldown > 0) return;
    Keyboard.dismiss();
    setTouched(true);
    if (clientError) return;

    setStatus('submitting');
    setApiError(null);
    try {
      await requestPasswordReset(email.trim());
      setStatus('sent');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setStatus('idle');
      setApiError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    }
  };

  return (
    <AuthLayout onBack={onBack}>
      <View className="gap-2">
        <Text
          accessibilityRole="header"
          style={{ color: colors.text }}
          className="font-display text-[30px] font-bold leading-[34px] tracking-tight"
        >
          Reset your password
        </Text>
        <Text style={{ color: colors.textMuted }} className="text-[16px] leading-6">
          Enter your email and we&apos;ll send a reset link.
        </Text>
      </View>

      <Field
        label="Email"
        value={email}
        onChangeText={onChangeEmail}
        onBlur={() => setTouched(true)}
        error={shownError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <PrimaryButton
        label="Send reset link"
        onPress={submit}
        loading={status === 'submitting'}
        disabled={cooldown > 0}
      />

      <Pressable
        onPress={onBackToLogin}
        accessibilityRole="link"
        className="items-center py-2 active:opacity-70"
      >
        <Text style={{ color: colors.text }} className="text-[15px] font-bold">
          Back to log in
        </Text>
      </Pressable>

      {status === 'sent' ? (
        <NoticeCard title="Check your email">
          <Text style={{ color: colors.text }} className="text-[14px] leading-5">
            {`If an account exists for ${email.trim()}, a reset link is on its way. `}
            {cooldown > 0 ? (
              `Resend in ${cooldown}s.`
            ) : (
              <Text onPress={submit} accessibilityRole="button" className="font-bold underline">
                Resend now
              </Text>
            )}
          </Text>
        </NoticeCard>
      ) : null}
    </AuthLayout>
  );
}
