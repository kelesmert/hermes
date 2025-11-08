const mongoose = require('mongoose');
const config = require('./index');

mongoose.set('strictQuery', true);

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI tanımlı değil. Lütfen .env dosyasını kontrol edin.');
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true,
    dbName: process.env.MONGO_DB_NAME || undefined,
  });

  if (config.env !== 'production') {
    console.log('MongoDB bağlantısı kuruldu'); // eslint-disable-line no-console
  }

  return mongoose.connection;
};

module.exports = {
  connectDatabase,
};
