import { App } from "../../app";
import type {
  CommandOptions,
  CommandCallOptions,
  CommandFunction,
  AppCommandMap,
} from "../../command";
import { AppErrorLegacy, ErrorOptions } from "../../error";
import {
  AppEventListener,
  AppEventEmitOptions,
  AppEventDetailMap,
} from "../../event";
import {
  HookUseOptions,
  HookCallOptions,
  AppHookMap,
  HookFunction,
  HookContext,
} from "../../hook";
import { AppValueMap, ValueContext, ValueOptions } from "../../value";
import type {
  PluginContext,
  PluginConstructor,
  PluginInitOptions,
  AppPluginExposesMap,
  PluginItem,
  WhenRegisterCallback,
} from "../types";

class ListMap<K, V> extends Map<K, Set<V>> {
  addItem(key: K, value: V) {
    const list = this.get(key);
    if (list) {
      list.add(value);
    } else {
      this.set(key, new Set([value]));
    }
  }
  deleteItem(key: K, value: V) {
    this.get(key)?.delete(value);
  }
}

export class CommonPluginContext implements PluginContext {
  get safe() {
    return false;
  }

  getApp(): App | null {
    return this.#accessApp ? this.#app : null;
  }

  /** 主程序，插件不可访问 */
  #app: App;

  readonly #accessApp: boolean;

  /** AbortController，插件不可访问 */
  #abortController = new AbortController();

