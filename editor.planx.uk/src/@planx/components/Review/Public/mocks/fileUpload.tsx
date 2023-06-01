export const mockLink = "my-file.png";
export const uploadedPlanUrl = "http://someurl.com/whjhnh65/plan.png";

export const fileUploadBreadcrumbs = {
  fileUpload: {
    auto: false,
    data: {
      fileUpload: [
        {
          filename: "my-file.png",
        },
      ],
    },
  },
};

export const fileUploadFlow = {
  _root: {
    edges: ["fileUpload", "review"],
  },
  review: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
  fileUpload: {
    data: {
      color: "#EFEFEF",
    },
    type: 140,
  },
};

export const fileUploadPassport = {
  data: {
    fileUpload: [
      {
        serverFile: {
          fileHash:
            "8c91f81b213865af9632d2296039984753f0e41cfe234ba1dce65ad58568209b",
          fileId: "0702enth/my-file.png",
        },
        filename: "my-file.png",
      },
    ],
  },
};

export const uploadedPlansBreadcrumb = {
  IHTyNVZqon: {
    auto: false,
    data: {
      _address: {
        uprn: "200003453481",
        blpu_code: "2",
        latitude: 51.4858354,
        longitude: -0.0761504,
        organisation: null,
        pao: "49",
        street: "COBOURG ROAD",
        town: "LONDON",
        postcode: "SE5 0HU",
        x: 533676,
        y: 178075,
        planx_description: "Terrace",
        planx_value: "residential.dwelling.house.terrace",
        single_line_address: "49, COBOURG ROAD, LONDON, SOUTHWARK, SE5 0HU",
        title: "49, COBOURG ROAD, LONDON",
      },
      "property.type": ["residential.dwelling.house.terrace"],
      "property.localAuthorityDistrict": ["Southwark"],
      "property.region": ["London"],
    },
  },
  EO6DzPso8o: {
    auto: false,
    data: {
      "proposal.drawing.locationPlan": [
        {
          file: {
            path: "fut.email.png",
          },
          status: "success",
          progress: 1,
          id: "u6jFS4xJ-MM9Gsg1o2ZsI",
          url: uploadedPlanUrl,
        },
      ],
    },
  },
};

export const uploadedPlansPassport = {
  data: {
    _address: {
      uprn: "200003453481",
      blpu_code: "2",
      latitude: 51.4858354,
      longitude: -0.0761504,
      organisation: null,
      pao: "49",
      street: "COBOURG ROAD",
      town: "LONDON",
      postcode: "SE5 0HU",
      x: 533676,
      y: 178075,
      planx_description: "Terrace",
      planx_value: "residential.dwelling.house.terrace",
      single_line_address: "49, COBOURG ROAD, LONDON, SOUTHWARK, SE5 0HU",
      title: "49, COBOURG ROAD, LONDON",
    },
    "property.type": ["residential.dwelling.house.terrace"],
    "property.localAuthorityDistrict": ["Southwark"],
    "property.region": ["London"],
    "proposal.drawing.locationPlan": [
      {
        file: {
          path: "fut.email.png",
        },
        status: "success",
        progress: 1,
        id: "u6jFS4xJ-MM9Gsg1o2ZsI",
        url: uploadedPlanUrl,
      },
    ],
  },
};

export const drawBoundaryFlow = {
  _root: {
    edges: ["IHTyNVZqon", "EO6DzPso8o", "ZNUl9Kr2ib"],
  },
  EO6DzPso8o: {
    data: {
      title: "Draw the boundary of the property",
      dataFieldArea: "property.boundary.area",
      hideFileUpload: false,
      dataFieldBoundary: "property.boundary.site",
      titleForUploading: "Upload a location plan",
    },
    type: 10,
  },
  IHTyNVZqon: {
    data: {
      description: "<p>For example CM7 3YL</p>",
    },
    type: 9,
  },
  ZNUl9Kr2ib: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
};
