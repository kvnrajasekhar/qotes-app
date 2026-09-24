export type Mode = 'signin' | 'signup';

export type FieldName =
    | 'firstName'
    | 'lastName'
    | 'username'
    | 'email'
    | 'password'
    | 'bio';

export type FormValues = Record<FieldName, string>;

export type FieldErrors = Partial<Record<FieldName, string>>;

export const LIMITS = {
    username: { min: 3, max: 24 },
    password: { min: 8, max: 72 },
    bio: 200,
} as const;

export const EMPTY_VALUES: FormValues = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    bio: '',
};

export const fieldsFor = (mode: Mode): FieldName[] =>
    mode === 'signup'
        ? ['firstName', 'lastName', 'username', 'email', 'password', 'bio']
        : ['username', 'password'];

export function passwordStrength(password: string): { score: number; label: string } {
    if (!password) return { score: 0, label: 'No password' };

    let score = 0;
    if (password.length >= LIMITS.password.min) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const clamped = Math.min(score, 4);
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

    return {
        score: clamped,
        label: labels[clamped],
    };
}

export function validateAll(values: FormValues, mode: Mode): FieldErrors {
    const errors: FieldErrors = {};

    if (mode === 'signup') {
        if (!values.firstName.trim()) errors.firstName = 'First name is required.';
        if (!values.lastName.trim()) errors.lastName = 'Last name is required.';
    }

    const username = values.username.trim();
    if (!username) {
        errors.username = 'Username is required.';
    } else if (username.length < LIMITS.username.min || username.length > LIMITS.username.max) {
        errors.username = `Username must be ${LIMITS.username.min}-${LIMITS.username.max} characters.`;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username = 'Only letters, numbers, and underscores are allowed.';
    }

    if (mode === 'signup') {
        if (!values.email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
            errors.email = 'Enter a valid email.';
        }
    }

    if (!values.password) {
        errors.password = 'Password is required.';
    } else if (values.password.length < LIMITS.password.min) {
        errors.password = `Password must be at least ${LIMITS.password.min} characters.`;
    }

    if (mode === 'signup' && values.bio.length > LIMITS.bio) {
        errors.bio = `Bio must be ${LIMITS.bio} characters or fewer.`;
    }

    return errors;
}
