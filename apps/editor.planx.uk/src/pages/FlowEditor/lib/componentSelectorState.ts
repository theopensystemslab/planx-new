type State = { open: boolean; parent?: string; before?: string };

let _state: State = { open: false };
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((l) => l());
}

export const componentSelectorState = {
  open(params: { parent?: string; before?: string }) {
    _state = { open: true, ...params };
    notify();
  },
  close() {
    _state = { open: false };
    notify();
  },
  getSnapshot: () => _state,
  subscribe(listener: () => void) {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },
};
