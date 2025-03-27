export interface ErrorOptions {
  message?: string;
  cause?: string | Error;
  source?: string;
  [key: string]: any;
}
