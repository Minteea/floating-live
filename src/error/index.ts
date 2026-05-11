import { ErrorOptions } from "./types";

export * from "./types";

/** @deprecated 应使用 appError 函数代替 */
export class AppErrorLegacy extends Error {
  /** 错误id */
  id: string;
  /** 错误来源 */
  source?: string;
  /** 错误目标 */
  target?: string;
  /** 错误原因 */
  cause?: Error | string;
  constructor(id: string, options: ErrorOptions) {
    super(options.message);
    this.id = id;
    this.source = options?.source;
    this.cause = options?.cause;
    this.target = options?.target;
  }
}

export interface AppError extends Error {
  /** 错误发生信息 */
  cause: {
    /** 错误id */
    id: string;
    /** 错误目标对象 */
    target?: string;
    /** 错误原因 */
    reason?: string | Error | AppError;
  };
}

export interface AppErrorOptions {
  /** 错误消息 */
  message: string;
  /** 错误目标对象 */
  target?: string;
  /** 错误原因 */
  reason?: string | Error | AppError;
  /** 错误构造函数 */
  errorConstructor?: ErrorConstructor;
}

export function appError(
  id: string,
  { message, target, reason, errorConstructor = Error }: AppErrorOptions,
) {
  return new errorConstructor(message, {
    cause: {
      id,
      target,
      reason,
    },
  });
}
