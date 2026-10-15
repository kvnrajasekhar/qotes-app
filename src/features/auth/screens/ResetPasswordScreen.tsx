import { useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';

import { useTheme } from '../../../shared/hooks/useTheme';
import { ApiError } from '../api/authApi';
import { resetPassword } from '../api/passwordApi';
import { AuthLayout } from '../components/AuthLayout';
import { Field } from '../components/auth/Field';
import { NoticeCard } from '../components/auth/NoticeCard';
import { PasswordToggle } from '../components/auth/PasswordToggle';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import {
  PASSWORD_HINT,
  validateConfirmPassword,
  validateNewPassword,
} from '../lib/passwordValidation';

export type ResetPasswordScreenProps = {
  /** Both come from the emailed link. If either is missing the screen shows an "invalid link" state. */
  userId?: string;
  token?: string;
  /** Called from the success state ("Back to log in"). */
  onSuccess: () => void;
  /** Called from the invalid-link / failed states. */
  onRequestNewLink: () => void;
};

type Status = 'idle' | 'submitting' | 'done';

export function ResetPasswordScreen({ userId, token, onSuccess, onRequestNewLink }: ResetPasswordScreenProps) {
  const { colors } = useTheme('auth');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [attempted, setAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const passwordError = validateNewPassword(password);
  const confirmError = validateConfirmPassword(password, confirm);
  const shownPasswordError = touched.password || attempted ? passwordError : undefined;
  // Mismatch surfaces as soon as the user has typed in the confirm field.
  const shownConfirmError = touched.confirm || attempted || confirm.length > 0 ? confirmError : undefined;

  const submit = async () => {
    if (status !== 'idle' || !userId || !token) return;
    Keyboard.dismiss();
    setAttempted(true);
    setFormError(null);
    if (passwordError || confirmError) return;

    setStatus('submitting');
    try {
      await resetPassword({ userId, token, newPassword: password, cnfPassword: confirm });
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    }
  };

  const heading = (text: string) => (
    <Text
      accessibilityRole="header"
      style={{ color: colors.text }}
      className="font-display text-[30px] font-bold leading-[34px] tracking-tight"
    >
      {text}
    </Text>
  );

  if (!userId || !token) {
    return (
      <AuthLayout>
        {heading('Link not valid')}
        <NoticeCard title="This reset link can't be used" tone="error">
          It may be incomplete or have expired. Request a new one to continue.
        </NoticeCard>
        <PrimaryButton label="Request a new link" onPress={onRequestNewLink} />
      </AuthLayout>
    );
  }

  if (status === 'done') {
    return (
      <AuthLayout>
        {heading('Password updated')}
        <NoticeCard title="You're all set">
          Your password has been changed. Log in with your new password.
        </NoticeCard>
        <PrimaryButton label="Back to log in" onPress={onSuccess} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {heading('Choose a new password')}

      <View className="gap-4">
        <Field
          label="New password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (formError) setFormError(null);
          }}
          onBlur={() => setTouched((s) => ({ ...s, password: true }))}
          error={shownPasswordError}
          hint={PASSWORD_HINT}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          right={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />

        <Field
          label="Confirm password"
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            if (formError) setFormError(null);
          }}
          onBlur={() => setTouched((s) => ({ ...s, confirm: true }))}
          error={shownConfirmError}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
          right={<PasswordToggle visible={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />}
        />
      </View>

      {formError ? (
        <NoticeCard title="Couldn't update password" tone="error">
          {formError}
        </NoticeCard>
      ) : null}

      <PrimaryButton label="Update password" onPress={submit} loading={status === 'submitting'} />

      {formError ? (
        <Pressable onPress={onRequestNewLink} accessibilityRole="link" className="items-center py-2 active:opacity-70">
          <Text style={{ color: colors.text }} className="text-[15px] font-bold">
            Request a new link
          </Text>
        </Pressable>
      ) : null}
    </AuthLayout>
  );
}
