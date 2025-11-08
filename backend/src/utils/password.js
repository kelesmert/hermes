const bcrypt = require('bcryptjs');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

module.exports = {
  hashPassword,
  comparePassword,
};
