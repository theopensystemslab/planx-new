type Rect = { top: number; bottom: number; left: number; right: number };

let _rect: Rect | null = null;

export const hangerAnchor = {
  set: (rect: Rect) => {
    _rect = rect;
  },
  get: () => _rect,
};
