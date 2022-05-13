const { sendSingleApplicationEmail } = require("./utils");

const saveApplication = async (req, res, next) => {
  try {
    const { flowId, email, sessionId } = req.body;
    if (!flowId || !email || !sessionId)
      return next({
        status: 400,
        message: "Required value missing"
      });
    await sendSingleApplicationEmail(res, {flowId, email, sessionId, template: "save"});
  } catch (error) {
    next(error);
  }
};

module.exports = saveApplication;
