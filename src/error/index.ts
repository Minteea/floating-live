import { ErrorOptions } from "./types";

export * from "./types";

export interface AppError extends Error {
  /** 错误发生信息 */
  cause: {
    /** 错误代码 */
    code: string;
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

  [key: string]: unknown;
}

export function appError(
  code: string,
  { message, target, reason, errorConstructor = Error }: AppErrorOptions,
): AppError {
  return new errorConstructor(message, {
    cause: {
      code,
      target,
      reason,
    },
  }) as AppError;
}
