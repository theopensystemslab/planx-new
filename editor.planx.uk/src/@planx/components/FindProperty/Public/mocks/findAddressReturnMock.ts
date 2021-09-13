import { FIND_ADDRESS } from "..";

export default [
  {
    request: {
      query: FIND_ADDRESS,
      variables: {
        postcode: "SE5 0HU",
      },
    },
    result: {
      data: {
        addresses: [
          {
            __typename: "addresses",
            uprn: "10009794876",
            town: "LONDON",
            y: 177993.1576962067,
            x: 533675.7866412636,
            street: "COBOURG ROAD",
            sao: "",
            postcode: "SE5 0HU",
            pao: "75",
            organisation: "",
            blpu_code: "RD",
            latitude: "51.4850999",
            longitude: "-0.0761844",
            single_line_address: "75 COBOURG ROAD, LONDON, SE5 0HU",
          },
          {
            __typename: "addresses",
            uprn: "200003497830",
            town: "LONDON",
            y: 177898.62376470293,
            x: 533662.1449918789,
            street: "COBOURG ROAD",
            sao: "",
            postcode: "SE5 0HU",
            pao: "103",
            organisation: "",
            blpu_code: "PP",
            latitude: "51.4842536",
            longitude: "-0.0764165",
            single_line_address: "103 COBOURG ROAD, LONDON, SE5 0HU",
          },
        ],
      },
    },
  },
];
