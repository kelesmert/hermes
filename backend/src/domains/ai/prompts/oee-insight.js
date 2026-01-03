const PROMPT_VERSION = 'u1-v1';

const buildOeeInsightPrompt = ({
  machineName,
  windowLabel,
  source,
  availability,
  performance,
  quality,
  oee,
  plannedTimeMs,
  operatingTimeMs,
  goodCount,
  defectCount,
  topReasons,
  operatorHighlights,
} = {}) => {
  const reasonsText = (topReasons || [])
    .map((item) =>
      `- ${item.label} (${item.code}) ${Math.round(item.durationMs / 60000)} dk ${item.category}`,
    )
    .join('\n');
  const operatorsText = (operatorHighlights || [])
    .map(
      (item) =>
        `- ${item.name} OEE ${(item.oee * 100).toFixed(1)}% (A ${(item.availability * 100).toFixed(1)}%, P ${(item.performance * 100).toFixed(1)}%, Q ${(item.quality * 100).toFixed(1)}%)`,
    )
    .join('\n');

  return `Sen bir uretim analisti asistanisin.
Asagidaki OEE verilerini Turkce kisa bir ozet halinde acikla.

Kurallar
- Maksimum 3 cumle ozet yaz
- En kritik nedeni vurgula
- 1 adet uygulanabilir aksiyon oner
- JSON formatinda yanit ver (sadece JSON)

JSON Sema
{
  "summary": "...",
  "highlights": ["..."],
  "actions": [{ "title": "...", "reason": "..." }],
  "warnings": ["..."]
}

Veri
Makine: ${machineName}
Pencere: ${windowLabel}
Kaynak: ${source}
Availability: ${availability}
Performance: ${performance}
Quality: ${quality}
OEE: ${oee}
PlannedTimeMs: ${plannedTimeMs}
OperatingTimeMs: ${operatingTimeMs}
GoodCount: ${goodCount}
DefectCount: ${defectCount}

Loss Breakdown (Top 3)
${reasonsText || '- veri yok'}

Operator Ozetleri
${operatorsText || '- veri yok'}
`;
};

module.exports = {
  PROMPT_VERSION,
  buildOeeInsightPrompt,
};
