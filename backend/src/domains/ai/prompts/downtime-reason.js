const PROMPT_VERSION = 'u2-v2';

const formatMetricLine = (label, stats) => {
  if (!stats) return `${label}: veri yok`;
  const { avg, min, max, last } = stats;
  const parts = [];
  if (avg !== null && avg !== undefined) parts.push(`avg ${avg}`);
  if (min !== null && min !== undefined) parts.push(`min ${min}`);
  if (max !== null && max !== undefined) parts.push(`max ${max}`);
  if (last !== null && last !== undefined) parts.push(`last ${last}`);
  if (!parts.length) return `${label}: veri yok`;
  return `${label}: ${parts.join(', ')}`;
};

const buildDowntimeReasonPrompt = ({
  machineName,
  startedAt,
  endedAt,
  durationMinutes,
  currentReason,
  assignedOperator,
  telemetryBefore = {},
  telemetryDuring = {},
  historySameReason = [],
  reasonBreakdown = [],
} = {}) => {
  const historyText = historySameReason.length
    ? historySameReason
        .map(
          (item) =>
            `- ${item.startedAtLabel} | sure ${item.durationMinutes} dk | operator ${item.operator || '-'} | temp ${item.temperatureC}`,
        )
        .join('\n')
    : '- veri yok';

  const breakdownText = reasonBreakdown.length
    ? reasonBreakdown.map((item) => `- ${item.code}: ${item.count} kez`).join('\n')
    : '- veri yok';

  return `Sen bir uretim analisti asistanisin.
Kapanmis bir durus icin post mortem pattern analizi yapacaksin.
Reason tahmini yapma. Amac: secilmis reason icin "bu tip duruslar hangi kosullarda sik yasaniyor" sorusunu cevaplamak.

JSON Sema
{
  "summary": "kisa ozet",
  "patterns": ["bulgu1", "bulgu2"],
  "actions": [{ "title": "aksiyon", "reason": "gerekce" }],
  "warnings": ["..."]
}

Veri
Makine: ${machineName}
Reason: ${currentReason}
Baslangic: ${startedAt}
Bitis: ${endedAt}
Sure (dk): ${durationMinutes}
Operator: ${assignedOperator || '-'}

Telemetry onceki 10 dk
${formatMetricLine('temperatureC', telemetryBefore.temperatureC)}
${formatMetricLine('torqueNm', telemetryBefore.torqueNm)}
${formatMetricLine('energyKwh', telemetryBefore.energyKwh)}

Telemetry durus boyunca
${formatMetricLine('temperatureC', telemetryDuring.temperatureC)}
${formatMetricLine('torqueNm', telemetryDuring.torqueNm)}
${formatMetricLine('energyKwh', telemetryDuring.energyKwh)}

Son 30 gun ayni reason olaylari (ozet)
${historyText}

Son 30 gun reason dagilimi
${breakdownText}
`;
};

module.exports = {
  PROMPT_VERSION,
  buildDowntimeReasonPrompt,
};
