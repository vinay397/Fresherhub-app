export interface ATSResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}