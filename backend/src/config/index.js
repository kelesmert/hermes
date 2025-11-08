const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  apiPrefix: process.env.API_PREFIX || '/api',
  logLevel: process.env.LOG_LEVEL || 'info',
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    accessExpiresIn: process.env.TOKEN_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
};
