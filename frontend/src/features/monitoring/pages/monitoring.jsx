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
} from "@/features/dashboard/services/board-api.js";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const LINES = [
  { id: "line-alpha", label: "Line Alpha (placeholder)" },
  { id: "line-beta", label: "Line Beta (placeholder)" },
];

const formatNumber = (value) => {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("tr-TR", { maximumFractionDigits: 2 });
};

const MonitoringPage = () => {
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [selectedLineId, setSelectedLineId] = useState(LINES[0]?.id || "");

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
    refetchInterval: 10000,
  });

  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState(null);
  const lastTimestampRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!selectedMachineId) return () => {};
    let isMounted = true;
    setTrendData([]);
    setTrendError(null);
    setTrendLoading(true);

    const loadInitial = async () => {
      try {
        const payload = await fetchMachineTelemetrySeries({
          machineId: selectedMachineId,
          limit: 120,
        });
        if (!isMounted) return;
        setTrendData(payload.series || []);
        if (payload.series?.length) {
          lastTimestampRef.current =
            payload.series[payload.series.length - 1].timestamp;
        } else {
          lastTimestampRef.current = null;
        }
      } catch (error) {
        if (isMounted) setTrendError(error);
      } finally {
        if (isMounted) setTrendLoading(false);
      }
    };

    const loadIncremental = async () => {
      if (!lastTimestampRef.current) return;
      try {
        const payload = await fetchMachineTelemetrySeries({
          machineId: selectedMachineId,
          since: lastTimestampRef.current,
        });
        if (!payload.series?.length) return;
        setTrendData((prev) => {
          const merged = [...prev, ...payload.series];
          const windowStart = payload.windowStart
            ? new Date(payload.windowStart).getTime()
            : Date.now() - 10 * 60 * 1000;
          const filtered = merged.filter(
            (point) => new Date(point.timestamp).getTime() >= windowStart
          );
          if (filtered.length > 240) {
            filtered.splice(0, filtered.length - 240);
          }
          return filtered;
        });
        lastTimestampRef.current =
          payload.series[payload.series.length - 1].timestamp ||
          lastTimestampRef.current;
      } catch (error) {
        setTrendError(error);
      }
    };

    loadInitial();
    intervalRef.current = setInterval(loadIncremental, 2000);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [selectedMachineId]);

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
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Sinyal (0/1)
                  </Typography>
                  {trendLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 3 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : trendError ? (
                    <Alert severity="error">
                      Trend verisi alınamadı:{" "}
                      {trendError?.response?.data?.message ||
                        trendError?.message}
                    </Alert>
                  ) : trendData.length === 0 ? (
                    <Typography color="text.secondary">
                      Trend verisi bulunamadı.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 140 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <XAxis
                            dataKey="timestamp"
                            stroke="#888"
                            fontSize={12}
                            tickFormatter={(value) =>
                              format(new Date(value), "HH:mm:ss", {
                                locale: tr,
                              })
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
                              format(new Date(value), "dd.MM.yyyy HH:mm:ss", {
                                locale: tr,
                              })
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
                  {trendLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 3 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : trendError ? (
                    <Alert severity="error">
                      Trend verisi alınamadı:{" "}
                      {trendError?.response?.data?.message ||
                        trendError?.message}
                    </Alert>
                  ) : trendData.length === 0 ? (
                    <Typography color="text.secondary">
                      Trend verisi bulunamadı.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <XAxis
                            dataKey="timestamp"
                            stroke="#888"
                            fontSize={12}
                            tickFormatter={(value) =>
                              format(new Date(value), "HH:mm:ss", {
                                locale: tr,
                              })
                            }
                          />
                          <YAxis
                            stroke="#666"
                            fontSize={12}
                            tickFormatter={(value) => `${value}`}
                          />
                          <RechartsTooltip
                            labelFormatter={(value) =>
                              format(new Date(value), "dd.MM.yyyy HH:mm:ss", {
                                locale: tr,
                              })
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="metrics.temperatureC"
                            stroke="#ff7043"
                            name="Sıcaklık (°C)"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="metrics.torqueNm"
                            stroke="#42a5f5"
                            name="Tork (Nm)"
                            dot={false}
                          />
                          <Line
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
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default MonitoringPage;
