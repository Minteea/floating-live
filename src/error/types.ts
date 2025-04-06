export interface ErrorOptions {
  message?: string;
  cause?: string | Error;
  source?: string;
  target?: string;
  [key: string]: any;
}
