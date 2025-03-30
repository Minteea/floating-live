const listenerMap = new WeakMap<
  (e: any) => void,
  (e: CustomEvent<any>) => void
>();

function getListenerCallback(listener: (e: any) => void) {
  const existed = listenerMap.get(listener);
  if (existed) return existed;
  const newItem = (e: CustomEvent<any>) => {
    listener(e.detail);
  };
  listenerMap.set(listener, newItem);
  return newItem;
}

export class CustomEventEmitter extends EventTarget {
  on(type: string, listener: (e: any) => void, signal?: AbortSignal) {
    this.addEventListener(
      type,
      getListenerCallback(listener) as EventListener,
      { signal }
    );
  }

  once(type: string, listener: (e: any) => void, signal?: AbortSignal) {
    this.addEventListener(
      type,
      getListenerCallback(listener) as EventListener,
      { once: true, signal }
    );
  }

  off(type: string, listener: (e: any) => void) {
    this.removeEventListener(
      type,
      getListenerCallback(listener) as EventListener
    );
  }

  emit(type: string, detail: any, options?: EventInit) {
    const event = new CustomEvent(type, { detail, ...options });
    this.dispatchEvent(event);
  }
}
