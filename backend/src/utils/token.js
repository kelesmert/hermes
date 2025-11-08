const crypto = require('crypto');

const generateRefreshTokenValue = () => crypto.randomBytes(64).toString('hex');

const hashTokenValue = (tokenValue) =>
  crypto.createHash('sha256').update(tokenValue).digest('hex');

module.exports = {
  generateRefreshTokenValue,
  hashTokenValue,
};
