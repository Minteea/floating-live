import { ErrorOptions } from "./types";

export * from "./types";
export class AppError extends Error {
  /** 错误来源 */
  source?: string;
  /** 错误id */
  id: string;
  /** 错误原因 */
  cause?: Error | string;
  constructor(id: string, options: ErrorOptions) {
    super(options.message);
    this.id = id;
    this.source = options?.source;
    this.cause = options?.cause;
  }
}
