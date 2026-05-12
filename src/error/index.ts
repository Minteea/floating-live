import { ErrorOptions } from "./types";

export * from "./types";

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

  [key: string]: unknown;
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
