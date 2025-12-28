import { useEffect, useMemo, useState } from 'react';
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
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import { fetchOeeStats } from '@/features/reports/services/oee-api.js';

const MODE_OPTIONS = [
  { id: 'shift', label: 'Shift' },
  { id: 'range', label: 'Tarih Aralığı' },
];

const SOURCE_OPTIONS = [
  { id: 'shift-sim', label: 'Shift Sim' },
  { id: 'data-gen', label: 'Data Gen' },
  { id: 'auto', label: 'Auto' },
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

const toIsoString = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const ReportsPage = () => {
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [mode, setMode] = useState('shift');
  const [source, setSource] = useState('shift-sim');
  const [shiftDate, setShiftDate] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const machinesQuery = useQuery({
    queryKey: ['machines', 'reports'],
    queryFn: fetchMachines,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!selectedMachineId && machinesQuery.data?.length) {
      setSelectedMachineId(machinesQuery.data[0].id || machinesQuery.data[0]._id);
    }
  }, [machinesQuery.data, selectedMachineId]);

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
                    {statsQuery.data.windowStart
                      ? new Date(statsQuery.data.windowStart).toLocaleString('tr-TR')
                      : '-'}
                    {' — '}
                    {statsQuery.data.windowEnd
                      ? new Date(statsQuery.data.windowEnd).toLocaleString('tr-TR')
                      : '-'}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">OEE verisi bulunamadı.</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ReportsPage;
