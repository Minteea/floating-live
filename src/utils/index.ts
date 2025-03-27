import { CommandContext } from "../command";

export function bindCommand<T extends (...args: any) => any>(
  command: T,
  thisArg: any
): (e: CommandContext, ...args: Parameters<T>) => ReturnType<T> {
  const c = ((e: CommandContext, ...args: Parameters<T>) =>
    command(...args)).bind(thisArg);
  return c;
}
