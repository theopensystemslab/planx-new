export default {
  async fetch(request) {
    const API_URL_EXT = "https://api.editor.planx.dev";

    const getJWT = (request) => {
      const authHeader = request.headers.get("authorization");
      const authHeaderJWT = authHeader?.match(/^Bearer (\S+)$/)?.[1];
      if (authHeaderJWT) return authHeaderJWT;

      const cookies = request.headers.get("cookie");
      const cookieJWT = cookies?.match(/(?:^|;\s*)jwt=([^;]+)(?:;|$)/)?.[1];
      if (cookieJWT) return cookieJWT;
    };

    const validateJWT = async (request) => {
      const response = await fetch(`${API_URL_EXT}/auth/validate-jwt`, {
        method: "GET",
        headers: request.headers
      });

      return response.ok
    };

    try {
      const jwt = getJWT(request);

      // Forward request directly to Hasura
      // Non-JWT requests (admin and public) are validated internally
      if (!jwt) return fetch(request);

      // Requests with a JWT need additional validation via our REST API
      // We check if the token is valid (signed by PlanX) or revoked (user has logged out)
      const isValidToken = await validateJWT(request)
      if (isValidToken) return fetch(request);

      return new Response(`Invalid or revoked token`, { status: 401 });
    } catch (error) {
      return new Response("Error validating token: " + error.message, { status: 500 })
    }
  }
};
