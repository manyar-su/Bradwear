export const TAILOR_NAMES = [
  'Maris',
  'Ferry',
  'Aan',
  'Farid',
  'Opik',
  'Fadil',
  'Asep',
  'Abdul',
  'Hadi',
  'Epul',
] as const;

export const normalizeTailorName = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  if (!cleaned) return undefined;

  return TAILOR_NAMES.find((name) => name.toLowerCase() === cleaned.toLowerCase());
};
