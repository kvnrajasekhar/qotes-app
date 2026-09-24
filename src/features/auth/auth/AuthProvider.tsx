import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type AuthContextValue = {
    token: string | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const defaultValue: AuthContextValue = {
    token: null,
    signIn: async () => undefined,
    signOut: async () => undefined,
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            signIn: async (next: string) => setToken(next),
            signOut: async () => setToken(null),
        }),
        [token],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    return useContext(AuthContext);
}
