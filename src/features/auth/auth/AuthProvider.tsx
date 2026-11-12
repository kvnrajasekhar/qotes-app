import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { authStorage } from '../../../shared/lib/storage';
import { SESSION_IDENTITY_KEY } from '../../../shared/lib/session';

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
    const queryClient = useQueryClient();
    const [token, setToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let active = true;
        authStorage.getTokens()
            .then(({ accessToken }) => {
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
                await authStorage.setTokens(next);
                setToken(next);
                void queryClient.invalidateQueries({ queryKey: SESSION_IDENTITY_KEY });
                void queryClient.invalidateQueries({ queryKey: ['feed'] });
            },
            signOut: async () => {
                try {
                    await authStorage.clear();
                } finally {
                    setToken(null);
                    queryClient.setQueryData(SESSION_IDENTITY_KEY, null);
                }
            },
        }),
        [token, isReady, queryClient],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
