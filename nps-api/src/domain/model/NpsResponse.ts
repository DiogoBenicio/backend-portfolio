export interface NpsResponse {
  id: string;
  score: number;
  comment?: string | null;
  page: string;
  createdAt: Date;
}

export function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 10;
}
