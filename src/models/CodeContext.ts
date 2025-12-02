/**
 * Interface representing the code context around the user's cursor
 */
export interface CodeContext {
  language: string;
  snippet: string;
  lineNumber: number;
  fileName: string;
}
