export interface SessionIdentity {
  userId: string;
  username: string;
}

export const SESSION_IDENTITY_KEY = ['session', 'identity'] as const;
