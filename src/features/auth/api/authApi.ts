import type { ImagePickerAsset } from 'expo-image-picker';

import { ApiRequestError, apiClient } from '../../../core/api/client';
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function post(path: string, body: unknown): Promise<unknown> {
    try {
        return await apiClient.post<unknown>(path, body, undefined, false);
    } catch (error) {
        if (error instanceof ApiRequestError) {
            throw new ApiError(error.status, error.message);
        }
        throw error;
    }
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
        await post(SIGNUP_PATH, payload);
        return;
    }

    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => form.append(key, value));
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

    const data = await post(LOGIN_PATH, {
        identifier,
        password: payload.password,
    });
    if (!isRecord(data) || typeof data.accessToken !== 'string' || !data.accessToken) {
        throw new ApiError(500, 'The server returned an invalid login response.');
    }

    return data.accessToken;
}
