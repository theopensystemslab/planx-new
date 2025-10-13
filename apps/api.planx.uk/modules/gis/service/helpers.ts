// Adds "designated" variable to response object, so we can auto-answer less granular questions like "are you on designated land"
const addDesignatedVariable = (responseObject: any) => {
  const resObjWithDesignated = {
    ...responseObject,
    designated: { value: false },
  };

  const subVariables = ["conservationArea", "AONB", "nationalPark", "WHS"];

  // If any of the subvariables are true, then set "designated" to true
  subVariables.forEach((s) => {
    if (resObjWithDesignated[`designated.${s}`]?.value) {
      resObjWithDesignated["designated"] = { value: true };
    }
  });

  // Ensure that our response includes all the expected subVariables before returning "designated"
  //   so we don't incorrectly auto-answer any questions for individual layer queries that may have failed
  let subVariablesFound = 0;
  Object.keys(responseObject).forEach((key) => {
    if (key.startsWith(`designated.`)) {
      subVariablesFound++;
    }
  });

  if (subVariablesFound < subVariables.length) {
    return responseObject;
  } else {
    return resObjWithDesignated;
  }
};

export { addDesignatedVariable };
