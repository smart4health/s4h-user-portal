const router = require('express').Router();
const { create } = require('./session');
const { liveness, readiness } = require('./probes');

module.exports = ({
  clientID,
  clientSecret,
  vegaTokenEndpoint,
  vegaRevokeEndpoint,

  cookieName,
}) => {
  // oauth token handling
  const { logout, refreshToken, accessToken, hasSession } = create({
    clientID,
    clientSecret,
    vegaTokenEndpoint,
    vegaRevokeEndpoint,
    cookieName,
  });

  router.get('/probes/liveness', liveness);
  router.get('/probes/readiness', readiness);

  router.use('/auth/token', refreshToken);
  router.use('/access_token', hasSession, accessToken);
  router.use('/logout', logout);

  return router;
};
