import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchMachines } from "@/features/machines/services/machines-api.js";
import {
  fetchMachineBoardMetrics,
  fetchMachineTelemetrySeries,
} from "@/features/dashboard/services/board-api.js";
import { formatDateTime, formatTime } from "@/lib/date-format.js";
import { createAnomalyRiskInsight } from "@/lib/api/ai-api.js";

const LINES = [
  { id: "line-alpha", label: "Line Alpha (placeholder)" },
  { id: "line-beta", label: "Line Beta (placeholder)" },
];

const METRICS_POLL_INTERVAL_MS = 2000;
const TELEMETRY_POLL_INTERVAL_MS = 2000;
const TELEMETRY_POLL_INTERVAL_SECONDS = TELEMETRY_POLL_INTERVAL_MS / 1000;
const SHIFT_BUCKET_MINUTES = 15;
const SHIFT_TICK_HOURS = 1;
const TELEMETRY_SOURCES = [
  { id: "auto", label: "Auto" },
  { id: "shift-sim", label: "Shift Sim" },
  { id: "data-gen", label: "Data Gen" },
];

const normalizeTrendPoint = (point) => {
  const timestampMs = point?.timestamp
    ? new Date(point.timestamp).getTime()
    : Date.now();
  return {
    ...point,
    timestampMs,
  };
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("tr-TR", { maximumFractionDigits: 2 });
};

