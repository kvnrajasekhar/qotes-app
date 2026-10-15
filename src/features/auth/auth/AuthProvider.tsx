import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authStorage } from '../../../shared/lib/storage';

type AuthContextValue = {
    token: string | null;
    isReady: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const defaultValue: AuthContextValue = {
    token: null,
    isReady: false,
    signIn: async () => undefined,
    signOut: async () => undefined,
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let active = true;
        Promise.all([
            authStorage.getTokens(),
            new Promise((resolve) => setTimeout(resolve, 2000)),
        ])
            .then(([{ accessToken }]) => {
                if (active) setToken(accessToken);
            })
            .catch((error: unknown) => {
                console.error('Failed to restore authentication state.', error);
            })
            .finally(() => {
                if (active) setIsReady(true);
            });

        return () => {
            active = false;
        };
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            isReady,
            signIn: async (next: string) => {
                await authStorage.setTokens(next, '');
                setToken(next);
            },
            signOut: async () => {
                await authStorage.clear();
                setToken(null);
            },
        }),
        [token, isReady],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
