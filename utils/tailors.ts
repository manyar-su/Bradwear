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

const toTailorSlug = (value: unknown) =>
  typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    : '';

const levenshtein = (source: string, target: string) => {
  const rows = source.length + 1;
  const cols = target.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let col = 0; col < cols; col += 1) matrix[0][col] = col;

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = source[row - 1] === target[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[source.length][target.length];
};

export const normalizeTailorName = (value: unknown): string | undefined => {
  const slug = toTailorSlug(value);
  if (!slug) return undefined;

  const exact = TAILOR_NAMES.find((name) => toTailorSlug(name) === slug);
  if (exact) return exact;

  let bestMatch: (typeof TAILOR_NAMES)[number] | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  TAILOR_NAMES.forEach((name) => {
    const distance = levenshtein(slug, toTailorSlug(name));
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = name;
    }
  });

  if (bestDistance <= 1) return bestMatch;
  if (slug.length >= 5 && bestDistance <= 2) return bestMatch;
  return undefined;
};

export const matchTailorIdentity = (left: unknown, right: unknown) => {
  const normalizedLeft = normalizeTailorName(left);
  const normalizedRight = normalizeTailorName(right);

  if (normalizedLeft && normalizedRight) {
    return normalizedLeft === normalizedRight;
  }

  return toTailorSlug(left) !== '' && toTailorSlug(left) === toTailorSlug(right);
};
