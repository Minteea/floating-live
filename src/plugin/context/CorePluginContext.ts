import { App } from "../..";
import { CommonPluginContext } from "./CommonPluginContext";

/** 核心插件，具有对程序的访问权限 */
export class CorePluginContext extends CommonPluginContext {
  #app: App;
  constructor(app: App, pluginName: string) {
    super(app, pluginName);
    this.#app = app;
  }
  get app() {
    return this.#app;
  }
}
