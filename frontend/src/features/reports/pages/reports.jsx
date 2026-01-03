import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import { fetchOeeStats } from '@/features/reports/services/oee-api.js';
import { createOeeInsight, fetchLatestAiInsight } from '@/lib/api/ai-api.js';
import { formatDate, formatDateTime } from '@/lib/date-format.js';
import { storage } from '@/lib/storage.js';

const REPORTS_FILTERS_KEY = 'reports.filters';

const MODE_OPTIONS = [
  { id: 'shift', label: 'Shift' },
  { id: 'range', label: 'Tarih Aralığı' },
];

const SOURCE_OPTIONS = [
  { id: 'shift-sim', label: 'Shift Sim' },
  { id: 'data-gen', label: 'Data Gen' },
  { id: 'mock-batch', label: 'Mock Batch' },
  { id: 'auto', label: 'Auto' },
];

const TREND_OPTIONS = [
  { id: 'week', label: 'Haftalık' },
  { id: 'month', label: 'Aylık' },
];

const formatNumber = (value, fractionDigits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return Number(value).toLocaleString('tr-TR', { maximumFractionDigits: fractionDigits });
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `%${formatNumber(value * 100, 1)}`;
};

const formatDurationMs = (value) => {
  if (value === null || value === undefined) return '-';
  const minutes = value / 60000;
  if (minutes < 60) return `${formatNumber(minutes, 1)} dk`;
  const hours = minutes / 60;
  return `${formatNumber(hours, 1)} sa`;
};

const formatUserName = (user) => {
  if (!user) return '';
  if (user.label) return user.label;
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.username || '';
};

const parseShiftDate = (value) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const toShiftDate = (date) => date.toISOString().slice(0, 10);

const toIsoString = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const isWeekendDate = (date) => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

