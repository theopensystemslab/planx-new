declare module "nanoid-good";

export namespace OT {
  export type Path = Array<string | number>;

  export namespace Object {
    export interface Add {
      p: OT.Path;
      oi: any;
    }
    export interface Remove {
      p: OT.Path;
      od: any;
    }
    export type Replace = OT.Object.Remove & OT.Object.Add;
  }

  export namespace Array {
    export interface Add {
      p: OT.Path;
      li: any;
    }
    export interface Remove {
      p: OT.Path;
      ld: any;
    }
    export type Replace = OT.Array.Remove & OT.Array.Add;
  }

  export type Op =
    | OT.Object.Add
    | OT.Object.Remove
    | OT.Object.Replace
    | OT.Array.Add
    | OT.Array.Remove
    | OT.Array.Replace;
}

export interface ImmerJSONPatch {
  op: "add" | "remove" | "replace";
  path: Array<string | number>;
  value?: any;
}
