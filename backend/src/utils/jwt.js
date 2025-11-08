const jwt = require('jsonwebtoken');
const config = require('../config');

if (!config.jwt.accessSecret) {
  throw new Error('JWT_SECRET tanımlı değil. Lütfen .env dosyasını kontrol edin.');
}

const signAccessToken = (payload = {}) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
