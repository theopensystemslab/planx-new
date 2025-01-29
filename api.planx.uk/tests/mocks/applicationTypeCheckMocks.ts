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

export const questionApplicationTypePass = {
  ApplicationType: { ...questionApplicationTypeBase.ApplicationType },
  LDC: {
    data: {
      ...questionApplicationTypeBase.LDC.data,
      val: "ldc.listedBuildingWorks",
    },
  },
  PP: { data: { ...questionApplicationTypeBase.PP.data, val: "pp.full" } },
};

export const checklistApplicationTypePass = {
  ApplicationType: { ...checklistApplicationTypeBase.ChecklistAppType },
  Outline: {
    data: { ...checklistApplicationTypeBase.Outline.data, val: "pp.outline" },
  },
};
export const applicationTypeFail = {
  SetValueAppType: {
    ...setValueApplicationTypeBase.SetValueAppType,
    data: {
      ...setValueApplicationTypeBase.SetValueAppType.data,
      val: "pj.jam.major",
    },
  },
  ApplicationType: { ...checklistApplicationTypeBase.ChecklistAppType },
  Outline: {
    data: { ...checklistApplicationTypeBase.Outline.data, val: "pj.bagels" },
  },
  QuestionType: { ...questionApplicationTypeBase.ApplicationType },
  LDC: {
    data: {
      ...questionApplicationTypeBase.LDC.data,
      val: "pda.toomuch",
    },
  },
  PP: { data: { ...questionApplicationTypeBase.PP.data, val: "pj.bagels" } },
};
