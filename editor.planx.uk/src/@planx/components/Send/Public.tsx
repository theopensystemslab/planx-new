import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import Card from "../shared/Preview/Card";
import { PublicProps } from "../ui";
import type { Send } from "./model";

export type Props = PublicProps<Send>;

const placeholderize = (x: any) => {
  if ((x && typeof x === "string") || x instanceof String) {
    if (new Date(String(x)).toString() === "Invalid Date") {
      return "PLACEHOLDER";
    } else {
      return new Date().toISOString();
    }
  } else if ((x && typeof x === "number") || x instanceof Number) {
    return 0;
  } else if ((x && typeof x === "object") || x instanceof Object) {
    return Object.entries(x).reduce((acc, [k, v]) => {
      acc[k] = placeholderize(v);
      return acc;
    }, x);
  } else {
    return x;
  }
};

const date = new Date().toUTCString();

const json = {
  id: uuid(),
  reference: null,
  related_cases: null,
  ownership_type: null,
  owner_first_name: null,
  owner_second_name: null,
  applicant_first_name: "John",
  applicant_last_name: "Rees",
  applicant_phone: null,
  applicant_email: "john@example.com",
  agent_first_name: null,
  agent_last_name: null,
  agent_phone: null,
  agent_email: null,
  owner_company: null,
  owner_shares: null,
  owner_types: null,
  owners_notified: null,
  nonnotification_reason: null,
  visit_contact_name: null,
  visit_contact_phone: null,
  visit_contact_email: null,
  pre_app_advice: false,
  pre_app_reference: null,
  pre_app_officer: null,
  advice_date: null,
  advice_summary: null,
  fee: 0,
  disability_exemption: false,
  fee_paid: true,
  refund_requested: false,
  fee_refunded: false,
  description: null,
  recommendation: null,
  started: false,
  start_date: date,
  completed: false,
  completion_date: null,
  footprint_removed: null,
  new_footprint: null,
  net_footprint: null,
  internal_area_removed: null,
  new_internal_area: null,
  net_internal_area: null,
  uses: null,
  uses_areas: null,
  uses_percentages: null,
  new_home: null,
  case_officer: null,
  community_council: "Southwark",
  ward: "Southwark",
  last_advert_date: date,
  advert_expiry_date: date,
  last_posted_date: date,
  site_expiry_date: date,
  site: {
    uprn: "200003453480",
    property_name: null,
    address_1: "47 COBOURG ROAD",
    address_2: null,
    address_3: null,
    town: "London",
    postcode: "SE5 0HU",
    easting: null,
    northing: null,
    property_boundary: null,
    property_area: null,
    boundary: null,
    area: null,
    description: "HMO Parent",
    number_buildings: null,
    property_type: "RH01",
    building_type: null,
    storeys: null,
    uses: null,
    uses_areas: null,
    uses_percentages: null,
    uses_status: null,
    uses_evidence: null,
    photographs: null,
  },
  applicant: {
    type: 0,
    title: "Mr",
    first_name: "John",
    last_name: "Rees",
    company_name: "Open Systems Lab",
    company_number: null,
    resident_status: true,
    address_1: "47 COBOURG ROAD",
    address_2: "Southwark",
    address_3: null,
    town: "London",
    postcode: "SE5 0HU",
    country: "United Kingdom",
    phone: null,
    phone_2: null,
    email: "john@example.com",
  },
  agent: {},
  plans: [],
  constraints: {},
  declarations: {},
  questions: {},
};

const SendComponent: React.FC<Props> = (props) => {
  const [replay, passport] = useStore((state) => [
    state.replay,
    state.passport,
  ]);

  useEffect(() => {
    async function send() {
      try {
        const data = json;

        data.site.uprn = passport.info.UPRN.toString();

        data.site.address_1 = [
          passport.info.sao,
          passport.info.pao,
          passport.info.street,
        ]
          .filter(Boolean)
          .join(" ");

        data.site.postcode = passport.info.postcode;

        data.questions = replay;

        data.constraints = (
          passport.data["property.constraints.planning"] || []
        ).reduce((acc: Record<string, boolean>, curr: string) => {
          acc[curr] = true;
          return acc;
        }, {});

        data.site.easting = passport.info.x;
        data.site.northing = passport.info.y;

        data.site.description = passport.info.planx_description;
        data.site.property_type = passport.info.blpu_code;

        await axios.post(props.url, data);

        if (props.handleSubmit) props.handleSubmit();
      } catch (err) {
        alert("There was an error sending the data");
        console.error(err);
      }
    }

    send();
  }, []);

  return <Card>Sending data...</Card>;
};

export default SendComponent;
