const ms = require('ms');
const RefreshToken = require('../models/refresh-token-model');
const { generateRefreshTokenValue, hashTokenValue } = require('../../../utils/token');
const config = require('../../../config');

const getRefreshExpiryDate = () =>
  new Date(Date.now() + ms(config.jwt.refreshExpiresIn || '7d'));

const saveRefreshToken = async ({ userId, userAgent, ipAddress }) => {
  const tokenValue = generateRefreshTokenValue();
  const tokenHash = hashTokenValue(tokenValue);
  const expiresAt = getRefreshExpiryDate();

  const tokenDoc = await RefreshToken.create({
    user: userId,
    tokenHash,
    userAgent,
    ipAddress,
    expiresAt,
  });

  return { tokenDoc, tokenValue };
};

const findActiveRefreshToken = async (tokenValue) => {
  const tokenHash = hashTokenValue(tokenValue);
  const tokenDoc = await RefreshToken.findOne({ tokenHash }).populate({
    path: 'user',
    populate: 'roles',
  });

  if (!tokenDoc) return null;
  if (!tokenDoc.isActive()) return null;

  return tokenDoc;
};

const replaceRefreshToken = async (currentTokenDoc, { userAgent, ipAddress }) => {
  const { tokenDoc, tokenValue } = await saveRefreshToken({
    userId: currentTokenDoc.user._id,
    userAgent,
    ipAddress,
  });
  currentTokenDoc.revokedAt = new Date();
  currentTokenDoc.replacedByToken = tokenDoc.tokenHash;
  await currentTokenDoc.save();
  return { tokenDoc, tokenValue };
};

const deleteRefreshToken = async (tokenValue) => {
  const tokenHash = hashTokenValue(tokenValue);
  await RefreshToken.deleteOne({ tokenHash });
};

module.exports = {
  saveRefreshToken,
  findActiveRefreshToken,
  replaceRefreshToken,
  deleteRefreshToken,
};
