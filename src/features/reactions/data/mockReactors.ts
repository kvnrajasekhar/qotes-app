import type { ReactionUser } from '../types/reaction.types';

const HOUR = 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

/** Dev-only: who "reacted" to the sample quotes (ids starting "mock-"). */
export const MOCK_REACTORS: ReactionUser[] = [
  { id: 'mr-1', userId: 'mu-1', username: 'leo', type: 'clap', createdAt: ago(2 * HOUR) },
  { id: 'mr-2', userId: 'mu-2', username: 'ana', type: 'empowering', createdAt: ago(5 * HOUR) },
  { id: 'mr-3', userId: 'mu-3', username: 'sam', type: 'insightful', createdAt: ago(26 * HOUR) },
  { id: 'mr-4', userId: 'mu-4', username: 'ravi', type: 'empowering', createdAt: ago(30 * HOUR) },
  { id: 'mr-5', userId: 'mu-5', username: 'zoe', type: 'resonant', createdAt: ago(52 * HOUR) },
  { id: 'mr-6', userId: 'mu-6', username: 'kai', type: 'insightful', createdAt: ago(76 * HOUR) },
];
