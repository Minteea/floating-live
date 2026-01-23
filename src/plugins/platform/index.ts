import { BasePlugin, LivePlatformInfo } from "../..";

interface PluginExposes {
  register(name: string, info: LivePlatformInfo, signal: AbortSignal): void;
  get(name: string): LivePlatformInfo | undefined;
  toSnapshot(): { name: string }[];
}

declare module "../.." {
  interface AppPluginExposesMap {
    platform: PluginExposes;
  }

  interface AppEventDetailMap {
    "platform:register": { name: string; info: LivePlatformInfo };
    "platform:unregister": { name: string };
  }
  interface AppCommandMap {
    "platform.snapshot": () => {
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

  /** 注册直播平台信息 */
  register(name: string, info: LivePlatformInfo, signal?: AbortSignal) {
    if (this.list.has(name)) {
      throw new this.Error("platform:register_duplicated", {
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
        { once: true },
      );
    }
  }
  /** 解除注册直播平台信息 */
  unregister(name: string) {
    if (!this.list.has(name)) {
      throw new this.Error("platform:unregister_unexisted", {
        message: "无法解除不存在的平台信息注册",
      });
    }
    this.list.delete(name);
  }
  /** 获取直播平台信息 */
  get(name: string): LivePlatformInfo | undefined {
    return this.list.get(name);
  }

  expose(): PluginExposes {
    return {
      register: (name: string, info: LivePlatformInfo, signal: AbortSignal) => {
        this.register(name, info, signal);
      },
      get: (name: string) => this.get(name),
      toSnapshot: () => this.toSnapshot(),
    };
  }

  toSnapshot() {
    return [...this.list].map(([name, info]) => ({ name, info }));
  }
}

export default Platform;
