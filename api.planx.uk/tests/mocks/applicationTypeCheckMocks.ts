const setValueApplicationTypeBase = {
  SetValueAppType: {
    data: {
      fn: "application.type",
      val: "",
      operation: "replace",
    },
    type: 380,
  },
};

const questionApplicationTypeBase = {
  ApplicationType: {
    data: {
      fn: "application.type",
      tags: [],
      text: "What kind of is application this?",
      neverAutoAnswer: false,
    },
    type: 100,
    edges: ["LDC", "PP"],
  },
  LDC: {
    data: {
      text: "Lawful development certificate",
      val: "",
    },
    type: 200,
  },
  PP: {
    data: {
      text: "Planning permission",
      val: "",
    },
    type: 200,
  },
};

const checklistApplicationTypeBase = {
  ChecklistAppType: {
    data: {
      fn: "application.type",
      text: "App Type",
      allRequired: false,
      neverAutoAnswer: false,
    },
    type: 105,
    edges: ["Outline"],
  },
  Outline: {
    data: {
      val: "",
      text: "Planning permission outline",
    },
    type: 200,
  },
};

export const setValueApplicationTypePass = {
  SetValueAppType: {
    ...setValueApplicationTypeBase.SetValueAppType,
    data: {
      ...setValueApplicationTypeBase.SetValueAppType.data,
      val: "pp.full.major",
    },
  },
};

export const setValueApplicationTypeFail = {
  SetValueAppType: {
    ...setValueApplicationTypeBase.SetValueAppType,
    data: {
      ...setValueApplicationTypeBase.SetValueAppType.data,
      val: "not.an.app.type",
    },
  },
};

export const questionApplicationTypePass = {
  ApplicationType: { ...questionApplicationTypeBase.ApplicationType },
  LDC: {
    ...questionApplicationTypeBase.LDC.data,
    val: "ldc.listedBuildingWorks",
  },
  PP: { ...questionApplicationTypeBase.PP.data, val: "pp.full" },
};

export const questionApplicationTypeFail = {
  ApplicationType: { ...questionApplicationTypeBase.ApplicationType },
  LDC: { ...questionApplicationTypeBase.LDC.data, val: "not.an.app.type" },
  PP: { ...questionApplicationTypeBase.PP.data, val: "not.an.app.type" },
};

export const checklistApplicationTypePass = {
  ApplicationType: { ...checklistApplicationTypeBase.ChecklistAppType },
  Outline: { ...checklistApplicationTypeBase.Outline.data, val: "pp.outline" },
};

export const checklistApplicationTypeFail = {
  ApplicationType: { ...checklistApplicationTypeBase.ChecklistAppType },
  Outline: {
    ...checklistApplicationTypeBase.Outline.data,
    val: "not.an.app.type",
  },
};
