import { LIMITS } from './validation';

export const PASSWORD_HINT = `${LIMITS.password.min}–${LIMITS.password.max} characters.`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Email is required.';
  if (!EMAIL_RE.test(value)) return 'Enter a valid email.';
  return undefined;
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return 'Password is required.';
  if (password.length < LIMITS.password.min || password.length > LIMITS.password.max) {
    return `Password must be ${LIMITS.password.min}–${LIMITS.password.max} characters.`;
  }
  return undefined;
}

export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return undefined;
}
