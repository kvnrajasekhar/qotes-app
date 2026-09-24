import type { ImagePickerAsset } from 'expo-image-picker';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as authApi from '../api/authApi';
import { ApiError } from '../api/authApi';
import { useAuth } from '../auth/AuthProvider';
import { APP_NAME } from '../config';
import {
  EMPTY_VALUES,
  LIMITS,
  fieldsFor,
  passwordStrength,
  validateAll,
  type FieldErrors,
  type FieldName,
  type FormValues,
  type Mode,
} from '../lib/validation';
import { Field, type InputHandle } from './auth/Field';
import { ProfilePreview } from './auth/ProfilePreview';
import { SegmentedControl } from './auth/SegmentedControl';
const BrandLogo = require('./qotes-logo-main.png');

const COPY = {
  signin: {
    title: 'Welcome back',
    body: 'Sign in to pick up your feed where you left it.',
    cta: 'Sign in',
    busy: 'Signing in…',
    panel: 'Your feed is right where you left it.',
    switchPrompt: 'New here?',
    switchAction: 'Create an account',
  },
  signup: {
    title: 'Create your profile',
    body: 'Add a photo and a handle. Your feed loads as soon as you’re in.',
    cta: 'Create account',
    busy: 'Creating account…',
    panel: 'This is how you’ll show up in the feed.',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign in',
  },
} as const;

type Banner = { tone: 'error' | 'success'; text: string };

/* Breakpoints (px). Below SPLIT the form is a single column; from SPLIT up
   it sits beside a brand panel with a live profile preview. */
const SPLIT = 900;
const NARROW = 380;

