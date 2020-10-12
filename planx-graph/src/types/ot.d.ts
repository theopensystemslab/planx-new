export namespace OT {
  export type path = Array<string | number>;

  export namespace Object {
    export interface Add {
      p: OT.path;
      oi: any;
    }
    export interface Remove {
      p: OT.path;
      od: any;
    }
    export interface Replace {
      p: OT.path;
      od: any;
      oi: any;
    }
  }

  export namespace Array {
    export interface Add {
      p: OT.path;
      li: any;
    }
    export interface Remove {
      p: OT.path;
      ld: any;
    }
    export interface Replace {
      p: OT.path;
      ld: any;
      li: any;
    }
  }

  export type Op =
    | OT.Object.Add
    | OT.Object.Remove
    | OT.Object.Replace
    | OT.Array.Add
    | OT.Array.Remove
    | OT.Array.Replace;
}
