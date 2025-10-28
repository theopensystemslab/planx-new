// Polyfill for ProgressEvent - missing from JSDOM
(globalThis as any).ProgressEvent = class ProgressEvent extends Event {
  lengthComputable: boolean;
  loaded: number;
  total: number;

  constructor(type: string, eventInitDict: ProgressEventInit = {}) {
    super(type, eventInitDict);
    this.lengthComputable = eventInitDict.lengthComputable || false;
    this.loaded = eventInitDict.loaded || 0;
    this.total = eventInitDict.total || 0;
  }
};
