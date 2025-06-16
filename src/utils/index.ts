import { CommandContext } from "../command";

export function bindCommand<T extends (...args: any) => any>(
  command: T,
  thisArg: any
): (e: CommandContext, ...args: Parameters<T>) => ReturnType<T> {
  const fn = command.bind(thisArg);
  const c = (e: CommandContext, ...args: Parameters<T>) => fn(...args);
  return c;
}
