import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  clearSimulationLogs,
  fetchSimulationLogs,
  fetchSimulations,
  resetSimulationData,
  startSimulation,
  stopSimulation,
} from "@/features/simulations/services/simulations-api.js";
import { formatDateTime } from "@/lib/date-format.js";

const STATUS_POLL_MS = 2000;
const LOG_POLL_MS = 1000;
const UI_LOG_LIMIT = 2000;

const buildLogLine = (entry) => {
  const ts = entry.ts ? formatDateTime(entry.ts) : "";
  const stream = entry.stream || "stdout";
  const prefix = ts ? `${ts} ` : "";
  const tag =
    stream === "stderr" ? "[err]" : stream === "system" ? "[sys]" : "[out]";
  return `${prefix}${tag} ${entry.message || ""}`;
};

const SimulationsPage = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState("data-gen");
  const [pollLogs, setPollLogs] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logState, setLogState] = useState(() => ({}));
  const logStateRef = useRef(logState);
  const bottomRef = useRef(null);
  const logBoxRef = useRef(null);

  useEffect(() => {
    logStateRef.current = logState;
  }, [logState]);

  const {
    data: simulationsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["simulations"],
    queryFn: fetchSimulations,
    refetchInterval: STATUS_POLL_MS,
  });

  const controlEnabled = simulationsData?.enabled !== false;

  const stableSimulations = useMemo(
    () => simulationsData?.items ?? [],
    [simulationsData]
  );

  const selectedSimulation = useMemo(
    () => stableSimulations.find((s) => s.name === selected),
    [stableSimulations, selected]
  );

  const startMutation = useMutation({
    mutationFn: (name) => startSimulation(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Simülasyon başlatılamadı."
      );
    },
  });

  const stopMutation = useMutation({
    mutationFn: (name) => stopSimulation(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Simülasyon durdurulamadı."
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: (name) => resetSimulationData(name),
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
      toast.success(`${name} resetlendi.`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Reset işlemi başarısız.");
    },
  });

  const clearLogsMutation = useMutation({
    mutationFn: (name) => clearSimulationLogs(name),
    onSuccess: (_data, name) => {
      setLogState((prev) => ({ ...prev, [name]: { cursor: 0, items: [] } }));
      toast.success("Log temizlendi.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Log temizlenemedi.");
    },
  });

  const loadInitialLogs = async (name) => {
    try {
      const data = await fetchSimulationLogs(name, { limit: 500 });
      setLogState((prev) => ({
        ...prev,
        [name]: {
          cursor: data.cursor || 0,
          items: (data.items || []).slice(-UI_LOG_LIMIT),
        },
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Log alınamadı.");
    }
  };

  useEffect(() => {
    if (!selected) return;
    if (!logStateRef.current[selected]) {
      loadInitialLogs(selected);
    }
  }, [selected]);

  useEffect(() => {
    if (!pollLogs || !selected) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      const current = logStateRef.current[selected];
      const afterId = current?.cursor || 0;

      try {
        const data = await fetchSimulationLogs(selected, {
          afterId,
          limit: 500,
        });
        if (data?.items?.length) {
          setLogState((prev) => {
            const prevSim = prev[selected] || { cursor: 0, items: [] };
            const merged = [...prevSim.items, ...data.items].slice(
              -UI_LOG_LIMIT
            );
            return {
              ...prev,
              [selected]: {
                cursor: data.cursor || prevSim.cursor || 0,
                items: merged,
              },
            };
          });
        }
      } catch {
        // sessiz: polling sırasında toast spam olmasın
      } finally {
        setTimeout(tick, LOG_POLL_MS);
      }
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [pollLogs, selected]);

  const selectedLogLength = logState[selected]?.items?.length || 0;

  useEffect(() => {
    if (!autoScroll) return;
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [autoScroll, selected, selectedLogLength]);

  const handleLogScroll = (event) => {
    const el = event.currentTarget;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > 40 && autoScroll) {
      setAutoScroll(false);
    }
  };

  const getChip = (simulation) => {
    if (simulation.running) {
      return <Chip label="Çalışıyor" color="success" size="small" />;
    }
    return <Chip label="Kapalı" color="default" size="small" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Yükleniyor...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Simülasyonlar
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={() => refetch()}
        >
          Yenile
        </Button>
      </Stack>

      {!controlEnabled && (
        <Alert severity="warning" variant="outlined">
          Simülasyon kontrolü kapalı. Backend tarafında
          `ENABLE_SIMULATION_CONTROL=true` ayarlayın.
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="stretch"
      >
        <Stack spacing={2} sx={{ flex: 1, minWidth: 320 }}>
          {stableSimulations.map((simulation) => (
            <Card key={simulation.name} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  gap={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {simulation.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {simulation.description}
                    </Typography>
                  </Box>
                  {getChip(simulation)}
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 2, flexWrap: "wrap" }}
                >
                  <Chip
                    label={`PID: ${simulation.pid || "-"}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: "monospace" }}
                  />
                  <Chip
                    label={`Başlangıç: ${formatDateTime(simulation.startedAt)}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Son çıkış: ${simulation.lastExitCode ?? "-"} ${
                      simulation.lastExitSignal
                        ? `(${simulation.lastExitSignal})`
                        : ""
                    }`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                {simulation.name === "job-sim" &&
                  !stableSimulations.find((s) => s.name === "data-gen")
                    ?.running &&
                  !stableSimulations.find((s) => s.name === "shift-sim")
                    ?.running && (
                    <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
                      `job-sim` üretim yazabilmek için telemetry sinyaline
                      ihtiyaç duyar.
                    </Alert>
                  )}

                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    disabled={
                      !controlEnabled ||
                      simulation.running ||
                      startMutation.isPending
                    }
                    onClick={() => startMutation.mutate(simulation.name)}
                  >
                    Başlat
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<StopIcon />}
                    color="error"
                    disabled={
                      !controlEnabled ||
                      !simulation.running ||
                      stopMutation.isPending
                    }
                    onClick={() => stopMutation.mutate(simulation.name)}
                  >
                    Durdur
                  </Button>
                  {simulation.name === "shift-sim" && (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<DeleteSweepIcon />}
                      disabled={
                        !controlEnabled ||
                        simulation.running ||
                        resetMutation.isPending
                      }
                      onClick={() => {
                        const ok = window.confirm(
                          "shift-sim resetlenecek: telemetry + sim kaynaklı event verileri silinecek. Devam edilsin mi?"
                        );
                        if (!ok) return;
                        resetMutation.mutate(simulation.name);
                      }}
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    variant="text"
                    startIcon={<DeleteSweepIcon />}
                    disabled={!controlEnabled || clearLogsMutation.isPending}
                    onClick={() => clearLogsMutation.mutate(simulation.name)}
                  >
                    Log Temizle
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Card variant="outlined" sx={{ flex: 1, minWidth: 360 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Log Konsolu
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={pollLogs}
                        onChange={(e) => setPollLogs(e.target.checked)}
                      />
                    }
                    label="Canlı"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                      />
                    }
                    label="Auto-scroll"
                  />
                </Stack>
              </Stack>

              <Tabs
                value={selected}
                onChange={(_e, value) => setSelected(value)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {stableSimulations.map((simulation) => (
                  <Tab
                    key={simulation.name}
                    value={simulation.name}
                    label={simulation.name}
                  />
                ))}
              </Tabs>

              <Divider />

              {!selectedSimulation && (
                <Typography variant="body2" color="text.secondary">
                  Log görmek için bir simülasyon seç.
                </Typography>
              )}

              {selectedSimulation && (
                <Box
                  ref={logBoxRef}
                  onScroll={handleLogScroll}
                  sx={{
                    height: 420,
                    overflow: "auto",
                    borderRadius: 1,
                    bgcolor: "#0b1020",
                    color: "#e5e7eb",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 12,
                    lineHeight: 1.6,
                    p: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {(logState[selected]?.items || []).length === 0 && (
                    <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                      Henüz log yok.
                    </Typography>
                  )}
                  {(logState[selected]?.items || []).map((entry) => (
                    <Box
                      key={entry.id}
                      component="div"
                      sx={{
                        color:
                          entry.stream === "stderr"
                            ? "#fca5a5"
                            : entry.stream === "system"
                            ? "#93c5fd"
                            : "#e5e7eb",
                      }}
                    >
                      {buildLogLine(entry)}
                    </Box>
                  ))}
                  <Box ref={bottomRef} />
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
};

export default SimulationsPage;
