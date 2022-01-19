const { dataMerged } = require("./helpers");

const findInFlow = async (req, res, next) => {
  try {
    const findText = req.params.string;
    const matches = {};

    const flattenedFlow = await dataMerged(req.params.flowId);
    const nodes = Object.keys(flattenedFlow).filter(key => key !== "_root");

    nodes.forEach(node => {
      if (flattenedFlow[node]["data"]) {
        let keys = Object.keys(flattenedFlow[node]["data"]);
        keys.forEach(k => {
          if (flattenedFlow[node]["data"][k] === findText) {
            matches[node] = { data: { 
              [k]: flattenedFlow[node]["data"][k] 
            }};
          }
        });
      }
    });
  
    res.json({
      message: `Found ${Object.keys(matches).length} occurrances of "${findText}" in this flow`,
      matches: matches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { findInFlow };