const MonitoringPage = () => {
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [selectedLineId, setSelectedLineId] = useState(LINES[0]?.id || "");
  const [telemetrySource, setTelemetrySource] = useState("auto");
  const [anomalyDialogOpen, setAnomalyDialogOpen] = useState(false);

  const machinesQuery = useQuery({
    queryKey: ["machines", "monitoring"],
    queryFn: fetchMachines,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!selectedMachineId && machinesQuery.data?.length) {
      setSelectedMachineId(
        machinesQuery.data[0].id || machinesQuery.data[0]._id
      );
    }
  }, [machinesQuery.data, selectedMachineId]);

  const machineMetricsQuery = useQuery({
    queryKey: ["monitoringMachineMetrics", selectedMachineId, telemetrySource],
    queryFn: () => fetchMachineBoardMetrics(selectedMachineId, { source: telemetrySource }),
    enabled: Boolean(selectedMachineId),
    refetchInterval: METRICS_POLL_INTERVAL_MS,
  });

  const telemetryView = useMemo(() => {
    if (telemetrySource === "shift-sim") return "shift";
    if (telemetrySource === "data-gen") return "live";
    return "auto";
  }, [telemetrySource]);

  const telemetryQuery = useQuery({
    queryKey: [
      "monitoringMachineTelemetry",
      selectedMachineId,
      SHIFT_BUCKET_MINUTES,
      telemetrySource,
      telemetryView,
    ],
    queryFn: () =>
      fetchMachineTelemetrySeries({
        machineId: selectedMachineId,
        view: telemetryView,
        source: telemetrySource,
        bucketMinutes: SHIFT_BUCKET_MINUTES,
        limit: telemetryView === "live" ? 200 : undefined,
      }),
    enabled: Boolean(selectedMachineId),
    refetchInterval: TELEMETRY_POLL_INTERVAL_MS,
  });

  const anomalyQuery = useQuery({
    queryKey: ["monitoringAnomalyRisk", selectedMachineId, telemetrySource],
    queryFn: () =>
      createAnomalyRiskInsight({
        machineId: selectedMachineId,
        source: telemetrySource,
      }),
    enabled: Boolean(selectedMachineId),
    refetchInterval: 10000,
  });

  const anomalyInsight = anomalyQuery.data?.insight || null;
  const anomalyOutput = anomalyInsight?.output || {};
  const anomalyMetrics = Array.isArray(anomalyOutput.affectedMetrics)
    ? anomalyOutput.affectedMetrics
    : [];
  const anomalyRiskLevel = anomalyOutput.riskLevel || "medium";
  const anomalyTone =
    anomalyRiskLevel === "high"
      ? "error"
      : anomalyRiskLevel === "medium"
      ? "warning"
      : "info";

  const trendData = useMemo(
    () => (telemetryQuery.data?.series || []).map(normalizeTrendPoint),
    [telemetryQuery.data?.series]
  );

  const shiftWindowStartMs = useMemo(() => {
    const start = telemetryQuery.data?.windowStart;
    const parsed = start ? new Date(start) : null;
    return parsed && !Number.isNaN(parsed.getTime())
      ? parsed.getTime()
      : Date.now();
  }, [telemetryQuery.data?.windowStart]);

  const shiftWindowEndMs = useMemo(() => {
    const end = telemetryQuery.data?.windowEnd;
    const parsed = end ? new Date(end) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : Date.now();
  }, [telemetryQuery.data?.windowEnd]);

  const chartDomain = useMemo(() => {
    return [shiftWindowStartMs, shiftWindowEndMs];
  }, [shiftWindowEndMs, shiftWindowStartMs]);

  const chartTicks = useMemo(() => {
    if (!shiftWindowStartMs || !shiftWindowEndMs) return undefined;
    const stepMs =
      telemetryQuery.data?.view === "live"
        ? 5 * 60 * 1000
        : SHIFT_TICK_HOURS * 60 * 60 * 1000;
    if (!stepMs) return undefined;

    const ticks = [];
    for (let t = shiftWindowStartMs; t <= shiftWindowEndMs; t += stepMs) {
      ticks.push(t);
    }
    return ticks;
  }, [shiftWindowEndMs, shiftWindowStartMs]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Typography variant="h6">Monitoring</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="source-select-label">Kaynak</InputLabel>
                <Select
                  labelId="source-select-label"
                  label="Kaynak"
                  value={telemetrySource}
                  onChange={(event) => setTelemetrySource(event.target.value)}
                >
                  {TELEMETRY_SOURCES.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="line-select-label">Hat</InputLabel>
                <Select
                  labelId="line-select-label"
                  label="Hat"
                  value={selectedLineId}
                  onChange={(event) => setSelectedLineId(event.target.value)}
                >
                  {LINES.map((line) => (
                    <MenuItem key={line.id} value={line.id}>
                      {line.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                size="small"
                fullWidth
                disabled={machinesQuery.isLoading}
              >
                <InputLabel id="machine-select-label">Makine</InputLabel>
                <Select
                  labelId="machine-select-label"
                  label="Makine"
                  value={selectedMachineId}
                  onChange={(event) => setSelectedMachineId(event.target.value)}
                >
                  {(machinesQuery.data || []).map((machine) => (
                    <MenuItem
                      key={machine.id || machine._id}
                      value={machine.id || machine._id}
                    >
                      {machine.code} — {machine.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {anomalyQuery.isError ? (
        <Alert severity="error">
          Anomali analizi alınamadı:{" "}
          {anomalyQuery.error?.response?.data?.message ||
            anomalyQuery.error?.message}
        </Alert>
      ) : anomalyInsight ? (
        <Alert
          severity={anomalyTone}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setAnomalyDialogOpen(true)}
            >
              Detay
            </Button>
          }
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2">
              Anomali Riski — {anomalyOutput.riskLevel || "medium"}
            </Typography>
            <Typography variant="body2">
              {anomalyOutput.summary || "Makinede olasi anomali riski tespit edildi."}
            </Typography>
            {anomalyMetrics.length ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {anomalyMetrics.map((metric, index) => (
                  <Chip
                    key={`${metric.metric}-${index}`}
                    size="small"
                    label={`${metric.metric} (z=${metric.zScore})`}
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Anlık Durum
              </Typography>
              {machineMetricsQuery.isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : machineMetricsQuery.isError ? (
                <Alert severity="error">
                  Makine verisi alınamadı:{" "}
                  {machineMetricsQuery.error?.response?.data?.message ||
                    machineMetricsQuery.error?.message}
                </Alert>
              ) : machineMetricsQuery.data ? (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Ortalama Sıcaklık
                  </Typography>
                  <Typography variant="h5">
                    {machineMetricsQuery.data.telemetry.avgTemperatureC
                      ? `${formatNumber(
                          machineMetricsQuery.data.telemetry.avgTemperatureC
                        )} °C`
                      : "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ortalama Tork
                  </Typography>
                  <Typography variant="h5">
                    {machineMetricsQuery.data.telemetry.avgTorqueNm
                      ? `${formatNumber(
                          machineMetricsQuery.data.telemetry.avgTorqueNm
                        )} Nm`
                      : "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Son Sinyal
                  </Typography>
                  <Typography variant="h5">
                    {machineMetricsQuery.data.signal.lastValue === null
                      ? "-"
                      : machineMetricsQuery.data.signal.lastValue === 1
                      ? "Çalışıyor"
                      : "Duruşta"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {machineMetricsQuery.data.signal.lastAt
                      ? formatDateTime(machineMetricsQuery.data.signal.lastAt)
                      : ""}
                  </Typography>
                </Stack>
              ) : null}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="caption" color="text.secondary">
                  Grafikler {TELEMETRY_POLL_INTERVAL_SECONDS} sn aralıkla sorgulanan
                  telemetri verisine göre güncellenir.{" "}
                  {telemetryQuery.data?.view === "live"
                    ? "X ekseni canlı pencere (son birkaç dakika) şeklindedir."
                    : `X ekseni sabit vardiya aralığıdır (07:00–18:00, ${SHIFT_BUCKET_MINUTES} dk bucket).`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Kaynak: {telemetryQuery.data?.source || "-"}
                  {telemetryQuery.data?.simulationRunId
                    ? ` (run ${telemetryQuery.data.simulationRunId})`
                    : ""}
                  {telemetryQuery.data?.virtualDay ? `, day ${telemetryQuery.data.virtualDay}` : ""}
                  {telemetryQuery.data?.latestAt
                    ? `, latest ${formatDateTime(telemetryQuery.data.latestAt)}`
                    : ""}
                </Typography>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Sinyal
                  </Typography>
                  {telemetryQuery.isLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 3 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : telemetryQuery.isError ? (
                    <Alert severity="error">
                      Trend verisi alınamadı:{" "}
                      {telemetryQuery.error?.response?.data?.message ||
                        telemetryQuery.error?.message}
                    </Alert>
                  ) : trendData.length === 0 ? (
                    <Typography color="text.secondary">
                      Trend verisi bulunamadı.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 140 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trendData}
                          margin={{ top: 5, right: 32, bottom: 0, left: 0 }}
                        >
                          <XAxis
                            dataKey="timestampMs"
                            type="number"
                            scale="time"
                            domain={chartDomain}
                            ticks={chartTicks}
                            allowDataOverflow
                            interval={0}
                            padding={{ right: 16 }}
                            stroke="#888"
                            fontSize={12}
                            tickFormatter={(value) =>
                              typeof value === "number"
                                ? formatTime(value)
                                : value
                            }
                          />
                          <YAxis
                            domain={[0, 1]}
                            ticks={[0, 1]}
                            stroke="#f50057"
                            tickFormatter={(value) =>
                              typeof value === "number"
                                ? Math.round(value)
                                : value
                            }
                          />
                          <RechartsTooltip
                            labelFormatter={(value) =>
                              typeof value === "number"
                                ? formatDateTime(value)
                                : value
                            }
                          />
                          <Line
                            type="stepAfter"
                            dataKey="signalValue"
                            stroke="#f50057"
                            name="Sinyal"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Telemetry (°C / Nm / kWh)
                  </Typography>
                  {telemetryQuery.isLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 3 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : telemetryQuery.isError ? (
                    <Alert severity="error">
                      Trend verisi alınamadı:{" "}
                      {telemetryQuery.error?.response?.data?.message ||
                        telemetryQuery.error?.message}
                    </Alert>
                  ) : trendData.length === 0 ? (
                    <Typography color="text.secondary">
                      Trend verisi bulunamadı.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trendData}
                          margin={{ top: 5, right: 32, bottom: 0, left: 0 }}
                        >
                          <XAxis
                            dataKey="timestampMs"
                            type="number"
                            scale="time"
                            domain={chartDomain}
                            ticks={chartTicks}
                            allowDataOverflow
                            interval={0}
                            padding={{ right: 16 }}
                            stroke="#888"
                            fontSize={12}
                            tickFormatter={(value) =>
                              typeof value === "number"
                                ? formatTime(value)
                                : value
                            }
                          />
                          <YAxis
                            stroke="#666"
                            fontSize={12}
                            tickFormatter={(value) => `${value}`}
                          />
                          <RechartsTooltip
                            labelFormatter={(value) =>
                              typeof value === "number"
                                ? formatDateTime(value)
                                : value
                            }
                          />
                          <Line
                            type="linear"
                            dataKey="metrics.temperatureC"
                            stroke="#ff7043"
                            name="Sıcaklık (°C)"
                            dot={false}
                          />
                          <Line
                            type="linear"
                            dataKey="metrics.torqueNm"
                            stroke="#42a5f5"
                            name="Tork (Nm)"
                            dot={false}
                          />
                          <Line
                            type="linear"
                            dataKey="metrics.energyKwh"
                            stroke="#66bb6a"
                            name="Enerji (kWh)"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={anomalyDialogOpen}
        onClose={() => setAnomalyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Anomali Risk Detayi</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">Risk seviyesi</Typography>
              <Chip
                size="small"
                label={anomalyOutput.riskLevel || "medium"}
                color={anomalyTone}
              />
            </Stack>
            <Typography variant="body2">
              {anomalyOutput.summary || "Ozet bulunamadi."}
            </Typography>
            <Divider />
            <Stack spacing={1}>
              <Typography variant="subtitle2">Etkilenen metrikler</Typography>
              {anomalyMetrics.length ? (
                anomalyMetrics.map((metric, index) => (
                  <Stack key={`${metric.metric}-${index}`} spacing={0.5}>
                    <Typography variant="body2">
                      {metric.metric}: value {metric.value ?? "-"}, z {metric.zScore ?? "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      baseline mean {metric.baselineMean ?? "-"} / std {metric.baselineStd ?? "-"}
                    </Typography>
                  </Stack>
                ))
              ) : (
                <Typography variant="body2">Veri yok.</Typography>
              )}
            </Stack>
            {Array.isArray(anomalyOutput.actions) &&
            anomalyOutput.actions.length ? (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Onerilen aksiyonlar</Typography>
                  {anomalyOutput.actions.map((action, index) => (
                    <Typography key={index} variant="body2">
                      • {action.title || "Aksiyon"} — {action.reason || "gerekce yok"}
                    </Typography>
                  ))}
                </Stack>
              </>
            ) : null}
            {Array.isArray(anomalyOutput.warnings) &&
            anomalyOutput.warnings.length ? (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Uyarilar</Typography>
                  {anomalyOutput.warnings.map((warning, index) => (
                    <Typography key={index} variant="body2">
                      • {warning}
                    </Typography>
                  ))}
                </Stack>
              </>
            ) : null}
            {anomalyOutput.qualityNote ? (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Kalite notu</Typography>
                  <Typography variant="body2">{anomalyOutput.qualityNote}</Typography>
                </Stack>
              </>
            ) : null}
            {anomalyInsight?.generatedAt ? (
              <Typography variant="caption" color="text.secondary">
                Analiz tarihi: {formatDateTime(anomalyInsight.generatedAt)}
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnomalyDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default MonitoringPage;
