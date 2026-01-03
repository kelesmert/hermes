import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
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
import { alpha } from '@mui/material/styles';
import FactoryIcon from '@mui/icons-material/Factory';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { fetchOperationsDashboard } from '@/features/dashboard/services/board-api.js';
import { fetchJobOrders } from '@/features/production/services/job-orders-api.js';
import { formatDateTime } from '@/lib/date-format.js';

const EMPTY_ARRAY = [];

const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return '-';
  return `${formatNumber(value * 100)}%`;
};

const formatDurationMs = (value) => {
  if (value === null || value === undefined) return '-';
  const minutes = value / 60000;
  if (minutes < 60) return `${formatNumber(minutes)} dk`;
  const hours = minutes / 60;
  return `${formatNumber(hours)} sa`;
};

const buildTone = (tone) => {
  if (!tone) return { chip: 'default', iconColor: 'text.secondary' };
  return { chip: tone, iconColor: `${tone}.main` };
};

const SOURCE_OPTIONS = [
  { id: 'mock-batch', label: 'Mock Batch' },
  { id: 'shift-sim', label: 'Shift Sim' },
  { id: 'data-gen', label: 'Data Gen' },
  { id: 'auto', label: 'Auto' },
];

const STATUS_LABELS = {
  running: 'Çalışıyor',
  downtime: 'Duruşta',
  idle: 'Boşta',
  unknown: 'Bilinmiyor',
};

const STATUS_META = {
  running: {
    label: STATUS_LABELS.running,
    tone: 'success',
    icon: PlayCircleOutlineIcon,
  },
  downtime: {
    label: STATUS_LABELS.downtime,
    tone: 'error',
    icon: PauseCircleOutlineIcon,
  },
  idle: {
    label: STATUS_LABELS.idle,
    tone: 'info',
    icon: ScheduleIcon,
  },
  unknown: {
    label: STATUS_LABELS.unknown,
    tone: 'warning',
    icon: HelpOutlineIcon,
  },
};

const REASON_CATEGORY_META = {
  planned: { label: 'Planlı', tone: 'info' },
  unplanned: { label: 'Plansız', tone: 'error' },
};

const normalizeMachineKey = (value) => {
  if (!value) return null;
  return String(value).trim().toLowerCase();
};

const resolveJobSourceMatch = (job, effectiveSource) => {
  if (!effectiveSource || effectiveSource === 'auto') return true;
  const jobSource = job?.metadata?.simulationSource;
  if (!jobSource) return effectiveSource === 'data-gen';
  return jobSource === effectiveSource;
};

const StatusChip = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.unknown;
  const Icon = meta.icon;
  const tone = buildTone(meta.tone);
  return (
    <Chip
      size="small"
      variant="outlined"
      color={tone.chip}
      icon={<Icon fontSize="small" />}
      label={meta.label}
      sx={{ fontWeight: 600 }}
    />
  );
};

