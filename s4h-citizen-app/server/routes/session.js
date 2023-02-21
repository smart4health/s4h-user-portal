const superagent = require('superagent');

const { duration: STANDARD_DURATION } = require('../config/session');

const OAUTH_GRANT_TYPE = 'authorization_code';
const OAUTH_REFRESH_TOKEN_TYPE = 'refresh_token';

const OAUTH_SCOPE = `perm:r perm:w rec:r rec:w attachment:r attachment:w user:r user:q`;

const TRACE_ID_HEADER = 'Trace-Id';

exports.create = ({
  clientID,
  clientSecret,

  vegaTokenEndpoint,
  vegaRevokeEndpoint,

  cookieName,
}) => {
  const getRefreshToken = req => {
    const cookie = req[cookieName];
    if (cookie && cookie.rt && cookie.rt.length) {
      return cookie.rt;
    }

    return undefined;
  };

  const makePostRequest = async (endpoint, params, traceId) => {
    try {
      const response = await superagent
        .agent()
        .post(endpoint)
        .type('form')
        .redirects(0)
        .send(params)
        .set(TRACE_ID_HEADER, traceId);

      // eslint-disable-next-line
      console.log(
        new Date().toLocaleTimeString(),
        ' └─ POST',
        endpoint,
        '=>',
        response.status
      );

      return response;
    } catch (err) {
      // eslint-disable-next-line
      console.log(
        new Date().toLocaleTimeString(),
        ' └─ POST',
        endpoint,
        '=>',
        err.status,
        err.message
      );

      throw err;
    }
  };

  // middleware that blocks of sessionless requests
  const hasSession = (req, res, next) => {
    const refreshToken = getRefreshToken(req);
    if (refreshToken) {
      next();
      return;
    }

    return res.sendStatus(401);
  };

  /**
   * This overwrites all cookie values with an empty string. It also revokes the
   * refresh token on the Vega backend, so that it can no longer be used to get new
   * access tokens.
   *
   * @param {string} cookieName - name of the cookie that is stored in the backend session
   */
  const logout = async (req, res) => {
    const refreshToken = getRefreshToken(req);
    if (req[cookieName]) {
      req[cookieName].reset();
    }

    if (refreshToken) {
      try {
        await makePostRequest(
          vegaRevokeEndpoint,
          {
            client_id: clientID,
            client_secret: clientSecret,
            token: refreshToken,
            token_type_hint: OAUTH_REFRESH_TOKEN_TYPE,
          },
          req.header(TRACE_ID_HEADER) || ''
        );
      } catch (err) {
        // we don't abort the logout process if token revocation fails
        // this is because the refresh token will expire on its own
        // it may already be invalid if the revocation fails
        // and forcing the user to stay logged in could have significant disadvantages
        console.error(`Refresh token revocation failed: ${err}`);
      }
    }

    res.sendStatus(204);
  };

  /**
   * Token endpoint is the part of oauth flow handled by the backend
   * since it requires a client_secret to be sent to server.
   * This endpoint can later be extended to refresh access token.
   */
  const refreshToken = async (req, res) => {
    const hasCode = req.body && req.body.code && req.body.code.length;
    if (!hasCode) {
      res.sendStatus(400);
      return;
    }

    try {
      const { code, redirectURI } = req.body;
      const tokenResponse = await makePostRequest(
        vegaTokenEndpoint,
        {
          client_id: clientID,
          client_secret: clientSecret,
          redirect_uri: redirectURI,
          grant_type: OAUTH_GRANT_TYPE,
          code,
          scope: OAUTH_SCOPE,
        },
        req.header(TRACE_ID_HEADER) || ''
      );

      /**
       * Set the refresh token value to the encrypted cookie that is sent on the
       * client.
       */
      req[cookieName].setDuration(STANDARD_DURATION);
      req[cookieName].rt = tokenResponse.body.refresh_token;

      res.status(tokenResponse.status).send({
        access_token: tokenResponse.body.access_token,
      });
    } catch (err) {
      if (!err.status || !err.response) {
        return res.status(500).send(err.message);
      }

      res.sendStatus(400);
    }
  };

  const accessToken = async (req, res) => {
    try {
      const tokenResponse = await makePostRequest(
        vegaTokenEndpoint,
        {
          client_id: clientID,
          client_secret: clientSecret,
          grant_type: OAUTH_REFRESH_TOKEN_TYPE,
          refresh_token: getRefreshToken(req),
        },
        req.header(TRACE_ID_HEADER) || ''
      );

      req[cookieName].extend();
      req[cookieName].rt = tokenResponse.body.refresh_token;

      res.status(tokenResponse.status).send({
        access_token: tokenResponse.body.access_token,
      });
    } catch (err) {
      if (!err.status || !err.response) {
        return res.status(500).send(err.message);
      }

      res.sendStatus(400);
    }
  };

  return {
    refreshToken,
    accessToken,
    logout,
    hasSession,
  };
};
