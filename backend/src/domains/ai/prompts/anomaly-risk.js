const PROMPT_VERSION = 'u3-v1';

const formatMetricLine = (label, stats) => {
  if (!stats) return `${label}: veri yok`;
  const parts = [];
  if (stats.value !== null && stats.value !== undefined) parts.push(`value ${stats.value}`);
  if (stats.mean !== null && stats.mean !== undefined) parts.push(`mean ${stats.mean}`);
  if (stats.std !== null && stats.std !== undefined) parts.push(`std ${stats.std}`);
  if (stats.zScore !== null && stats.zScore !== undefined) parts.push(`z ${stats.zScore}`);
  if (!parts.length) return `${label}: veri yok`;
  return `${label}: ${parts.join(', ')}`;
};

const buildAnomalyRiskPrompt = ({
  machineName,
  source,
  windowStart,
  windowEnd,
  metricsSnapshot = {},
  affectedMetrics = [],
  baselineSampleCount,
  qualitySummary,
}) => {
  const metricsText = [
    formatMetricLine('temperatureC', metricsSnapshot.temperatureC),
    formatMetricLine('torqueNm', metricsSnapshot.torqueNm),
    formatMetricLine('energyKwh', metricsSnapshot.energyKwh),
  ].join('\n');

  const affectedText = affectedMetrics.length
    ? affectedMetrics
        .map((item) => `${item.metric} z=${item.zScore} (value=${item.value})`)
        .join(', ')
    : '-';

  const qualityText = qualitySummary
    ? `Defect oranı (son 7 gün): ${qualitySummary.defectRatePercent}% (good ${qualitySummary.goodCount}, defect ${qualitySummary.defectCount})`
    : 'Defect verisi yok';

  return `Sen bir uretim analisti asistanisin.
Canli telemetry icin anomali risk uyarisi uret.
Risk seviyesini low/medium/high seklinde ver ve sadece JSON dondur.

JSON Sema
{
  "summary": "kisa ozet",
  "riskLevel": "low|medium|high",
  "affectedMetrics": [
    { "metric": "temperatureC|torqueNm|energyKwh", "value": 0, "zScore": 0, "baselineMean": 0, "baselineStd": 0 }
  ],
  "actions": [{ "title": "aksiyon", "reason": "gerekce" }],
  "warnings": ["..."],
  "qualityNote": "defect korelasyon notu (varsa)"
}

Veri
Makine: ${machineName}
Kaynak: ${source}
Pencere: ${windowStart} - ${windowEnd}
Baseline sample sayisi: ${baselineSampleCount}

Metrik ozeti (value/mean/std/z):
${metricsText}

Anomali olarak isaretlenen metrikler:
${affectedText}

${qualityText}
`;
};

module.exports = {
  PROMPT_VERSION,
  buildAnomalyRiskPrompt,
};