  #registered = {
    plugins: new Set<string>(),
    values: new Set<string>(),
    commands: new Set<string>(),
    hooks: new ListMap<string, (ctx: any) => any>(),
    events: new ListMap<string, AppEventListener<any>>(),
  };

  #whenRegisterMap = new ListMap<string, WhenRegisterCallback>();

  getRegisteredPlugins() {
    return [...this.#registered.plugins];
  }

  /** 插件名称 */
  readonly pluginName: string;
  constructor(app: App, pluginName: string, options?: { accessApp?: boolean }) {
    this.#app = app;
    this.pluginName = pluginName;
    this.#accessApp = options?.accessApp ?? false;
  }

  /** 抛出错误
   *
   * 一般用于自身导致的错误，若非插件本身导致的错误，使用throw语句即可
   */
  throw(err: AppErrorLegacy): never {
    err.source ??= `plugin:${this.pluginName}`;
    throw err;
  }

  error(id: string, options: ErrorOptions) {
    return new AppErrorLegacy(id, options);
  }

  register<P extends PluginItem>(
    plugin: PluginConstructor<P>,
    options?: PluginInitOptions,
  ): Promise<P> {
    const p = this.#app.register(plugin, options);
    this.#registered.plugins.add(plugin.name);
    return p;
  }

  unregister(pluginName: string): void {
    this.#app.unregister(pluginName);
    this.#registered.plugins.delete(pluginName);
  }

  getPluginExposes<K extends keyof AppPluginExposesMap>(
    pluginName: K,
  ): AppPluginExposesMap[K] {
    return this.#app.getPluginExposes(pluginName);
  }

  whenRegister(pluginName: string, callback: WhenRegisterCallback): void {
    this.#app.whenRegister(pluginName, callback);
    this.#whenRegisterMap.addItem(pluginName, callback);
  }

  cancelWhenRegister(pluginName: string, callback: WhenRegisterCallback): void {
    this.#app.cancelWhenRegister(pluginName, callback);
    this.#whenRegisterMap.deleteItem(pluginName, callback);
  }

  hasPlugin(pluginName: string): boolean {
    return this.#app.hasPlugin(pluginName);
  }

  registerValue<K extends keyof AppValueMap>(
    name: K,
    options: ValueOptions<AppValueMap[K]>,
  ) {
    const ctx = this.#app.registerValue(name, options);
    this.#registered.values.add(name);
    return ctx;
  }

  unregisterValue(name: string): void {
    this.#app.unregisterValue(name);
    this.#registered.values.delete(name);
  }

  registerCommand<T extends keyof AppCommandMap>(
    name: T,
    func: CommandFunction<AppCommandMap[T]>,
    options?: CommandOptions,
  ): void {
    this.#app.registerCommand(name, func, options);
    this.#registered.commands.add(name);
  }

  unregisterCommand(name: string): void {
    this.#app.unregisterCommand(name);
    this.#registered.commands.delete(name);
  }

  hasCommand(name: string) {
    return this.#app.hasCommand(name);
  }

  on<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>,
  ) {

    this.#app.on(type, listener, this.signal);
    this.#registered.events.addItem(type, listener);

  }

  once<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>,
  ) {

    this.#app.once(type, listener, this.signal);
    this.#registered.events.addItem(type, listener);

  }

  off<K extends keyof AppEventDetailMap>(
    type: K,
    listener: AppEventListener<AppEventDetailMap[K]>,
  ) {

    this.#app.off(type, listener);
    this.#registered.events.deleteItem(type, listener);

  }

  emit<K extends keyof AppEventDetailMap>(
    type: K,
    detail: AppEventDetailMap[K],
    options?: AppEventEmitOptions & EventInit,
  ) {

    this.#app.emit(type, detail || {}, {
      source: `plugin:${this.pluginName}`,
      ...options,
    });

  }

  call<T extends keyof AppCommandMap>(
    name: T,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]> {

    return this.#app.callWithOptions(
      name,
      { source: `plugin:${this.pluginName}` },
      ...args,
    );

  }

  callWithOptions<T extends keyof AppCommandMap>(
    name: T,
    options: CommandCallOptions,
    ...args: Parameters<AppCommandMap[T]>
  ): ReturnType<AppCommandMap[T]> {

    return this.#app.callWithOptions(name, options, ...args);

  }

  useHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>,
    options?: HookUseOptions,
  ): void {

    this.#app.useHook(name, func, options);
    this.#registered.hooks.addItem(name, func);

  }

  unuseHook<T extends keyof AppHookMap>(
    name: T,
    func: HookFunction<AppHookMap[T]>,
  ): void {

    this.#app.unuseHook(name, func);
    this.#registered.hooks.deleteItem(name, func);

  }

  callHook<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions,
  ): Promise<HookContext<AppHookMap[T]>> {

    return this.#app.callHook(name, ctx);

  }

  callHookSync<T extends keyof AppHookMap>(
    name: T,
    ctx: AppHookMap[T],
    options?: HookCallOptions,
  ): HookContext<AppHookMap[T]> {

    return this.#app.callHookSync(name, ctx);

  }

  watch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void,
  ): void {

    this.#app.watch(name, watcher);

  }
  unwatch<K extends keyof AppValueMap>(
    name: K,
    watcher: (value: AppValueMap[K]) => void,
  ): void {

    this.#app.unwatch(name, watcher);

  }

  hasValue<K extends keyof AppValueMap>(name: K) {

    return this.#app.hasValue(name);

  }

  getValue<K extends keyof AppValueMap>(name: K) {

    return this.#app.getValue(name);

  }

  setValue<K extends keyof AppValueMap>(
    name: K,
    value: AppValueMap[K],
  ): boolean {

    return this.#app.setValue(name, value);

  }

  destroy() {
    this.#whenRegisterMap.forEach((callbacks, pluginName) => {
      callbacks.forEach((callback) =>
        this.#app.cancelWhenRegister(pluginName, callback),
      );
    });

    const { plugins, values, hooks, commands } = this.#registered;
    plugins.forEach((pluginName) => this.#app.unregister(pluginName));
    hooks.forEach((hookList, name) =>
      hookList.forEach((hookFunc) => this.#app.unuseHook(name as any, hookFunc))
    );
    commands.forEach((name) => this.#app.unregisterCommand(name));
    values.forEach((name) => this.#app.unregisterValue(name));
    this.#abortController.abort();
  }

  get signal() {
    return this.#abortController.signal;
  }
}
