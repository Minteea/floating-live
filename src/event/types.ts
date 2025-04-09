export interface AppEventEmitOptions {
  /** 事件来源 */
  source?: string;
  /** 远程事件 */
  remote?: boolean;
}

export interface AppEventBaseDetail {
  /** 事件来源 */
  source?: string;
  /** 远程事件 */
  remote?: boolean;
}

export type AppEventDetail<T> = T & AppEventBaseDetail;

export type AppEventListener<T> = (e: AppEventDetail<T>) => void;

export interface AppEventDetailMap {
  "command:register": { name: string };
  "command:unregister": { name: string };

  "plugin:register": { pluginName: string };
  "plugin:unregister": { pluginName: string };

  "value:register": { name: string; value: any };
  "value:change": { name: string; value: any };
  "value:unregister": { name: string };

  event: { name: string; detail: AppEventDetail<any> };
  error: { error: Error };

  [name: `change:${string}`]: { value: any };
}
