import type { BLPUCode } from "hooks/data/useBLPUCodes";

const fetchBLPUCodesMock: { blpuCodes: BLPUCode[] } = {
  blpuCodes: [
    {
      code: "RH01",
      description: "HMO Parent",
      value: "residential.HMO.parent",
    },
  ],
};

export default fetchBLPUCodesMock;
