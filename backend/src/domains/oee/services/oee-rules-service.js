const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, '../config/oee-rules.json');

const loadRules = () => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('OEE konfigürasyonu okunamadı, varsayılan değerler kullanılacak.', error.message);
    return {};
  }
};

const rules = loadRules();

const getReasonCatalog = () => rules.reasonCatalog || [];

module.exports = {
  getReasonCatalog,
};

