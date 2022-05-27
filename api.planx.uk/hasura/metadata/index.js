const axios = require("axios");

/**
 * POST a request to the Hasura Metadata API
 * https://hasura.io/docs/latest/graphql/core/api-reference/metadata-api/index/
 * @param {object} body 
 * @returns {AxiosResponse<any>}
 */
const postToMetadataAPI = async (body) => {
  return await axios.post(
    process.env.HASURA_METADATA_URL,
    JSON.stringify(body),
    {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET
      },
    }
  );
};

/**
 * Set up a new scheduled event in Hasura
 * https://hasura.io/docs/latest/graphql/core/api-reference/metadata-api/scheduled-triggers/#metadata-create-scheduled-event
 * @param {object} args 
 * @returns 
 */
const createScheduledEvent = async (args) => {
  try {
    const data = await postToMetadataAPI({
      type: "create_scheduled_event",
      args: {
        ...args,
        headers: [{
          name: "authorization",
          value_from_env: "HASURA_PLANX_API_KEY"
        }]
      },
      retry_conf: {
        num_retries: 3,
      },
    });
    return data;
  } catch (error) {
    throw new Error(error);
  };
};

module.exports = {
  createScheduledEvent
};