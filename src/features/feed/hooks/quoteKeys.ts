export const quoteKeys = {
  detail: (id: string) => ['quote', id] as const,
  reflections: (id: string) => ['quote-reflections', id] as const,
};