const KpiCard = ({ label, value, caption, tone = 'primary', icon: Icon, progress }) => (
  <Card
    sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette.divider, 0.6),
      boxShadow: 'none',
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(
            theme.palette[tone]?.main || theme.palette.primary.main,
            0.12,
          )} 0%, transparent 45%)`,
        pointerEvents: 'none',
      }}
    />
    <CardContent sx={{ position: 'relative' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: (theme) =>
              alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.16),
            color: (theme) => theme.palette[tone]?.main || theme.palette.primary.main,
          }}
        >
          {Icon ? <Icon fontSize="small" /> : null}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
        {progress !== null && progress !== undefined ? (
          <Typography variant="body2" color="text.secondary">
            {formatPercent(progress)}
          </Typography>
        ) : null}
      </Stack>

      {progress !== null && progress !== undefined ? (
        <LinearProgress
          variant="determinate"
          value={Math.min(Math.max(progress * 100, 0), 100)}
          color={tone}
          sx={{
            mt: 1.25,
            height: 8,
            borderRadius: 99,
            bgcolor: (theme) =>
              alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.12),
          }}
        />
      ) : null}
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [source, setSource] = useState('mock-batch');
  const [shiftDate, setShiftDate] = useState('');
  const [machineSearch, setMachineSearch] = useState('');
  const [downtimeSearch, setDowntimeSearch] = useState('');

  const refreshIntervalMs = source === 'mock-batch' ? false : 5000;

  const operationsQuery = useQuery({
    queryKey: ['operationsDashboard', source, shiftDate],
    queryFn: () =>
      fetchOperationsDashboard({
        source,
        shiftDate: shiftDate || undefined,
      }),
    refetchInterval: refreshIntervalMs,
  });

  const data = operationsQuery.data;
  const counts = data?.counts;
  const effectiveSource = data?.source || source;
  const effectiveShiftDate = data?.shiftDate || '';
  const machines = data?.machines ?? EMPTY_ARRAY;
  const downtimes = data?.downtimes ?? EMPTY_ARRAY;

  const activeJobsQuery = useQuery({
    queryKey: ['jobOrdersActive', effectiveSource],
    queryFn: async () => {
      const [inProgress, paused] = await Promise.all([
        fetchJobOrders({ status: 'in_progress' }),
        fetchJobOrders({ status: 'paused' }),
      ]);

      return {
        inProgress: inProgress.filter((job) => resolveJobSourceMatch(job, effectiveSource)),
        paused: paused.filter((job) => resolveJobSourceMatch(job, effectiveSource)),
      };
    },
    enabled: operationsQuery.isSuccess,
    refetchInterval: refreshIntervalMs,
  });

  const jobStatusByMachine = useMemo(() => {
    const map = new Map();
    const paused = activeJobsQuery.data?.paused ?? EMPTY_ARRAY;
    const inProgress = activeJobsQuery.data?.inProgress ?? EMPTY_ARRAY;

    for (const job of paused) {
      const machineId = job.machine?.id || job.machine?._id;
      const machineCode = job.machine?.code;
      const keys = [
        machineId ? machineId.toString() : null,
        normalizeMachineKey(machineCode),
      ].filter(Boolean);
      keys.forEach((key) => map.set(key, 'paused'));
    }

    for (const job of inProgress) {
      const machineId = job.machine?.id || job.machine?._id;
      const machineCode = job.machine?.code;
      const keys = [
        machineId ? machineId.toString() : null,
        normalizeMachineKey(machineCode),
      ].filter(Boolean);
      keys.forEach((key) => map.set(key, 'in_progress'));
    }

    return map;
  }, [activeJobsQuery.data]);

  const displayMachines = useMemo(() => {
    return machines.map((machine) => {
      const jobStatus =
        jobStatusByMachine.get(machine.id?.toString?.() || machine.id) ||
        jobStatusByMachine.get(normalizeMachineKey(machine.code));
      let displayStatus = machine.status;
      let statusNote = null;

      if (jobStatus === 'paused' && machine.status === 'running') {
        displayStatus = 'idle';
        statusNote = 'Job duraklatıldı';
      } else if (jobStatus === 'paused' && machine.status === 'idle') {
        statusNote = 'Job duraklatıldı';
      }

      return {
        ...machine,
        displayStatus,
        statusNote,
      };
    });
  }, [machines, jobStatusByMachine]);

  const displayCounts = useMemo(() => {
    return displayMachines.reduce(
      (acc, machine) => {
        acc.total += 1;
        if (machine.displayStatus === 'running') acc.running += 1;
        else if (machine.displayStatus === 'downtime') acc.downtime += 1;
        else if (machine.displayStatus === 'idle') acc.idle += 1;
        else acc.unknown += 1;
        return acc;
      },
      { total: 0, running: 0, downtime: 0, idle: 0, unknown: 0 },
    );
  }, [displayMachines]);

  const totalMachines = displayCounts.total || counts?.total || 0;

  const cards = useMemo(() => {
    if (!displayCounts.total) return [];

    const safeTotal = Math.max(displayCounts.total || 0, 1);
    return [
      {
        label: 'Toplam Makine',
        value: formatNumber(displayCounts.total),
        caption: 'Aktif makine',
        tone: 'primary',
        icon: FactoryIcon,
        progress: null,
      },
      {
        label: STATUS_META.running.label,
        value: formatNumber(displayCounts.running),
        caption: 'Şu an',
        tone: STATUS_META.running.tone,
        icon: STATUS_META.running.icon,
        progress: (displayCounts.running || 0) / safeTotal,
      },
      {
        label: STATUS_META.downtime.label,
        value: formatNumber(displayCounts.downtime),
        caption: 'Şu an',
        tone: STATUS_META.downtime.tone,
        icon: STATUS_META.downtime.icon,
        progress: (displayCounts.downtime || 0) / safeTotal,
      },
      {
        label: STATUS_META.idle.label,
        value: formatNumber(displayCounts.idle),
        caption: 'Job yok',
        tone: STATUS_META.idle.tone,
        icon: STATUS_META.idle.icon,
        progress: (displayCounts.idle || 0) / safeTotal,
      },
      {
        label: STATUS_META.unknown.label,
        value: formatNumber(displayCounts.unknown),
        caption: 'Veri yok',
        tone: STATUS_META.unknown.tone,
        icon: WarningAmberIcon,
        progress: (displayCounts.unknown || 0) / safeTotal,
      },
    ];
  }, [displayCounts]);

  const filteredMachines = useMemo(() => {
    const term = machineSearch.trim().toLowerCase();
    if (!term) return displayMachines;
    return displayMachines.filter((machine) => {
      const hay = `${machine.code} ${machine.name}`.toLowerCase();
      return hay.includes(term);
    });
  }, [machineSearch, displayMachines]);

  const filteredDowntimes = useMemo(() => {
    const term = downtimeSearch.trim().toLowerCase();
    if (!term) return downtimes;
    return downtimes.filter((row) => {
      const hay = `${row.machine?.code || ''} ${row.machine?.name || ''} ${row.reasonCode || ''} ${row.reasonCategory || ''}`.toLowerCase();
      return hay.includes(term);
    });
  }, [downtimeSearch, downtimes]);

  const maxDowntimeMs = useMemo(() => {
    if (!filteredDowntimes.length) return 0;
    return Math.max(...filteredDowntimes.map((row) => row.durationMs || 0));
  }, [filteredDowntimes]);

  const statusPieData = useMemo(() => {
    if (!displayCounts.total) return [];
    return ['running', 'downtime', 'idle', 'unknown'].map((key) => ({
      key,
      name: STATUS_META[key]?.label || key,
      value: displayCounts[key] || 0,
      tone: STATUS_META[key]?.tone || 'primary',
    }));
  }, [displayCounts]);

  if (operationsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (operationsQuery.isError) {
    return (
      <Alert severity="error">
        Dashboard verileri alınamadı:{' '}
        {operationsQuery.error?.response?.data?.message || operationsQuery.error?.message}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="baseline">
                <Typography variant="h6">Operasyon</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tüm makineler için seçili pencerede as-of durum ve duruş özeti
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="dashboard-source-label">Kaynak</InputLabel>
                    <Select
                      labelId="dashboard-source-label"
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
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Shift Tarihi"
                    type="date"
                    value={shiftDate}
                    onChange={(event) => setShiftDate(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText={
                      shiftDate
                        ? 'Boş bırakılırsa son telemetry günü kullanılır.'
                        : effectiveShiftDate
                        ? `Boş bırakılırsa: ${effectiveShiftDate}`
                        : 'Boş bırakılırsa son telemetry günü kullanılır.'
                    }
                  />
                </Grid>
              </Grid>
              {data?.windowStart && data?.windowEnd ? (
                <Typography variant="body2" color="text.secondary">
                  Pencere: {formatDateTime(data.windowStart)} → {formatDateTime(data.windowEnd)}
                  {data.asOf ? ` • As-Of: ${formatDateTime(data.asOf)}` : ''}
                </Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={8}>
        <Grid container spacing={2}>
          {cards.map((metric) => (
            <Grid item xs={12} sm={6} md={4} key={metric.label}>
              <KpiCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Durum Dağılımı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalMachines ? `${totalMachines} makine` : 'Veri yok'}
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip formatter={(value, name) => [`${value} makine`, name]} />
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      stroke="transparent"
                    >
                      {statusPieData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={
                            entry.tone === 'success'
                              ? '#2e7d32'
                              : entry.tone === 'error'
                              ? '#d32f2f'
                              : entry.tone === 'info'
                              ? '#0288d1'
                              : '#ed6c02'
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Divider />

              <Stack spacing={1}>
                {statusPieData.map((entry) => (
                  <Stack key={entry.key} direction="row" justifyContent="space-between" alignItems="center">
                    <StatusChip status={entry.key} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatNumber(entry.value)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Duruşlar</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Süreye göre sıralı (shift penceresi ve as-of’a göre kırpılmış)
                  </Typography>
                </Box>
                <TextField
                  size="small"
                  label="Duruş Ara"
                  value={downtimeSearch}
                  onChange={(event) => setDowntimeSearch(event.target.value)}
                  sx={{ minWidth: { md: 280 } }}
                />
              </Stack>

              {filteredDowntimes.length === 0 ? (
                <Typography color="text.secondary">Bu pencerede duruş bulunamadı.</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Makine</TableCell>
                        <TableCell>Sebep</TableCell>
                        <TableCell>Tür</TableCell>
                        <TableCell align="right">Süre</TableCell>
                        <TableCell>Başlangıç</TableCell>
                        <TableCell>Bitiş</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDowntimes.map((downtime) => {
                        const categoryMeta = REASON_CATEGORY_META[downtime.reasonCategory] || null;
                        const categoryTone = buildTone(categoryMeta?.tone);
                        const progress =
                          maxDowntimeMs > 0
                            ? Math.min((downtime.durationMs || 0) / maxDowntimeMs, 1)
                            : null;

                        return (
                          <TableRow
                            key={downtime.id}
                            sx={{
                              bgcolor: downtime.isOpen
                                ? (theme) => alpha(theme.palette.error.main, 0.06)
                                : 'inherit',
                            }}
                          >
                            <TableCell>
                              {downtime.machine?.code
                                ? `${downtime.machine.code} — ${downtime.machine.name}`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {downtime.reasonCode || '-'}
                                </Typography>
                                {downtime.isOpen ? (
                                  <Chip size="small" color="error" variant="outlined" label="Açık" />
                                ) : (
                                  <Chip size="small" variant="outlined" label="Kapalı" />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                variant="outlined"
                                color={categoryTone.chip}
                                label={categoryMeta?.label || downtime.reasonCategory || '-'}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 160 }}>
                              <Stack spacing={0.75} alignItems="flex-end">
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {formatDurationMs(downtime.durationMs)}
                                </Typography>
                                {progress !== null ? (
                                  <LinearProgress
                                    variant="determinate"
                                    value={progress * 100}
                                    color={downtime.isOpen ? 'error' : 'info'}
                                    sx={{ width: 140, height: 6, borderRadius: 99 }}
                                  />
                                ) : null}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {downtime.startedAt ? formatDateTime(downtime.startedAt) : '-'}
                            </TableCell>
                            <TableCell>
                              {downtime.endedAt ? formatDateTime(downtime.endedAt) : 'Açık'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Divider sx={{ my: 1 }} />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Makineler</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Makine bazında as-of durum
                  </Typography>
                </Box>
                <TextField
                  size="small"
                  label="Makine Ara"
                  value={machineSearch}
                  onChange={(event) => setMachineSearch(event.target.value)}
                  sx={{ minWidth: { md: 280 } }}
                />
              </Stack>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Makine</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell align="right">Açık Duruş</TableCell>
                      <TableCell>Son Telemetry</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMachines.map((machine) => {
                      const machineStatus = machine.displayStatus || machine.status;
                      return (
                        <TableRow
                          key={machine.id}
                          sx={{
                            bgcolor:
                              machineStatus === 'downtime'
                                ? (theme) => alpha(theme.palette.error.main, 0.04)
                                : machineStatus === 'unknown'
                                ? (theme) => alpha(theme.palette.warning.main, 0.04)
                                : 'inherit',
                          }}
                        >
                          <TableCell>
                            {machine.code} — {machine.name}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={machineStatus} />
                            {machine.statusNote ? (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {machine.statusNote}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell align="right">
                            {machine.openDowntime ? (
                              <Stack spacing={0.5} alignItems="flex-end">
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {formatDurationMs(machine.openDowntime.durationMs)}
                                </Typography>
                                {machine.openDowntime.reasonCode ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {machine.openDowntime.reasonCode}
                                  </Typography>
                                ) : null}
                              </Stack>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {machine.lastTelemetryAt ? formatDateTime(machine.lastTelemetryAt) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {machines.length !== filteredMachines.length ? (
                <Typography variant="body2" color="text.secondary">
                  Gösterilen: {filteredMachines.length}/{machines.length}
                </Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
