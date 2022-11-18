// Plugin System modified from PicGo

/** 插件可注册对象模块 */
export class Registerable<T> {
  /** 当前安装插件 */
  static currentPlugin: string | null;
  /** 功能列表 */
  private readonly list: Map<string, T>;
  /** 插件与功能名称绑定表 */
  private readonly pluginIdMap: Map<string, string[]>;
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
    this.list = new Map();
    this.pluginIdMap = new Map();
  }

  /** 注册一个对象 */
  register(id: string, item: T): void {
    // 如果组件缺少id, 或者id与已安装插件重复, 则报错
    if (!id) throw new TypeError("id is required!");
    if (this.list.has(id))
      throw new TypeError(`${this.name} duplicate id: ${id}!`);
    // 将组件添加至列表中
    this.list.set(id, item);
    // 将插件名称与注册id关联
    if (Registerable.currentPlugin) {
      if (this.pluginIdMap.has(Registerable.currentPlugin)) {
        this.pluginIdMap.get(Registerable.currentPlugin)?.push(id);
      } else {
        this.pluginIdMap.set(Registerable.currentPlugin, [id]);
      }
    }
  }

  /** 取消某一插件在该模块中的注册 */
  unregister(pluginName: string): void {
    if (this.pluginIdMap.has(pluginName)) {
      const handlerList = this.pluginIdMap.get(pluginName);
      handlerList?.forEach((plugin: string) => {
        this.list.delete(plugin);
      });
    }
  }

  /** 获取名称 */
  getName(): string {
    return this.name;
  }

  /** 根据id获取注册对象 */
  get(id: string): T | undefined {
    return this.list.get(id);
  }

  /** 获取注册对象列表 */
  getList(): T[] {
    return [...this.list.values()];
  }

  /** 获取注册id列表 */
  getIdList(): string[] {
    return [...this.list.keys()];
  }
}

/** 设置当前安装插件名称 */
export const setCurrentPluginName = (name: string | null = null): void => {
  Registerable.currentPlugin = name;
};

/** 获取当前安装插件名称 */
export const getCurrentPluginName = (): string | null => {
  return Registerable.currentPlugin;
};
