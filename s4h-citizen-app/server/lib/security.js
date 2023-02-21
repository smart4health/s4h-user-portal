const OWN_DOMAINS =
  'https://*.data4life.care https://*.gesundheitscloud.de https://*.hpsgc.de https://*.smart4health.eu https://gccdnprod.blob.core.cloudapi.de https://*.data4life.local https://*.smart4health.local';
const CDN = 'https://gccdnprod.blob.core.cloudapi.de';
const AUSWEISAPP_PORT = 'http://127.0.0.1:24727';

const DEFAULT_CSP_VALUES = [
  `default-src 'self' ${OWN_DOMAINS} ${CDN} ${AUSWEISAPP_PORT}`,
  `script-src 'self' ${OWN_DOMAINS} ${CDN} `,
  `style-src 'self' 'unsafe-inline' ${OWN_DOMAINS}`,
  // TODO remove data:
  "img-src 'self' blob: data: https://*.data4life.care https://*.hpsgc.de https://*.smart4health.eu",
  "worker-src 'self' blob:",
  // Block clickjacking.
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",

  // Disallows loading http in https
  'block-all-mixed-content',

  // Sends CSP violations to...
  'report-uri https://<HOSTED_SENTRY_URL>/api/<PROJECT_ID>/security/?sentry_key=<EXAMPLE_PUBLIC_KEY>',
];

module.exports = (req, res, next) => {
  const cspValues = DEFAULT_CSP_VALUES.map(cspValue =>
    cspValue.includes('script-src')
      ? `${cspValue} 'nonce-${res.locals.nonce}'`
      : cspValue
  );
  res.setHeader('content-security-policy', cspValues.join(';'));

  // Prevents browser from guessing what you meant,
  // instead of of trusting your ability to set the
  // proper Content-Type.
  res.setHeader('x-content-type-options', 'nosniff');

  // Additional xss protection, for browsers without CSP support.
  res.setHeader('x-xss-protection', '1;mode=block');

  // Anti-Clickjacking measure for older browsers.
  res.setHeader('x-frame-options', 'DENY');

  // Prevents leakage of information by referrer header.
  res.setHeader('referrer-policy', 'no-referrer');

  // X-DNS-Prefetch-Control could be added.
  // Loss of performance, gain on privacy.

  res.removeHeader('X-Powered-By');

  next();
};
