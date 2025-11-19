import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  fetchMachineTelemetryTrend,
} from "@/features/dashboard/services/board-api.js";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const LINES = [
  { id: "line-alpha", label: "Line Alpha (placeholder)" },
  { id: "line-beta", label: "Line Beta (placeholder)" },
];

const METRICS_POLL_INTERVAL_MS = 2000;
const TELEMETRY_POLL_INTERVAL_MS = 2000;
const TELEMETRY_POLL_INTERVAL_SECONDS = TELEMETRY_POLL_INTERVAL_MS / 1000;
const TELEMETRY_WINDOWS = [
  { id: "1h", label: "1 Saat", value: 60 * 60 * 1000 },
  { id: "6h", label: "6 Saat", value: 6 * 60 * 60 * 1000 },
  { id: "12h", label: "12 Saat", value: 12 * 60 * 60 * 1000 },
  { id: "24h", label: "24 Saat", value: 24 * 60 * 60 * 1000 },
];
const DEFAULT_TELEMETRY_WINDOW_MS = TELEMETRY_WINDOWS[0].value;
const TREND_RANGE_HOURS = 24 * 7;
const TREND_BIN_MINUTES = 60;

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
  const [selectedWindowMs, setSelectedWindowMs] = useState(
    DEFAULT_TELEMETRY_WINDOW_MS
  );

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
    queryKey: ["monitoringMachineMetrics", selectedMachineId],
    queryFn: () => fetchMachineBoardMetrics(selectedMachineId),
    enabled: Boolean(selectedMachineId),
    refetchInterval: METRICS_POLL_INTERVAL_MS,
  });

  const [telemetryData, setTelemetryData] = useState([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const lastTimestampRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const machineTrendQuery = useQuery({
    queryKey: [
      "machineTrend",
      selectedMachineId,
      TREND_RANGE_HOURS,
      TREND_BIN_MINUTES,
    ],
    queryFn: () =>
      fetchMachineTelemetryTrend({
        machineId: selectedMachineId,
        rangeHours: TREND_RANGE_HOURS,
        binMinutes: TREND_BIN_MINUTES,
      }),
    enabled: Boolean(selectedMachineId),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!selectedMachineId) return () => {};
    let isMounted = true;
    setTelemetryData([]);
    setTelemetryError(null);
    setTelemetryLoading(true);

    const baseLimit = Math.min(
      Math.ceil(selectedWindowMs / TELEMETRY_POLL_INTERVAL_MS) + 60,
      2000
    );

    const loadInitial = async () => {
      try {
        const payload = await fetchMachineTelemetrySeries({
          machineId: selectedMachineId,
          limit: baseLimit,
          windowMs: selectedWindowMs,
        });
        if (!isMounted) return;
        const windowStartMs = payload.windowStart
          ? new Date(payload.windowStart).getTime()
          : Date.now() - selectedWindowMs;
        const normalizedSeries = (payload.series || []).map(
          normalizeTrendPoint
        );
        setTelemetryData(normalizedSeries);
        if (normalizedSeries.length) {
          lastTimestampRef.current =
            normalizedSeries[normalizedSeries.length - 1].timestamp ||
            lastTimestampRef.current;
        } else {
          lastTimestampRef.current = null;
        }
      } catch (error) {
        if (isMounted) setTelemetryError(error);
      } finally {
        if (isMounted) setTelemetryLoading(false);
      }
    };

    const loadIncremental = async () => {
      if (!lastTimestampRef.current) return;
      try {
        const payload = await fetchMachineTelemetrySeries({
          machineId: selectedMachineId,
          since: lastTimestampRef.current,
          windowMs: selectedWindowMs,
        });
        if (!payload.series?.length) return;
        const windowStartMs = payload.windowStart
          ? new Date(payload.windowStart).getTime()
          : Date.now() - selectedWindowMs;
        const normalizedSeries = payload.series.map(normalizeTrendPoint);
        setTelemetryData((prev) => {
          const merged = [...prev, ...normalizedSeries];
          const filtered = merged.filter(
            (point) => point.timestampMs >= windowStartMs
          );
          const maxPoints = Math.min(baseLimit, 2000);
          if (filtered.length > maxPoints) {
            filtered.splice(0, filtered.length - maxPoints);
          }
          return filtered;
        });
        lastTimestampRef.current =
          normalizedSeries[normalizedSeries.length - 1].timestamp ||
          lastTimestampRef.current;
      } catch (error) {
        setTelemetryError(error);
      }
    };

    loadInitial();
    intervalRef.current = setInterval(
      loadIncremental,
      TELEMETRY_POLL_INTERVAL_MS
    );

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [selectedMachineId, selectedWindowMs]);

  const chartDomain = useMemo(() => {
    const windowStart = Math.max(0, nowMs - selectedWindowMs);
    if (!telemetryData.length) {
      return [windowStart, nowMs];
    }
    return [windowStart, "auto"];
  }, [nowMs, telemetryData.length, selectedWindowMs]);

  const trendChartData = useMemo(() => {
    return (machineTrendQuery.data?.buckets || []).map((bucket) => {
      const timestamp = bucket.bucketStart
        ? new Date(bucket.bucketStart).getTime()
        : Date.now();
      return {
        ...bucket,
        bucketStartMs: timestamp,
        uptimePercent:
          bucket.uptimeRatio === null || bucket.uptimeRatio === undefined
            ? null
            : Number(bucket.uptimeRatio) * 100,
      };
    });
  }, [machineTrendQuery.data]);

  const trendUptimePercent = useMemo(() => {
    if (!trendChartData.length) return null;
    const ratios = trendChartData
      .map((item) => item.uptimePercent)
      .filter((value) => value !== null && value !== undefined);
    if (!ratios.length) return null;
    const avg = ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
    return avg;
  }, [trendChartData]);

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
              <FormControl size="small" fullWidth>
                <InputLabel id="window-select-label">Zaman Aralığı</InputLabel>
                <Select
                  labelId="window-select-label"
                  label="Zaman Aralığı"
                  value={selectedWindowMs}
                  onChange={(event) =>
                    setSelectedWindowMs(Number(event.target.value))
                  }
                >
                  {TELEMETRY_WINDOWS.map((option) => (
                    <MenuItem key={option.id} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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
                      ? format(
                          new Date(machineMetricsQuery.data.signal.lastAt),
                          "dd.MM.yyyy HH:mm",
                          {
                            locale: tr,
                          }
                        )
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
                  telemetri verisine göre güncellenir; yeni numune gelmezse eksen yine
                  gerçek zamana göre akmaya devam eder.
                </Typography>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Sinyal (0/1)
                  </Typography>
                  {telemetryLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 3 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : telemetryError ? (
                    <Alert severity="error">
                      Trend verisi alınamadı:{" "}
                      {telemetryError?.response?.data?.message ||
                        telemetryError?.message}
                    </Alert>
                  ) : telemetryData.length === 0 ? (
                    <Typography color="text.secondary">
                      Trend verisi bulunamadı.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 140 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={telemetryData}>
                          <XAxis
                            dataKey="timestampMs"
                            type="number"
                            scale="time"
                            domain={chartDomain}
                            stroke="#888"
                            fontSize={12}
                            tickFormatter={(value) =>
                              typeof value === "number"
                                ? format(new Date(value), "HH:mm:ss", {
                                    locale: tr,
                                  })
                                : value
                            }
                          />
                          <YAxis
                            domain={[0, 1]}
                            tickCount={2}
                            stroke="#f50057"
                            tickFormatter={(value) => `${value}`}
                          />
                          <RechartsTooltip
                            labelFormatter={(value) =>
                              typeof value === "number"
                                ? format(new Date(value), "dd.MM.yyyy HH:mm:ss", {
                                    locale: tr,
                                  })
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
                  {telemetryLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 3 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : telemetryError ? (
                    <Alert severity="error">
                      Trend verisi alınamadı:{" "}
                      {telemetryError?.response?.data?.message ||
                        telemetryError?.message}
                    </Alert>
                  ) : telemetryData.length === 0 ? (
                    <Typography color="text.secondary">
                      Trend verisi bulunamadı.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={telemetryData}>
                          <XAxis
                            dataKey="timestampMs"
                            type="number"
                            scale="time"
                            domain={chartDomain}
                            stroke="#888"
                            fontSize={12}
                            tickFormatter={(value) =>
                              typeof value === "number"
                                ? format(new Date(value), "HH:mm:ss", {
                                    locale: tr,
                                  })
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
                                ? format(new Date(value), "dd.MM.yyyy HH:mm:ss", {
                                    locale: tr,
                                  })
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

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={1}
            >
              <Typography variant="h6">Trend (Son 7 Gün)</Typography>
              <Typography variant="body2" color="text.secondary">
                Saatlik ortalama telemetry & uptime
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Ortalama uptime: {" "}
              {trendUptimePercent === null
                ? "-"
                : `${trendUptimePercent.toFixed(1)} %`}
            </Typography>
            {machineTrendQuery.isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : machineTrendQuery.isError ? (
              <Alert severity="error">
                Trend verisi alınamadı: {" "}
                {machineTrendQuery.error?.response?.data?.message ||
                  machineTrendQuery.error?.message}
              </Alert>
            ) : trendChartData.length === 0 ? (
              <Typography color="text.secondary">
                Trend verisi bulunamadı.
              </Typography>
            ) : (
              <Stack spacing={3}>
                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData}>
                      <XAxis
                        dataKey="bucketStartMs"
                        type="number"
                        scale="time"
                        stroke="#888"
                        fontSize={12}
                        tickFormatter={(value) =>
                          typeof value === "number"
                            ? format(new Date(value), "dd.MM HH:mm", {
                                locale: tr,
                              })
                            : value
                        }
                      />
                      <YAxis stroke="#666" fontSize={12} />
                      <RechartsTooltip
                        labelFormatter={(value) =>
                          typeof value === "number"
                            ? format(new Date(value), "dd.MM.yyyy HH:mm", {
                                locale: tr,
                              })
                            : value
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="avgTemperatureC"
                        stroke="#ff7043"
                        name="Sıcaklık (°C)"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgTorqueNm"
                        stroke="#42a5f5"
                        name="Tork (Nm)"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgEnergyKwh"
                        stroke="#66bb6a"
                        name="Enerji (kWh)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData}>
                      <XAxis
                        dataKey="bucketStartMs"
                        type="number"
                        scale="time"
                        stroke="#888"
                        fontSize={12}
                        tickFormatter={(value) =>
                          typeof value === "number"
                            ? format(new Date(value), "dd.MM HH:mm", {
                                locale: tr,
                              })
                            : value
                        }
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        stroke="#888"
                      />
                      <RechartsTooltip
                        labelFormatter={(value) =>
                          typeof value === "number"
                            ? format(new Date(value), "dd.MM.yyyy HH:mm", {
                                locale: tr,
                              })
                            : value
                        }
                        formatter={(value) =>
                          value === null || value === undefined
                            ? "-"
                            : `${value.toFixed(1)}%`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="uptimePercent"
                        stroke="#ab47bc"
                        name="Uptime (%)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default MonitoringPage;
