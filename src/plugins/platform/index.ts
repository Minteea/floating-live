import { bindCommand } from "~/utils";
import { appError, BasePlugin, LivePlatformInfo, PluginContext } from "../..";

interface PluginExposes {
  register(name: string, info: LivePlatformInfo, signal: AbortSignal): void;
  get(name: string): LivePlatformInfo | undefined;
  info(name: string): LivePlatformInfo | undefined;
  getData(): { name: string }[];
}

declare module "../.." {
  interface AppPluginExposesMap {
    platform: PluginExposes;
  }

  interface AppEventDetailMap {
    "platform:register": { name: string; info: LivePlatformInfo };
    "platform:unregister": { name: string };
  }

  interface AppCommandAliasMap {
    platform: "platform.info";
  }
  interface AppCommandMap {
    "platform.info": (name: string) => LivePlatformInfo | undefined;
    "platform.getData": () => {
      name: string;
      info: LivePlatformInfo;
    }[];
  }
  interface AppSnapshotMap {
    platform: {
      name: string;
      info: LivePlatformInfo;
    }[];
  }
}

export class Platform extends BasePlugin {
  static pluginName = "platform";
  private list = new Map<string, LivePlatformInfo>();

  init(ctx: PluginContext) {
    ctx.registerCommand("platform.getData", this.getData.bind(this));
    ctx.registerCommand("platform.info", bindCommand(this.info, this));

    ctx.registerCommandAlias("platform", "platform.info");
  }

  /** 注册直播平台信息 */
  register(name: string, info: LivePlatformInfo, signal?: AbortSignal) {
    if (this.list.has(name)) {
      throw appError("platform:register_duplicated", {
        message: "平台信息重复注册",
      });
    }
    this.list.set(name, info);
    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          this.unregister(name);
        },
        { once: true, signal: this.ctx.signal },
      );
    }
  }
  /** 解除注册直播平台信息 */
  unregister(name: string) {
    if (!this.list.has(name)) {
      throw appError("platform:unregister_unexisted", {
        message: "无法解除不存在的平台信息注册",
      });
    }
    this.list.delete(name);
  }
  /** 直接获取直播平台信息 */
  get(name: string): LivePlatformInfo | undefined {
    return this.list.get(name);
  }

  /** 获取直播平台信息 */
  info(name: string): LivePlatformInfo | undefined {
    return structuredClone(this.list.get(name));
  }

  expose(): PluginExposes {
    return {
      register: (name: string, info: LivePlatformInfo, signal: AbortSignal) => {
        this.register(name, info, signal);
      },
      get: (name: string) => this.get(name),
      info: (name: string) => this.info(name),
      getData: () => this.getData(),
    };
  }

  getData() {
    return [...this.list].map(([name, info]) => ({ name, info }));
  }
}

export default Platform;
