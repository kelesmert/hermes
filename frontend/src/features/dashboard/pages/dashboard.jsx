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
  Typography,
} from '@mui/material';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  fetchBoardMetrics,
  fetchMachineBoardMetrics,
  fetchMachineTelemetrySeries,
} from '@/features/dashboard/services/board-api.js';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import { formatDateTime, formatTime } from '@/lib/date-format.js';

const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
};

const DashboardPage = () => {
  const [selectedMachineId, setSelectedMachineId] = useState(null);

  const boardQuery = useQuery({
    queryKey: ['boardMetrics'],
    queryFn: fetchBoardMetrics,
    refetchInterval: 10000,
  });

  const machinesQuery = useQuery({
    queryKey: ['machines', 'dashboard'],
    queryFn: fetchMachines,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!selectedMachineId && machinesQuery.data?.length) {
      setSelectedMachineId(machinesQuery.data[0].id || machinesQuery.data[0]._id);
    }
  }, [machinesQuery.data, selectedMachineId]);

  const machineMetricsQuery = useQuery({
    queryKey: ['boardMachineMetrics', selectedMachineId],
    queryFn: () => fetchMachineBoardMetrics(selectedMachineId),
    enabled: Boolean(selectedMachineId),
    refetchInterval: 10000,
  });

  const machineTelemetrySeriesQuery = useQuery({
    queryKey: ['boardMachineTelemetry', selectedMachineId],
    queryFn: () => fetchMachineTelemetrySeries({ machineId: selectedMachineId, limit: 40 }),
    enabled: Boolean(selectedMachineId),
    refetchInterval: 10000,
  });

  const cards = useMemo(() => {
    if (!boardQuery.data) return [];
    const { counts, telemetry, downtime } = boardQuery.data;
    return [
      {
        label: 'Toplam Makine',
        value: formatNumber(counts.totalMachines),
        caption: 'Sistemde kayıtlı',
      },
      {
        label: 'Çalışan',
        value: formatNumber(counts.runningMachines),
        caption: 'Son durum',
      },
      {
        label: 'Duruşta',
        value: formatNumber(counts.downtimeMachines),
        caption: 'Anlık',
      },
      {
        label: 'Ortalama Sıcaklık',
        value: telemetry.avgTemperatureC ? `${formatNumber(telemetry.avgTemperatureC)} °C` : '-',
        caption: 'Son pencere',
      },
      {
        label: 'Ortalama Tork',
        value: telemetry.avgTorqueNm ? `${formatNumber(telemetry.avgTorqueNm)} Nm` : '-',
        caption: 'Son pencere',
      },
      {
        label: 'Toplam Duruş Süresi',
        value: downtime.totalDowntimeMs
          ? `${formatNumber(downtime.totalDowntimeMs / 60000)} dk`
          : '-',
        caption: 'Seçili pencere',
      },
    ];
  }, [boardQuery.data]);

  if (boardQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (boardQuery.isError) {
    return (
      <Alert severity="error">
        Dashboard verileri alınamadı:{' '}
        {boardQuery.error?.response?.data?.message || boardQuery.error?.message}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
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
            <Stack spacing={3}>
              <Typography variant="h6">Makine Telemetry Özeti</Typography>
              <FormControl fullWidth size="small" disabled={machinesQuery.isLoading}>
                <InputLabel id="machine-select-label">Makine Seç</InputLabel>
                <Select
                  labelId="machine-select-label"
                  label="Makine Seç"
                  value={selectedMachineId || ''}
                  onChange={(event) => setSelectedMachineId(event.target.value)}
                >
                  {(machinesQuery.data || []).map((machine) => (
                    <MenuItem key={machine.id || machine._id} value={machine.id || machine._id}>
                      {machine.code} — {machine.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {machineMetricsQuery.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : machineMetricsQuery.isError ? (
                <Alert severity="error">
                  Makine verileri alınamadı:{' '}
                  {machineMetricsQuery.error?.response?.data?.message ||
                    machineMetricsQuery.error?.message}
                </Alert>
              ) : machineMetricsQuery.data ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ortalama Sıcaklık
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {machineMetricsQuery.data.telemetry.avgTemperatureC
                        ? `${formatNumber(machineMetricsQuery.data.telemetry.avgTemperatureC)} °C`
                        : '-'}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ortalama Tork
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {machineMetricsQuery.data.telemetry.avgTorqueNm
                        ? `${formatNumber(machineMetricsQuery.data.telemetry.avgTorqueNm)} Nm`
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ortalama Enerji
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {machineMetricsQuery.data.telemetry.avgEnergyKwh
                        ? `${formatNumber(machineMetricsQuery.data.telemetry.avgEnergyKwh)} kWh`
                        : '-'}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Son Sinyal
                    </Typography>
                    <Typography variant="h5">
                      {machineMetricsQuery.data.signal.lastValue === null
                        ? '-'
                        : machineMetricsQuery.data.signal.lastValue === 1
                        ? 'Çalışıyor'
                        : 'Duruşta'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {machineMetricsQuery.data.signal.lastAt
                        ? formatDateTime(machineMetricsQuery.data.signal.lastAt)
                        : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Telemetry Trend (Son ölçümler)
                    </Typography>
                    {machineTelemetrySeriesQuery.isLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : machineTelemetrySeriesQuery.isError ? (
                      <Alert severity="warning">
                        Trend verileri alınamadı:{' '}
                        {machineTelemetrySeriesQuery.error?.response?.data?.message ||
                          machineTelemetrySeriesQuery.error?.message}
                      </Alert>
                    ) : (machineTelemetrySeriesQuery.data?.series || []).length === 0 ? (
                      <Typography color="text.secondary">Trend verisi bulunamadı.</Typography>
                    ) : (
                      <Box sx={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={machineTelemetrySeriesQuery.data.series}>
                            <XAxis
                              dataKey="timestamp"
                              tickFormatter={(value) => formatTime(value)}
                              stroke="#999"
                              fontSize={12}
                            />
                            <YAxis
                              yAxisId="left"
                              stroke="#8884d8"
                              fontSize={12}
                              allowDecimals
                              tickFormatter={(value) => `${value}`}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              stroke="#82ca9d"
                              fontSize={12}
                              allowDecimals
                              tickFormatter={(value) => `${value}`}
                            />
                            <RechartsTooltip
                              labelFormatter={(value) => formatDateTime(value)}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="metrics.temperatureC"
                              stroke="#ff7043"
                              name="Sıcaklık (°C)"
                              dot={false}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="metrics.torqueNm"
                              stroke="#42a5f5"
                              name="Tork (Nm)"
                              dot={false}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="metrics.energyKwh"
                              stroke="#66bb6a"
                              name="Enerji (kWh)"
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">Makine verisi bulunamadı.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
