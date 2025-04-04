import { Store } from "pages/FlowEditor/lib/store";

export const mockPassport: Store.Passport = {
  data: {
    "application.fee.calculated": 200,
    "application.fastTrack": ["true"],
  },
};

export const mockPassportWithoutFastTrackAndServiceCharge: Store.Passport = {
  data: {
    "application.fee.calculated": 85, // less than £100 threshold for service charge
  },
};
