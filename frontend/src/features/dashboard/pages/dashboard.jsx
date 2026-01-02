import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
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
import { fetchOperationsDashboard } from '@/features/dashboard/services/board-api.js';
import { formatDateTime } from '@/lib/date-format.js';

const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
};

const formatDurationMs = (value) => {
  if (value === null || value === undefined) return '-';
  const minutes = value / 60000;
  if (minutes < 60) return `${formatNumber(minutes)} dk`;
  const hours = minutes / 60;
  return `${formatNumber(hours)} sa`;
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

const DashboardPage = () => {
  const [source, setSource] = useState('mock-batch');
  const [shiftDate, setShiftDate] = useState('');

  const operationsQuery = useQuery({
    queryKey: ['operationsDashboard', source, shiftDate],
    queryFn: () =>
      fetchOperationsDashboard({
        source,
        shiftDate: shiftDate || undefined,
      }),
    refetchInterval: source === 'data-gen' || source === 'shift-sim' ? 15000 : false,
  });

  const cards = useMemo(() => {
    if (!operationsQuery.data) return [];
    const { counts } = operationsQuery.data;
    return [
      {
        label: 'Toplam Makine',
        value: formatNumber(counts.total),
        caption: 'Aktif makine',
      },
      {
        label: 'Çalışan',
        value: formatNumber(counts.running),
        caption: 'Şu an',
      },
      {
        label: 'Duruşta',
        value: formatNumber(counts.downtime),
        caption: 'Şu an',
      },
      {
        label: 'Boşta',
        value: formatNumber(counts.idle),
        caption: 'Job yok',
      },
      {
        label: 'Bilinmiyor',
        value: formatNumber(counts.unknown),
        caption: 'Veri yok',
      },
    ];
  }, [operationsQuery.data]);

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

  const effectiveShiftDate = operationsQuery.data?.shiftDate || '';
  const shiftDateValue = shiftDate || effectiveShiftDate;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Operasyon</Typography>
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
                    value={shiftDateValue}
                    onChange={(event) => setShiftDate(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Boş bırakılırsa son telemetry günü kullanılır."
                  />
                </Grid>
              </Grid>
              {operationsQuery.data?.windowStart && operationsQuery.data?.windowEnd ? (
                <Typography variant="body2" color="text.secondary">
                  Pencere: {formatDateTime(operationsQuery.data.windowStart)} →{' '}
                  {formatDateTime(operationsQuery.data.windowEnd)}
                  {operationsQuery.data.asOf ? ` • As-Of: ${formatDateTime(operationsQuery.data.asOf)}` : ''}
                </Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {cards.map((metric) => (
        <Grid item xs={12} sm={6} md={4} key={metric.label}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="h4" sx={{ my: 1 }}>
                {metric.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metric.caption}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Duruşlar</Typography>
              {(operationsQuery.data?.downtimes || []).length === 0 ? (
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
                      {operationsQuery.data.downtimes.map((downtime) => (
                        <TableRow key={downtime.id}>
                          <TableCell>
                            {downtime.machine?.code
                              ? `${downtime.machine.code} — ${downtime.machine.name}`
                              : '-'}
                          </TableCell>
                          <TableCell>{downtime.reasonCode || '-'}</TableCell>
                          <TableCell>{downtime.reasonCategory || '-'}</TableCell>
                          <TableCell align="right">{formatDurationMs(downtime.durationMs)}</TableCell>
                          <TableCell>
                            {downtime.startedAt ? formatDateTime(downtime.startedAt) : '-'}
                          </TableCell>
                          <TableCell>
                            {downtime.endedAt ? formatDateTime(downtime.endedAt) : 'Açık'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Typography variant="h6" sx={{ pt: 1 }}>
                Makineler
              </Typography>
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
                    {(operationsQuery.data?.machines || []).map((machine) => (
                      <TableRow key={machine.id}>
                        <TableCell>
                          {machine.code} — {machine.name}
                        </TableCell>
                        <TableCell>{STATUS_LABELS[machine.status] || machine.status}</TableCell>
                        <TableCell align="right">
                          {machine.openDowntime
                            ? formatDurationMs(machine.openDowntime.durationMs)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {machine.lastTelemetryAt ? formatDateTime(machine.lastTelemetryAt) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
