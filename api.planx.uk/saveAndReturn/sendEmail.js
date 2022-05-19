const { sendSingleApplicationEmail, singleSessionEmailTemplates } = require("./utils");

const sendSaveAndReturnEmail = async (req, res, next) => {
  try {
    const { email, sessionId, template } = req.body;
    if (!email || !sessionId || !template)
      return next({
        status: 400,
        message: "Required value missing"
      });
    const validTemplates = Object.keys(singleSessionEmailTemplates);
    if (!validTemplates.includes(template)) {
      return next({
        status: 400,
        message: `Invalid template - must be one of [${validTemplates.join(', ')}]`
      });
    };
    await sendSingleApplicationEmail(res, template, email, sessionId);
  } catch (error) {
    next(error);
  };
};

module.exports = sendSaveAndReturnEmail;