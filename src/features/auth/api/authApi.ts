import type { ImagePickerAsset } from 'expo-image-picker';

import type { FormValues } from '../lib/validation';

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function signup(values: FormValues, avatar: ImagePickerAsset | null): Promise<void> {
    void values;
    void avatar;

    await Promise.resolve();
}

export async function signin(payload: { username: string; password: string }): Promise<string> {
    const username = payload.username.trim();
    const password = payload.password;

    if (!username) {
        throw new ApiError(400, 'Username is required.');
    }

    if (!password) {
        throw new ApiError(400, 'Password is required.');
    }

    return `mock-token-${username}`;
}
