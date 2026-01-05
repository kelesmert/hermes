import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  Pagination,
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
import { alpha } from '@mui/material/styles';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import {
  createDowntimeReasonInsight,
  createOeeInsight,
  fetchAiInsights,
  fetchLatestAiInsight,
} from '@/lib/api/ai-api.js';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import { formatDate, formatDateTime } from '@/lib/date-format.js';

const USE_CASE_LABELS = {
  'oee-insight': 'OEE Insight',
  'downtime-reason': 'Durus Pattern',
  'anomaly-risk': 'Anomali Risk',
};

const USE_CASE_ROUTE = {
  'oee-insight': '/reports',
  'downtime-reason': '/downtimes',
  'anomaly-risk': '/monitoring',
};

const USE_CASE_STATUS = {
  'oee-insight': { label: 'Aktif', tone: 'primary' },
  'downtime-reason': { label: 'Aktif', tone: 'success' },
  'anomaly-risk': { label: 'Hazirlaniyor', tone: 'info' },
};

const buildWindowLabel = (window) => {
  if (!window) return '-';
  if (window.mode === 'shift') {
    return `Shift ${window.shiftDateYmd || '-'}`;
  }
  if (window.mode === 'range') {
    const fromLabel = window.fromMs ? formatDate(new Date(window.fromMs)) : '-';
    const toLabel = window.toMs ? formatDate(new Date(window.toMs)) : '-';
    return `${fromLabel} -> ${toLabel}`;
  }
  return '-';
};

const buildMachineMap = (machines) => {
  const map = new Map();
  (machines || []).forEach((machine) => {
    const id = machine.id || machine._id;
    if (!id) return;
    const label = machine.name || machine.code || String(id);
    map.set(String(id), label);
  });
  return map;
};

const buildDateRangeMs = ({ start, end }) => {
  const startMs = start ? new Date(`${start}T00:00:00`).getTime() : null;
  const endMs = end ? new Date(`${end}T23:59:59.999`).getTime() : null;
  return { startMs, endMs };
};

const buildDailyCounts = (insights) => {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const buckets = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    buckets.push({
      key: day.toISOString().slice(0, 10),
      label: formatDate(day),
      count: 0,
    });
  }

  const bucketMap = new Map(buckets.map((item) => [item.key, item]));
  (insights || []).forEach((insight) => {
    const key = insight.generatedAt ? new Date(insight.generatedAt).toISOString().slice(0, 10) : null;
    const bucket = key ? bucketMap.get(key) : null;
    if (bucket) bucket.count += 1;
  });
  return buckets;
};

const UseCaseCard = ({ title, description, latestLabel, route, icon: Icon, tone, statusLabel }) => (
  <Card
    sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette.divider, 0.6),
      boxShadow: 'none',
      height: '100%',
    }}
  >
    <CardContent>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: (theme) => alpha(theme.palette[tone].main, 0.15),
              color: (theme) => theme.palette[tone].main,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Chip size="small" label={statusLabel} color={tone} variant="outlined" />
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Son analiz: {latestLabel || 'Kayit yok'}
        </Typography>
        <Button
          component={NavLink}
          to={route}
          variant="contained"
          color={tone}
          size="small"
          sx={{ alignSelf: 'flex-start' }}
        >
          Sayfaya Git
        </Button>
      </Stack>
    </CardContent>
  </Card>
);

const AiHubPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const listLimit = 200;
  const [useCaseFilter, setUseCaseFilter] = useState('all');
  const [machineFilter, setMachineFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [staleById, setStaleById] = useState({});
  const [staleLoadingId, setStaleLoadingId] = useState(null);

  const queryClient = useQueryClient();

  const insightsQuery = useQuery({
    queryKey: ['aiInsights', 'latest', listLimit],
    queryFn: () => fetchAiInsights({ limit: listLimit }),
    staleTime: 15000,
  });

  const machinesQuery = useQuery({
    queryKey: ['machines', 'ai-hub'],
    queryFn: fetchMachines,
    staleTime: 60000,
  });

  const machineMap = useMemo(() => buildMachineMap(machinesQuery.data), [machinesQuery.data]);

  const insights = insightsQuery.data || [];
  const isLoading = insightsQuery.isLoading || machinesQuery.isLoading;
  const hasError = insightsQuery.isError || machinesQuery.isError;
  const filteredInsights = useMemo(() => {
    const { startMs, endMs } = buildDateRangeMs({ start: fromDate, end: toDate });
    return insights.filter((insight) => {
      if (useCaseFilter !== 'all' && insight.useCase !== useCaseFilter) return false;
      if (machineFilter !== 'all' && String(insight.machineId || '') !== machineFilter) return false;
      if (sourceFilter !== 'all' && insight.source !== sourceFilter) return false;
      if (startMs || endMs) {
        const createdMs = insight.generatedAt ? new Date(insight.generatedAt).getTime() : 0;
        if (startMs && createdMs < startMs) return false;
        if (endMs && createdMs > endMs) return false;
      }
      return true;
    });
  }, [insights, useCaseFilter, machineFilter, sourceFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredInsights.length / pageSize));
  const pagedInsights = useMemo(
    () => filteredInsights.slice((page - 1) * pageSize, page * pageSize),
    [filteredInsights, page, pageSize],
  );

  const lastSevenDays = useMemo(() => {
    const now = Date.now();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const startMs = start.getTime();
    const recent = insights.filter((insight) => {
      const generatedMs = insight.generatedAt ? new Date(insight.generatedAt).getTime() : 0;
      return generatedMs >= startMs && generatedMs <= now;
    });

    const machineSet = new Set(recent.map((item) => item.machineId).filter(Boolean).map(String));
    const latestGeneratedAt = recent.length
      ? new Date(Math.max(...recent.map((item) => new Date(item.generatedAt).getTime())))
      : null;

    return {
      count: recent.length,
      machineCount: machineSet.size,
      latestGeneratedAt,
      dailyCounts: buildDailyCounts(recent),
    };
  }, [insights]);

  const latestByUseCase = useMemo(() => {
    const map = new Map();
    insights.forEach((insight) => {
      if (!map.has(insight.useCase)) {
        map.set(insight.useCase, insight);
      }
    });
    return map;
  }, [insights]);

  const refreshOeeMutation = useMutation({
    mutationFn: createOeeInsight,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aiInsights'] }),
  });

  const refreshDowntimeMutation = useMutation({
    mutationFn: createDowntimeReasonInsight,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['aiInsights'] }),
  });

  const handleStaleCheck = async (insight) => {
    if (!insight || insight.useCase !== 'oee-insight') return;
    setStaleLoadingId(insight._id);
    try {
      const window = insight.window || {};
      const params = {
        useCase: insight.useCase,
        machineId: insight.machineId,
        source: insight.source,
        mode: window.mode,
        shiftDate: window.shiftDateYmd,
        from: window.fromMs ? new Date(window.fromMs).toISOString() : undefined,
        to: window.toMs ? new Date(window.toMs).toISOString() : undefined,
        timezone: window.timezone,
        checkStale: 1,
      };
      const latest = await fetchLatestAiInsight(params);
      if (!latest) return;
      const status = latest._id !== insight._id ? 'newer' : latest.isStale ? 'stale' : 'fresh';
      setStaleById((prev) => ({
        ...prev,
        [insight._id]: {
          status,
          checkedAt: new Date().toISOString(),
        },
      }));
    } finally {
      setStaleLoadingId(null);
    }
  };

  const handleRefreshInsight = (insight) => {
    if (!insight) return;
    if (insight.useCase === 'oee-insight') {
      const window = insight.window || {};
      return refreshOeeMutation.mutate({
        machineId: insight.machineId,
        source: insight.source,
        mode: window.mode,
        shiftDate: window.shiftDateYmd,
        from: window.fromMs ? new Date(window.fromMs).toISOString() : undefined,
        to: window.toMs ? new Date(window.toMs).toISOString() : undefined,
        forceRefresh: true,
      });
    }
    if (insight.useCase === 'downtime-reason') {
      return refreshDowntimeMutation.mutate({
        downtimeId: insight.downtimeId,
        forceRefresh: true,
      });
    }
    return undefined;
  };

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [useCaseFilter, machineFilter, sourceFilter, fromDate, toDate]);

  const useCaseOptions = useMemo(
    () => [
      { value: 'all', label: 'Tumu' },
      ...Object.entries(USE_CASE_LABELS).map(([value, label]) => ({ value, label })),
    ],
    [],
  );

  const machineOptions = useMemo(() => {
    const items = machinesQuery.data || [];
    return [
      { value: 'all', label: 'Tum makineler' },
      ...items.map((machine) => ({
        value: String(machine.id || machine._id),
        label: machine.name || machine.code || String(machine.id || machine._id),
      })),
    ];
  }, [machinesQuery.data]);

  const sourceOptions = useMemo(() => {
    const sources = Array.from(new Set(insights.map((item) => item.source).filter(Boolean)));
    return [
      { value: 'all', label: 'Tum kaynaklar' },
      ...sources.map((value) => ({ value, label: value })),
    ];
  }, [insights]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeOutlinedIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>
              AI Asistani
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Toplam 200 analize kadar listelenir. Sayfa basina 20 analiz gosterilir.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button component={NavLink} to="/reports" variant="contained" color="primary">
            OEE Insight Uret
          </Button>
          <Button component={NavLink} to="/downtimes" variant="outlined" color="primary">
            Son Kapanan Durusu Analiz Et
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Son 7 gun AI analiz sayisi
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                  {lastSevenDays.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Son analiz zamani
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                  {lastSevenDays.latestGeneratedAt ? formatDateTime(lastSevenDays.latestGeneratedAt) : '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Kapsanan makine sayisi (7 gun)
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                  {lastSevenDays.machineCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <UseCaseCard
              title="U1 - OEE Insight"
              description="OEE ozetleri, kayip analizi ve operator yorumu."
              route="/reports"
              icon={InsightsOutlinedIcon}
              statusLabel={USE_CASE_STATUS['oee-insight'].label}
              tone={USE_CASE_STATUS['oee-insight'].tone}
              latestLabel={
                latestByUseCase.get('oee-insight')
                  ? formatDateTime(latestByUseCase.get('oee-insight').generatedAt)
                  : null
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <UseCaseCard
              title="U2 - Durus Pattern"
              description="Kapanmis duruslar icin post mortem pattern analizi."
              route="/downtimes"
              icon={PauseCircleOutlineIcon}
              statusLabel={USE_CASE_STATUS['downtime-reason'].label}
              tone={USE_CASE_STATUS['downtime-reason'].tone}
              latestLabel={
                latestByUseCase.get('downtime-reason')
                  ? formatDateTime(latestByUseCase.get('downtime-reason').generatedAt)
                  : null
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <UseCaseCard
              title="U3 - Anomali Risk"
              description="Canli izleme icin risk uyarisi ve anomali tespiti."
              route="/monitoring"
              icon={SensorsOutlinedIcon}
              statusLabel={USE_CASE_STATUS['anomaly-risk'].label}
              tone={USE_CASE_STATUS['anomaly-risk'].tone}
              latestLabel={
                latestByUseCase.get('anomaly-risk')
                  ? formatDateTime(latestByUseCase.get('anomaly-risk').generatedAt)
                  : null
              }
            />
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Son AI Analizleri</Typography>
                <Chip label={`${filteredInsights.length} kayit`} size="small" />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {lastSevenDays.dailyCounts.map((item) => (
                  <Chip
                    key={item.key}
                    size="small"
                    label={`${item.label}: ${item.count}`}
                    variant="outlined"
                  />
                ))}
              </Stack>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="ai-usecase-label">Use Case</InputLabel>
                    <Select
                      labelId="ai-usecase-label"
                      value={useCaseFilter}
                      label="Use Case"
                      onChange={(event) => setUseCaseFilter(event.target.value)}
                    >
                      {useCaseOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="ai-machine-label">Makine</InputLabel>
                    <Select
                      labelId="ai-machine-label"
                      value={machineFilter}
                      label="Makine"
                      onChange={(event) => setMachineFilter(event.target.value)}
                    >
                      {machineOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="ai-source-label">Kaynak</InputLabel>
                    <Select
                      labelId="ai-source-label"
                      value={sourceFilter}
                      label="Kaynak"
                      onChange={(event) => setSourceFilter(event.target.value)}
                    >
                      {sourceOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Baslangic"
                      type="date"
                      size="small"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Bitis"
                      type="date"
                      size="small"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                </Grid>
              </Grid>
              {hasError ? (
                <Alert severity="error" variant="outlined">
                  Analizler yuklenemedi. Lutfen daha sonra tekrar deneyin.
                </Alert>
              ) : null}
              {isLoading ? (
                <Stack alignItems="center" py={4}>
                  <CircularProgress size={32} />
                </Stack>
              ) : null}
              {!isLoading && !hasError && filteredInsights.length === 0 ? (
                <Alert severity="info" variant="outlined">
                  Henuz analiz kaydi bulunmuyor.
                </Alert>
              ) : null}
              {!isLoading && !hasError && pagedInsights.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Use Case</TableCell>
                        <TableCell>Makine</TableCell>
                        <TableCell>Kaynak</TableCell>
                        <TableCell>Pencere</TableCell>
                        <TableCell>Olusma</TableCell>
                        <TableCell>Stale</TableCell>
                        <TableCell align="right">Aksiyon</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedInsights.map((insight) => {
                        const machineLabel = insight.machineId
                          ? machineMap.get(String(insight.machineId)) || String(insight.machineId)
                          : 'Makine yok';
                        const staleStatus = staleById[insight._id]?.status;
                        const staleLabel =
                          staleStatus === 'stale'
                            ? 'Stale'
                            : staleStatus === 'newer'
                              ? 'Yeni Analiz Var'
                              : staleStatus === 'fresh'
                                ? 'Guncel'
                                : 'Kontrol edilmedi';
                        const staleColor =
                          staleStatus === 'stale'
                            ? 'warning'
                            : staleStatus === 'newer'
                              ? 'info'
                              : staleStatus === 'fresh'
                                ? 'success'
                                : 'default';

                        return (
                          <TableRow key={insight._id}>
                            <TableCell>{USE_CASE_LABELS[insight.useCase] || insight.useCase}</TableCell>
                            <TableCell>{machineLabel}</TableCell>
                            <TableCell>{insight.source || '-'}</TableCell>
                            <TableCell>{buildWindowLabel(insight.window)}</TableCell>
                            <TableCell>{formatDateTime(insight.generatedAt)}</TableCell>
                            <TableCell>
                              {insight.useCase === 'oee-insight' ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip size="small" label={staleLabel} color={staleColor} />
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => handleStaleCheck(insight)}
                                    disabled={staleLoadingId === insight._id}
                                  >
                                    Kontrol Et
                                  </Button>
                                </Stack>
                              ) : (
                                <Chip size="small" label="N/A" variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  component={NavLink}
                                  to={USE_CASE_ROUTE[insight.useCase] || '/'}
                                >
                                  Sayfaya Git
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleRefreshInsight(insight)}
                                  disabled={
                                    insight.useCase === 'anomaly-risk' ||
                                    refreshOeeMutation.isPending ||
                                    refreshDowntimeMutation.isPending
                                  }
                                >
                                  Yeniden Analiz
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
              {!isLoading && !hasError && totalPages > 1 ? (
                <Stack alignItems="flex-end">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_event, nextPage) => setPage(nextPage)}
                    color="primary"
                    size="small"
                  />
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px dashed',
            borderColor: (theme) => alpha(theme.palette.text.primary, 0.2),
            opacity: 0.6,
          }}
        >
          <CardContent>
            <Typography variant="h6">Kullanim Istatistikleri (Yakinda)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Token kullanimi ve limit durumu daha sonra eklenecek.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default AiHubPage;
