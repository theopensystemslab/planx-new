import { sendSingleApplicationEmail } from "./utils";

const sendSaveAndReturnEmail = async (req, res, next) => {
  try {
    const { email, sessionId } = req.body.payload;
    const template = req.params.template;
    if (!email || !sessionId)
      return next({
        status: 400,
        message: "Required value missing"
      });
    const response = await sendSingleApplicationEmail(template, email, sessionId);
    return res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to send ${req.params.template} email. ${error.message}`
    });
  };
};

export { sendSaveAndReturnEmail };
