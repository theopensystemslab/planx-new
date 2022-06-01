const { sendSingleApplicationEmail } = require("./utils");

const sendSaveAndReturnEmail = async (req, res, next) => {
  try {
    const { email, sessionId } = req.body.payload;
    const template = req.params.template;
    if (!email || !sessionId)
      return next({
        status: 400,
        message: "Required value missing"
      });
    await sendSingleApplicationEmail(res, template, email, sessionId);
  } catch (error) {
    next(error);
  };
};

module.exports = { sendSaveAndReturnEmail };
