const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config');

const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({ message: 'MES API calisiyor', api: config.apiPrefix });
});

app.use(config.apiPrefix, routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Kaynak bulunamadi', path: req.originalUrl });
});

// Basit hata yakalama katmanı
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(err); // minimum logging, ileride logger eklenecek
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Beklenmeyen bir hata oluştu.',
    ...(config.env !== 'production' && { stack: err.stack }),
  });
});

module.exports = app;