export default function AuthScreen({ initialMode = 'signin' }: { initialMode?: Mode }) {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDark = useColorScheme() === 'dark';

  const isSplit = width >= SPLIT;
  const stackNames = width < NARROW;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<Banner | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<Partial<Record<FieldName, InputHandle | null>>>({});

  const copy = COPY[mode];
  const isSignup = mode === 'signup';
  const errors = useMemo(() => validateAll(values, mode), [values, mode]);
  const strength = useMemo(() => passwordStrength(values.password), [values.password]);

  const fullName = `${values.firstName} ${values.lastName}`.trim();
  const initials = (
    (values.firstName.trim()[0] ?? '') + (values.lastName.trim()[0] ?? '') ||
    values.username[0] ||
    ''
  ).toUpperCase();

  /** Server errors win; client errors only show once a field was touched or submit was tried. */
  const shown = (name: FieldName) =>
    serverErrors[name] ?? (touched[name] || attempted ? errors[name] : undefined);

  const setField = (name: FieldName, raw: string) => {
    const value = name === 'username' || name === 'email' ? raw.replace(/\s/g, '') : raw;
    setValues((v) => ({ ...v, [name]: value }));
    if (serverErrors[name]) setServerErrors((e) => ({ ...e, [name]: undefined }));
    if (banner?.tone === 'error') setBanner(null);
  };

  const bind = (name: FieldName) => ({
    ref: (el: InputHandle | null) => {
      inputs.current[name] = el;
    },
    value: values[name],
    onChangeText: (t: string) => setField(name, t),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
    error: shown(name),
  });

  const focusNext = (name: FieldName) => {
    const order = fieldsFor(mode);
    inputs.current[order[order.indexOf(name) + 1]]?.focus();
  };

  const switchMode = (next: Mode) => {
    if (next === mode || submitting) return;
    setMode(next);
    setTouched({});
    setAttempted(false);
    setServerErrors({});
    setBanner(null);
    setShowPassword(false);
  };

  const handleError = (err: unknown) => {
    const api = err instanceof ApiError ? err : null;
    if (!api) {
      setBanner({ tone: 'error', text: 'Something went wrong. Try again.' });
      return;
    }
    const duplicate = api.status === 409 || /already (exists|registered|taken)/i.test(api.message);
    if (isSignup && duplicate) {
      setServerErrors({ username: 'That username or email is already registered.' });
      inputs.current.username?.focus();
      return;
    }
    setBanner({ tone: 'error', text: api.message });
  };

  const onSubmit = async () => {
    if (submitting) return;
    Keyboard.dismiss();
    setBanner(null);
    setAttempted(true);

    const found = validateAll(values, mode);
    const firstInvalid = fieldsFor(mode).find((f) => found[f]);
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus();
      return;
    }

    setSubmitting(true);
    let accountCreated = false;
    try {
      if (isSignup) {
        await authApi.signup(values, avatar); // POST /auth/signup (multipart)
        accountCreated = true;
      }
      // The signup response carries no token, so sign in right away with the same credentials.
      const token = await authApi.signin({
        username: values.username.trim(),
        password: values.password,
      });
      await signIn(token); // persists the token; <App /> then swaps this screen for the feed
    } catch (err) {
      if (accountCreated) {
        // Account exists; only the automatic sign-in failed. Hand over to the sign-in form.
        setMode('signin');
        setValues({ ...EMPTY_VALUES, username: values.username });
        setAvatar(null);
        setTouched({});
        setAttempted(false);
        setBanner({ tone: 'success', text: 'Account created. Sign in to continue.' });
      } else {
        handleError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const passwordToggle = (
    <Pressable
      onPress={() => setShowPassword((prev) => !prev)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
      className="rounded-lg bg-transparent px-2 py-1 active:opacity-70 dark:bg-black"
    >
      <Text className="text-[13px] font-semibold text-slate-700 dark:text-white">
        {showPassword ? 'Hide' : 'Show'}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 flex-row bg-mint dark:bg-night"
      style={{ backgroundColor: isDark ? '#000000' : '#F8FAFC' }}>
      {isSplit && (
        <View
          style={{
            width: Math.min(680, Math.round(width * 0.46)),
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom + 48,
          }}
          className="justify-between bg-signal px-12"
        >
          <Wordmark onColor />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: isSplit ? 48 : 20,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
          }}
        >
          <View className="w-full max-w-[460px] gap-6">
            {!isSplit && <Wordmark />}

            <View className="gap-2">
              <Text
                accessibilityRole="header"
                className="font-display text-[30px] leading-[34px] tracking-tight text-ink dark:text-mist"
              >
                {copy.title}
              </Text>
              <Text className="text-[16px] leading-6 text-ink/70 dark:text-mist/70">
                {copy.body}
              </Text>
            </View>

            <SegmentedControl
              value={mode}
              onChange={switchMode}
              options={[
                { value: 'signin', label: 'Sign in' },
                { value: 'signup', label: 'Create account' },
              ]}
            />



            <View className="gap-4">
              {isSignup && (
                <>
                  <View className={stackNames ? 'gap-4' : 'flex-row gap-3'}>
                    <View className={stackNames ? '' : 'flex-1'}>
                      <Field
                        label="First name"
                        autoComplete="given-name"
                        textContentType="givenName"
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => focusNext('firstName')}
                        {...bind('firstName')}
                      />
                    </View>
                    <View className={stackNames ? '' : 'flex-1'}>
                      <Field
                        label="Last name"
                        autoComplete="family-name"
                        textContentType="familyName"
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => focusNext('lastName')}
                        {...bind('lastName')}
                      />
                    </View>
                  </View>
                </>
              )}

              <Field
                label={isSignup ? 'Username' : 'Username or email'}
                hint={
                  isSignup
                    ? `Letters, numbers and underscores. ${LIMITS.username.min}–${LIMITS.username.max} characters.`
                    : undefined
                }
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={isSignup ? 'username-new' : 'username'}
                textContentType="username"
                returnKeyType="next"
                onSubmitEditing={() => focusNext('username')}
                {...bind('username')}
              />

              {isSignup && (
                <Field
                  label="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => focusNext('email')}
                  {...bind('email')}
                />
              )}

              <View className="gap-2.5">
                <Field
                  label="Password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete={isSignup ? 'new-password' : 'password'}
                  textContentType={isSignup ? 'newPassword' : 'password'}
                  returnKeyType={isSignup ? 'next' : 'go'}
                  onSubmitEditing={isSignup ? () => focusNext('password') : onSubmit}
                  right={passwordToggle}
                  {...bind('password')}
                />
                {isSignup && values.password.length > 0 && <StrengthMeter {...strength} dark={isDark} />}
              </View>

              {isSignup && (
                <Field
                  label="Bio (optional)"
                  multiline
                  maxLength={LIMITS.bio}
                  autoCapitalize="sentences"
                  counter={`${values.bio.length}/${LIMITS.bio}`}
                  {...bind('bio')}
                />
              )}
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel={submitting ? copy.busy : copy.cta}
              accessibilityState={{ disabled: submitting, busy: submitting }}
              style={{
                backgroundColor: isDark ? '#FFFFFF' : '#000000',
              }}
              className="h-[52px] flex-row items-center justify-center gap-2.5 rounded-full active:opacity-85 disabled:opacity-50"
            >
              {submitting && (
                <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} />
              )}
              <Text
                style={{
                  color: isDark ? '#000000' : '#FFFFFF',
                }}
                className="text-[16px] font-bold tracking-tight"
              >
                {submitting ? copy.busy : copy.cta}
              </Text>
            </Pressable>

            <View className="flex-row flex-wrap items-center justify-center gap-x-1.5">
              <Text className="text-[15px] text-ink/70 dark:text-mist/70">{copy.switchPrompt}</Text>
              <Pressable
                onPress={() => switchMode(isSignup ? 'signin' : 'signup')}
                accessibilityRole="button"
                className="py-2"
              >
                <Text className="font-body-semibold text-[15px] text-signal dark:text-signal-soft">
                  {copy.switchAction}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ---------- small local pieces ---------- */

function Wordmark({ onColor = false }: { onColor?: boolean }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <Image
        source={BrandLogo}
        resizeMode="contain"
        className="h-8 w-8"
      />
      <Text
        className="font-display text-[24px] font-bold tracking-tight text-black dark:text-white"
      >
        {APP_NAME}
      </Text>
    </View>
  );
}

function StrengthMeter({ score, label, dark }: { score: number; label: string; dark: boolean }) {
  const active = score <= 1 ? (dark ? '#FF86A3' : '#C21E4B') : dark ? '#9295FF' : '#3538D8';
  const idle = dark ? '#2B3054' : '#D3D7EA';
  return (
    <View
      accessible
      accessibilityLabel={`Password strength: ${label}`}
      className="flex-row items-center gap-3"
    >
      <View className="flex-1 flex-row gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{ backgroundColor: i <= score ? active : idle }}
            className="h-1.5 flex-1 rounded-full"
          />
        ))}
      </View>
      <Text className="w-16 text-right text-[13px] text-ink/70 dark:text-mist/70">{label}</Text>
    </View>
  );
}