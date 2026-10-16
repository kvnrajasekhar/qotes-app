import type { ImagePickerAsset } from 'expo-image-picker';

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../../../shared/lib/env';
import type { FormValues } from '../lib/validation';

const SIGNUP_PATH = '/auth/signup';
const LOGIN_PATH = '/auth/login';

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

type ApiResponse = {
    data?: unknown;
    message?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getMessage(response: unknown): string | undefined {
    if (!isRecord(response)) return undefined;

    const message = response.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
        return message.join(' ');
    }

    return undefined;
}

async function post(path: string, body: string | FormData): Promise<ApiResponse | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: body instanceof FormData
                ? { Accept: 'application/json' }
                : { Accept: 'application/json', 'Content-Type': 'application/json' },
            body,
            signal: controller.signal,
        });
    } catch {
        const message = controller.signal.aborted
            ? 'The request timed out. Please try again.'
            : 'Network error. Check your connection and try again.';
        throw new ApiError(0, message);
    } finally {
        clearTimeout(timer);
    }

    const json = await response.json().catch(() => null) as unknown;
    if (!response.ok) {
        throw new ApiError(response.status, getMessage(json) || 'Something went wrong. Try again.');
    }

    return isRecord(json) ? json as ApiResponse : null;
}

export async function signup(values: FormValues, avatar: ImagePickerAsset | null): Promise<void> {
    const payload: Record<string, string> = {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
    };
    if (values.bio.trim()) payload.bio = values.bio.trim();

    if (!avatar) {
        await post(SIGNUP_PATH, JSON.stringify(payload));
        return;
    }

    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => form.append(key, value));
    // React Native fetch accepts a URI-backed file object for multipart uploads.
    form.append('avatar', {
        uri: avatar.uri,
        name: avatar.fileName ?? 'avatar',
        type: avatar.mimeType ?? 'image/jpeg',
    } as unknown as Blob);
    await post(SIGNUP_PATH, form);
}

export async function signin(payload: { identifier: string; password: string }): Promise<string> {
    const identifier = payload.identifier.trim();
    if (!identifier) throw new ApiError(400, 'Username or email is required.');
    if (!payload.password) throw new ApiError(400, 'Password is required.');

    const response = await post(LOGIN_PATH, JSON.stringify({
        identifier,
        password: payload.password,
    }));
    const data = response?.data;
    if (!isRecord(data) || typeof data.accessToken !== 'string' || !data.accessToken) {
        throw new ApiError(500, 'The server returned an invalid login response.');
    }

    return data.accessToken;
}
