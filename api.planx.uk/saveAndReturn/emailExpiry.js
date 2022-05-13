const { sendSingleApplicationEmail } = require("./utils");

const emailExpiry = async (req, res, next) => {
  try {
    const { flowId, email, sessionId } = req.body?.payload;
    if (!flowId || !email || !sessionId)
      return next({
        status: 400,
        message: "Malformed event, required values missing"
      });
    await sendSingleApplicationEmail(res, next, { flowId, email, sessionId, template: "expiry" });
  } catch (error) {
    next(error);
  }
};

module.exports = emailExpiry;