const ReportsPage = () => {
  const storedFilters = storage.get(REPORTS_FILTERS_KEY);
  const [selectedMachineId, setSelectedMachineId] = useState(
    () => storedFilters?.selectedMachineId || '',
  );
  const [mode, setMode] = useState(() => storedFilters?.mode || 'shift');
  const [source, setSource] = useState(() => storedFilters?.source || 'mock-batch');
  const [shiftDate, setShiftDate] = useState(
    () => storedFilters?.shiftDate || '2025-05-05',
  );
  const [rangeFrom, setRangeFrom] = useState(
    () => storedFilters?.rangeFrom || '2025-05-05T00:00',
  );
  const [rangeTo, setRangeTo] = useState(
    () => storedFilters?.rangeTo || '2025-06-11T23:59',
  );
  const [trendScope, setTrendScope] = useState(
    () => storedFilters?.trendScope || 'week',
  );

  const machinesQuery = useQuery({
    queryKey: ['machines', 'reports'],
    queryFn: fetchMachines,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!machinesQuery.data?.length) return;
    if (selectedMachineId) {
      const exists = machinesQuery.data.some(
        (machine) => (machine.id || machine._id) === selectedMachineId,
      );
      if (exists) return;
    }
    const mch001 = machinesQuery.data.find(
      (machine) => String(machine.code || '').toLowerCase() === 'mch-001',
    );
    setSelectedMachineId(
      mch001?.id || mch001?._id || machinesQuery.data[0].id || machinesQuery.data[0]._id,
    );
  }, [machinesQuery.data, selectedMachineId]);

  useEffect(() => {
    storage.set(REPORTS_FILTERS_KEY, {
      selectedMachineId,
      mode,
      source,
      shiftDate,
      rangeFrom,
      rangeTo,
      trendScope,
    });
  }, [mode, rangeFrom, rangeTo, selectedMachineId, shiftDate, source, trendScope]);

  const queryParams = useMemo(() => {
    if (!selectedMachineId) return null;
    const params = {
      machineId: selectedMachineId,
      mode,
      source,
    };
    if (mode === 'shift') {
      if (shiftDate) {
        params.shiftDate = shiftDate;
      }
      return params;
    }
    const from = toIsoString(rangeFrom);
    const to = toIsoString(rangeTo);
    if (!from || !to) return null;
    return {
      ...params,
      from,
      to,
    };
  }, [mode, rangeFrom, rangeTo, selectedMachineId, shiftDate, source]);

  const statsQuery = useQuery({
    queryKey: ['oeeStats', selectedMachineId, mode, shiftDate, rangeFrom, rangeTo, source],
    queryFn: () => fetchOeeStats(queryParams),
    enabled: Boolean(queryParams),
  });

  const resolvedShiftDate = useMemo(() => {
    if (mode !== 'shift') return null;
    if (shiftDate) return shiftDate;
    if (statsQuery.data?.windowStart) {
      const anchor = new Date(statsQuery.data.windowStart);
      if (!Number.isNaN(anchor.getTime())) {
        return toShiftDate(anchor);
      }
    }
    return null;
  }, [mode, shiftDate, statsQuery.data?.windowStart]);

  const aiQueryParams = useMemo(() => {
    if (!selectedMachineId) return null;
    if (mode === 'shift') {
      if (!resolvedShiftDate) return null;
      return {
        useCase: 'oee-insight',
        machineId: selectedMachineId,
        source,
        mode: 'shift',
        shiftDate: resolvedShiftDate,
        checkStale: 1,
      };
    }
    const from = toIsoString(rangeFrom);
    const to = toIsoString(rangeTo);
    if (!from || !to) return null;
    return {
      useCase: 'oee-insight',
      machineId: selectedMachineId,
      source,
      mode: 'range',
      from,
      to,
      checkStale: 1,
    };
  }, [mode, rangeFrom, rangeTo, resolvedShiftDate, selectedMachineId, source]);

  const aiLatestQuery = useQuery({
    queryKey: ['aiInsightLatest', aiQueryParams],
    queryFn: () => fetchLatestAiInsight(aiQueryParams),
    enabled: Boolean(aiQueryParams),
  });

  const aiMutation = useMutation({
    mutationFn: createOeeInsight,
  });

  const aiInsight = aiMutation.data?.insight || aiLatestQuery.data;
  const aiOutput = aiInsight?.output || {};
  const aiActions = Array.isArray(aiOutput.actions) ? aiOutput.actions : [];
  const aiHighlights = Array.isArray(aiOutput.highlights) ? aiOutput.highlights : [];
  const aiWarnings = Array.isArray(aiOutput.warnings) ? aiOutput.warnings : [];
  const aiIsStale = Boolean(aiInsight?.isStale);
  const aiRateLimitMeta = aiMutation.data?.rateLimitMeta;
  const aiCacheHit = aiMutation.data?.cacheHit;

  const aiPayload = useMemo(() => {
    if (!selectedMachineId) return null;
    const payload = {
      machineId: selectedMachineId,
      source,
      mode,
    };
    if (mode === 'shift') {
      if (!resolvedShiftDate) return null;
      payload.shiftDate = resolvedShiftDate;
      return payload;
    }
    const from = toIsoString(rangeFrom);
    const to = toIsoString(rangeTo);
    if (!from || !to) return null;
    return {
      ...payload,
      from,
      to,
    };
  }, [mode, rangeFrom, rangeTo, resolvedShiftDate, selectedMachineId, source]);

  const handleAiAnalyze = (forceRefresh = false) => {
    if (!aiPayload || aiMutation.isLoading) return;
    aiMutation.mutate({ ...aiPayload, forceRefresh });
  };

  const trendAnchorDate = useMemo(() => {
    if (shiftDate) {
      return parseShiftDate(shiftDate);
    }
    if (statsQuery.data?.windowStart) {
      const anchor = new Date(statsQuery.data.windowStart);
      if (!Number.isNaN(anchor.getTime())) {
        return parseShiftDate(toShiftDate(anchor));
      }
    }
    return parseShiftDate(toShiftDate(new Date()));
  }, [shiftDate, statsQuery.data?.windowStart]);

  const trendQuery = useQuery({
    queryKey: [
      'oeeTrend',
      selectedMachineId,
      source,
      trendScope,
      trendAnchorDate?.toISOString(),
    ],
    enabled: Boolean(selectedMachineId && trendAnchorDate),
    queryFn: async () => {
      const totalDays = trendScope === 'month' ? 30 : 7;
      const dates = [];
      for (let i = 0; i < totalDays; i += 1) {
        const candidate = addDays(trendAnchorDate, i);
        if (isWeekendDate(candidate)) continue;
        dates.push(candidate);
      }

      const results = await Promise.allSettled(
        dates.map((date) =>
          fetchOeeStats({
            machineId: selectedMachineId,
            mode: 'shift',
            shiftDate: toShiftDate(date),
            source,
          }),
        ),
      );

      const points = [];
      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') return;
        points.push({
          ...result.value,
          date: toShiftDate(dates[index]),
        });
      });

      let plannedTime = 0;
      let operatingTime = 0;
      let totalCount = 0;
      let goodCount = 0;
      let defectCount = 0;
      let totalIdealTime = 0;
      let coverageDays = 0;

      points.forEach((item) => {
        if (!item || item.plannedTime <= 0) return;
        coverageDays += 1;
        plannedTime += item.plannedTime;
        operatingTime += item.operatingTime;
        totalCount += item.totalCount;
        goodCount += item.goodCount;
        defectCount += item.defectCount;
        if (item.performance !== null && item.operatingTime > 0) {
          totalIdealTime += item.performance * item.operatingTime;
        }
      });

      const availability = plannedTime > 0 ? operatingTime / plannedTime : null;
      const performance =
        operatingTime > 0 && totalIdealTime > 0 ? totalIdealTime / operatingTime : null;
      const quality = totalCount > 0 ? goodCount / totalCount : null;
      const oee =
        availability !== null && performance !== null && quality !== null
          ? availability * performance * quality
          : null;

      return {
        points: points.sort((a, b) => a.date.localeCompare(b.date)),
        summary: {
          availability,
          performance,
          quality,
          oee,
          plannedTime,
          operatingTime,
          totalCount,
          goodCount,
          defectCount,
          coverageDays,
          windowDays: dates.length,
        },
      };
    },
  });

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">OEE Raporu</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl size="small" fullWidth disabled={machinesQuery.isLoading}>
                  <InputLabel id="oee-machine-label">Makine</InputLabel>
                  <Select
                    labelId="oee-machine-label"
                    label="Makine"
                    value={selectedMachineId}
                    onChange={(event) => setSelectedMachineId(event.target.value)}
                  >
                    {(machinesQuery.data || []).map((machine) => (
                      <MenuItem key={machine.id || machine._id} value={machine.id || machine._id}>
                        {machine.code} — {machine.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="oee-mode-label">Mod</InputLabel>
                  <Select
                    labelId="oee-mode-label"
                    label="Mod"
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                  >
                    {MODE_OPTIONS.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="oee-source-label">Kaynak</InputLabel>
                  <Select
                    labelId="oee-source-label"
                    label="Kaynak"
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                  >
                    {SOURCE_OPTIONS.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {mode === 'shift' ? (
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Shift Tarihi"
                    type="date"
                    size="small"
                    fullWidth
                    value={shiftDate}
                    onChange={(event) => setShiftDate(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Boş bırakılırsa son telemetry günü kullanılır."
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Başlangıç"
                      type="datetime-local"
                      size="small"
                      fullWidth
                      value={rangeFrom}
                      onChange={(event) => setRangeFrom(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Bitiş"
                      type="datetime-local"
                      size="small"
                      fullWidth
                      value={rangeTo}
                      onChange={(event) => setRangeTo(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Operatör Performansı</Typography>
            {statsQuery.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : statsQuery.data?.operatorStats?.length ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Operatör</TableCell>
                      <TableCell align="right">OEE</TableCell>
                      <TableCell align="right">A</TableCell>
                      <TableCell align="right">P</TableCell>
                      <TableCell align="right">Q</TableCell>
                      <TableCell align="right">Planlı</TableCell>
                      <TableCell align="right">Çalışma</TableCell>
                      <TableCell align="right">Üretim</TableCell>
                      <TableCell align="right">Sağlam</TableCell>
                      <TableCell align="right">Hatalı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsQuery.data.operatorStats.map((operator) => (
                      <TableRow key={operator.id}>
                        <TableCell>{formatUserName(operator)}</TableCell>
                        <TableCell align="right">{formatPercent(operator.oee)}</TableCell>
                        <TableCell align="right">
                          {formatPercent(operator.availability)}
                        </TableCell>
                        <TableCell align="right">{formatPercent(operator.performance)}</TableCell>
                        <TableCell align="right">{formatPercent(operator.quality)}</TableCell>
                        <TableCell align="right">
                          {formatDurationMs(operator.plannedTime)}
                        </TableCell>
                        <TableCell align="right">
                          {formatDurationMs(operator.operatingTime)}
                        </TableCell>
                        <TableCell align="right">{formatNumber(operator.totalCount, 0)}</TableCell>
                        <TableCell align="right">{formatNumber(operator.goodCount, 0)}</TableCell>
                        <TableCell align="right">{formatNumber(operator.defectCount, 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">Operatör verisi bulunamadı.</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">OEE Özeti</Typography>
            {statsQuery.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : statsQuery.isError ? (
              <Alert severity="error">
                OEE verileri alınamadı:{' '}
                {statsQuery.error?.response?.data?.message || statsQuery.error?.message}
              </Alert>
            ) : statsQuery.data ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        OEE
                      </Typography>
                      <Typography variant="h4">{formatPercent(statsQuery.data.oee)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        Kullanılabilirlik
                      </Typography>
                      <Typography variant="h5">
                        {formatPercent(statsQuery.data.availability)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        Performans
                      </Typography>
                      <Typography variant="h5">
                        {formatPercent(statsQuery.data.performance)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        Kalite
                      </Typography>
                      <Typography variant="h5">
                        {formatPercent(statsQuery.data.quality)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Planlı Süre
                  </Typography>
                  <Typography variant="h6">
                    {formatDurationMs(statsQuery.data.plannedTime)}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Çalışma Süresi
                  </Typography>
                  <Typography variant="h6">
                    {formatDurationMs(statsQuery.data.operatingTime)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Toplam Üretim
                  </Typography>
                  <Typography variant="h6">{formatNumber(statsQuery.data.totalCount, 0)}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sağlam Ürün
                  </Typography>
                  <Typography variant="h6">{formatNumber(statsQuery.data.goodCount, 0)}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hatalı Ürün
                  </Typography>
                  <Typography variant="h6">{formatNumber(statsQuery.data.defectCount, 0)}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pencere
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(statsQuery.data.windowStart)}
                    {' — '}
                    {formatDateTime(statsQuery.data.windowEnd)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sorumlu Operatörler
                  </Typography>
                  <Typography variant="body2">
                    {(statsQuery.data.operators || []).length
                      ? statsQuery.data.operators
                          .map((operator) => formatUserName(operator))
                          .filter(Boolean)
                          .join(', ')
                      : 'Atanmış operatör yok'}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">OEE verisi bulunamadı.</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Typography variant="h6" sx={{ flex: 1 }}>
                AI Analizi
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {aiCacheHit ? <Chip size="small" label="Cache" /> : null}
                {aiInsight?.promptVersion ? (
                  <Chip size="small" label={`Prompt ${aiInsight.promptVersion}`} />
                ) : null}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleAiAnalyze(false)}
                  disabled={!aiPayload || aiMutation.isLoading}
                >
                  Analiz Et
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAiAnalyze(true)}
                  disabled={!aiPayload || aiMutation.isLoading}
                >
                  Yeniden Analiz
                </Button>
              </Stack>
            </Stack>

            {aiRateLimitMeta?.isWarning ? (
              <Alert severity="warning">
                AI limiti %{Math.round(
                  (aiRateLimitMeta.hourlyUsed / aiRateLimitMeta.hourlyLimit) * 100,
                )}
                &nbsp;kullanıldı. Limit yaklaşırken dikkatli olun.
              </Alert>
            ) : null}
            {aiIsStale ? (
              <Alert severity="warning">
                Bu analiz eski olabilir; veri değişmiş olabilir. Yeniden analiz etmen önerilir.
              </Alert>
            ) : null}

            {aiMutation.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : aiMutation.isError ? (
              <Alert severity="error">
                AI analizi alınamadı:{' '}
                {aiMutation.error?.response?.data?.message || aiMutation.error?.message}
              </Alert>
            ) : aiInsight ? (
              <Stack spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Son analiz
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(aiInsight.generatedAt)} • {aiInsight.model || 'model'}
                  </Typography>
                </Stack>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Özet</Typography>
                  <Typography variant="body1">
                    {aiOutput.summary || 'Özet bilgisi bulunamadı.'}
                  </Typography>
                </Stack>
                {aiHighlights.length ? (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Öne Çıkanlar</Typography>
                    <Stack spacing={0.5}>
                      {aiHighlights.map((item, index) => (
                        <Typography key={`${item}-${index}`} variant="body2">
                          • {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                ) : null}
                {aiActions.length ? (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Aksiyonlar</Typography>
                    <Stack spacing={0.75}>
                      {aiActions.map((action, index) => (
                        <Box key={`${action.title}-${index}`}>
                          <Typography variant="body2" fontWeight={600}>
                            {action.title}
                          </Typography>
                          {action.reason ? (
                            <Typography variant="caption" color="text.secondary">
                              {action.reason}
                            </Typography>
                          ) : null}
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                ) : null}
                {aiWarnings.length ? (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Uyarılar</Typography>
                    <Stack spacing={0.5}>
                      {aiWarnings.map((warning, index) => (
                        <Alert key={`${warning}-${index}`} severity="warning">
                          {warning}
                        </Alert>
                      ))}
                    </Stack>
                  </Stack>
                ) : null}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                AI analizi için “Analiz Et” butonuna tıklayın.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <Typography variant="h6" sx={{ flex: 1 }}>
                OEE Trend
              </Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="oee-trend-label">Periyot</InputLabel>
                <Select
                  labelId="oee-trend-label"
                  label="Periyot"
                  value={trendScope}
                  onChange={(event) => setTrendScope(event.target.value)}
                >
                  {TREND_OPTIONS.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            {trendQuery.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : trendQuery.isError ? (
              <Alert severity="error">
                Trend verileri alınamadı:{' '}
                {trendQuery.error?.response?.data?.message || trendQuery.error?.message}
              </Alert>
            ) : trendQuery.data ? (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="overline" color="text.secondary">
                          OEE
                        </Typography>
                        <Typography variant="h5">
                          {formatPercent(trendQuery.data.summary.oee)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="overline" color="text.secondary">
                          Kullanılabilirlik
                        </Typography>
                        <Typography variant="h6">
                          {formatPercent(trendQuery.data.summary.availability)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="overline" color="text.secondary">
                          Performans
                        </Typography>
                        <Typography variant="h6">
                          {formatPercent(trendQuery.data.summary.performance)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="overline" color="text.secondary">
                          Kalite
                        </Typography>
                        <Typography variant="h6">
                          {formatPercent(trendQuery.data.summary.quality)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Coverage: {trendQuery.data.summary.coverageDays}/
                      {trendQuery.data.summary.windowDays} gün
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendQuery.data.points}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => formatDate(value)} />
                      <YAxis
                        domain={[0, 1]}
                        tickFormatter={(value) => `${Math.round(value * 100)}%`}
                      />
                      <Tooltip
                        labelFormatter={(value) => formatDate(value)}
                        formatter={(value) => (value === null ? 'N/A' : formatPercent(value))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="oee"
                        name="OEE"
                        stroke="#1976d2"
                        strokeWidth={2}
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="availability"
                        name="Kullanılabilirlik"
                        stroke="#2e7d32"
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="performance"
                        name="Performans"
                        stroke="#ed6c02"
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="quality"
                        name="Kalite"
                        stroke="#9c27b0"
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </>
            ) : (
              <Typography color="text.secondary">Trend verisi bulunamadı.</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ReportsPage;
