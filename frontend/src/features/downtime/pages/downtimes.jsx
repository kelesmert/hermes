import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import usePermissions from '@/hooks/use-permissions.js';
import { PERMISSIONS } from '@/constants/permissions.js';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import {
  confirmDowntime,
  createPlannedDowntimeRule,
  deletePlannedDowntimeRule,
  fetchDowntimes,
  fetchPlannedDowntimeRules,
  fetchPlannedDowntimeRuns,
  fetchReasonCatalog,
  startManualUnplannedDowntime,
  splitDowntime,
  updateDowntime,
  updatePlannedDowntimeRule,
} from '@/features/downtime/services/downtime-api.js';
import DowntimeEditDialog from '@/features/downtime/components/downtime-edit-dialog.jsx';
import ManualUnplannedDowntimeDialog from '@/features/downtime/components/manual-unplanned-downtime-dialog.jsx';
import PlannedDowntimeRuleDialog from '@/features/downtime/components/planned-downtime-rule-dialog.jsx';
import { formatDateTime } from '@/lib/date-format.js';

const toDatetimeLocalValue = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const toIsoIfValid = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const isEditableWithinWindow = (downtime, windowMinutes = 5) => {
  const base = downtime.endedAt ? new Date(downtime.endedAt) : new Date(downtime.startedAt);
  const deadline = new Date(base.getTime() + windowMinutes * 60 * 1000);
  return new Date() <= deadline;
};

const DowntimesPage = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManagePlans = hasPermission(PERMISSIONS.PRODUCTION_MANAGE);
  const [searchParams, setSearchParams] = useSearchParams();
  const contextMachineId = searchParams.get('machineId') || undefined;

  const [tab, setTab] = useState('open');
  const [plannedSubTab, setPlannedSubTab] = useState('rules');
  const [editingDowntime, setEditingDowntime] = useState(null);
  const [plannedDialog, setPlannedDialog] = useState(null);
  const [manualDialog, setManualDialog] = useState(null);
  const [historyFilters, setHistoryFilters] = useState(() => ({
    from: toDatetimeLocalValue(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    to: toDatetimeLocalValue(new Date()),
    category: '',
    reasonCode: '',
  }));
  const [runFilters, setRunFilters] = useState(() => ({
    from: toDatetimeLocalValue(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    to: toDatetimeLocalValue(new Date()),
    status: '',
  }));

  const { data: reasons = [], isLoading: reasonsLoading } = useQuery({
    queryKey: ['reasonCatalog'],
    queryFn: fetchReasonCatalog,
  });

  const plannedReasons = useMemo(() => reasons.filter((r) => r.category === 'planned'), [reasons]);
  const unplannedReasons = useMemo(() => reasons.filter((r) => r.category === 'unplanned'), [reasons]);

  const { data: machines = [] } = useQuery({
    queryKey: ['machines'],
    queryFn: fetchMachines,
  });

  const {
    data: openDowntimes = [],
    isLoading: openLoading,
    refetch: refetchOpen,
  } = useQuery({
    queryKey: ['downtimes', 'open', contextMachineId || 'all'],
    queryFn: () =>
      fetchDowntimes({
        status: 'open',
        limit: 200,
        ...(contextMachineId && { machineId: contextMachineId }),
      }),
    enabled: tab === 'open',
  });

  const {
    data: plannedRules = [],
    isLoading: plannedLoading,
    refetch: refetchRules,
  } = useQuery({
    queryKey: ['plannedDowntimeRules', contextMachineId || 'all'],
    queryFn: () =>
      fetchPlannedDowntimeRules({
        ...(contextMachineId && { machineId: contextMachineId }),
      }),
    enabled: tab === 'planned' && plannedSubTab === 'rules',
  });

  const {
    data: plannedRuns = [],
    isLoading: plannedRunsLoading,
    refetch: refetchRuns,
  } = useQuery({
    queryKey: [
      'plannedDowntimeRuns',
      contextMachineId || 'all',
      runFilters.from,
      runFilters.to,
      runFilters.status,
    ],
    queryFn: () =>
      fetchPlannedDowntimeRuns({
        limit: 200,
        ...(contextMachineId && { machineId: contextMachineId }),
        ...(toIsoIfValid(runFilters.from) && { from: toIsoIfValid(runFilters.from) }),
        ...(toIsoIfValid(runFilters.to) && { to: toIsoIfValid(runFilters.to) }),
        ...(runFilters.status && { status: runFilters.status }),
      }),
    enabled: tab === 'planned' && plannedSubTab === 'runs',
  });

  const {
    data: historyDowntimes = [],
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: [
      'downtimes',
      'history',
      contextMachineId || 'all',
      historyFilters.from,
      historyFilters.to,
      historyFilters.category,
      historyFilters.reasonCode,
    ],
    queryFn: () =>
      fetchDowntimes({
        status: 'closed',
        limit: 200,
        ...(contextMachineId && { machineId: contextMachineId }),
        ...(toIsoIfValid(historyFilters.from) && { from: toIsoIfValid(historyFilters.from) }),
        ...(toIsoIfValid(historyFilters.to) && { to: toIsoIfValid(historyFilters.to) }),
        ...(historyFilters.category && { category: historyFilters.category }),
        ...(historyFilters.reasonCode && { reasonCode: historyFilters.reasonCode }),
      }),
    enabled: tab === 'history',
  });

  const updateDowntimeMutation = useMutation({
    mutationFn: ({ downtime, payload }) => updateDowntime(downtime.id, payload),
    onSuccess: () => {
      toast.success('Duruş güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['downtimes'] });
      setEditingDowntime(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Duruş güncellenemedi.');
    },
  });

  const splitDowntimeMutation = useMutation({
    mutationFn: ({ downtime, payload }) => splitDowntime(downtime.id, payload),
    onSuccess: () => {
      toast.success('Duruş split ile güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['downtimes'] });
      setEditingDowntime(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Split işlemi yapılamadı.');
    },
  });

  const manualUnplannedMutation = useMutation({
    mutationFn: startManualUnplannedDowntime,
    onSuccess: () => {
      toast.success('Plansız duruş başlatıldı.');
      queryClient.invalidateQueries({ queryKey: ['downtimes'] });
      setTab('open');
      setManualDialog(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Plansız duruş başlatılamadı.');
    },
  });

  const confirmDowntimeMutation = useMutation({
    mutationFn: (id) => confirmDowntime(id),
    onSuccess: () => {
      toast.success('Duruş onaylandı.');
      queryClient.invalidateQueries({ queryKey: ['downtimes'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Duruş onaylanamadı.');
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: createPlannedDowntimeRule,
    onSuccess: () => {
      toast.success('Planlı duruş oluşturuldu.');
      queryClient.invalidateQueries({ queryKey: ['plannedDowntimeRules'] });
      setPlannedDialog(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Planlı duruş oluşturulamadı.');
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePlannedDowntimeRule(id, payload),
    onSuccess: () => {
      toast.success('Plan güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['plannedDowntimeRules'] });
      setPlannedDialog(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Plan güncellenemedi.');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deletePlannedDowntimeRule,
    onSuccess: () => {
      toast.success('Plan silindi.');
      queryClient.invalidateQueries({ queryKey: ['plannedDowntimeRules'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Plan silinemedi.');
    },
  });

  const handleDowntimeSubmit = ({ downtime, payload }) => {
    const canPatch = isEditableWithinWindow(downtime, 5);
    if (canPatch) {
      updateDowntimeMutation.mutate({ downtime, payload });
      return;
    }

    if (downtime.endedAt) {
      toast.error('5 dk düzeltme penceresi doldu. Geçmiş kayıt değiştirilemez.');
      return;
    }

    {
      splitDowntimeMutation.mutate({ downtime, payload });
    }
  };

  const renderOpenTab = () => {
    if (openLoading || reasonsLoading) {
      return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
          <Typography variant="subtitle1">Açık Duruşlar</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setManualDialog({ initialMachineId: contextMachineId || '' })}
            disabled={manualUnplannedMutation.isLoading || machines.length === 0}
          >
            Plansız Duruş Başlat
          </Button>
        </Stack>

        {openDowntimes.length === 0 ? (
          <Typography color="text.secondary">Açık duruş bulunmuyor.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Makine</TableCell>
                  <TableCell>Başlangıç</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {openDowntimes.map((dt) => (
                  <TableRow key={dt.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{dt.machine?.name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dt.machine?.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(dt.startedAt)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={reasons.find((r) => r.code === dt.reasonCode)?.label || dt.reasonCode || '-'}
                        color={dt.reasonCategory === 'planned' ? 'info' : 'warning'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{dt.jobOrder?.orderNo || '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Sınıflandır">
                        <span>
                          <IconButton size="small" onClick={() => setEditingDowntime(dt)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Stack>
    );
  };

  const renderPlannedTab = () => {
    if (
      reasonsLoading ||
      (plannedSubTab === 'rules' && plannedLoading) ||
      (plannedSubTab === 'runs' && plannedRunsLoading)
    ) {
      return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }

    const renderRuleList = () => (
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Typography variant="subtitle1">Planlı Duruş Kuralları</Typography>
          <Stack direction="row" spacing={1}>
            {canManagePlans && (
              <>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setPlannedDialog({
                      mode: 'create',
                      initial: {
                        name: 'Öğle Arası',
                        type: 'recurring_daily',
                        reasonCode: 'planned_break',
                        recurrence: { startTime: '12:00', endTime: '13:00' },
                        priority: 10,
                        isActive: true,
                      },
                    })
                  }
                >
                  Öğle Arası Ekle
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setPlannedDialog({ mode: 'create', initial: null })}
                >
                  Yeni Plan
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {!canManagePlans && (
          <Typography color="text.secondary">
            Planlı duruş oluşturma ve silme için supervisor yetkisi gerekir. Kurallar read only gösterilir.
          </Typography>
        )}

        {plannedRules.length === 0 ? (
          <Typography color="text.secondary">Henüz planlı duruş kuralı yok.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ad</TableCell>
                  <TableCell>Tip</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Makineler</TableCell>
                  <TableCell>Aktif</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plannedRules.map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{rule.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Öncelik: {rule.priority ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {rule.type === 'recurring_daily'
                        ? `Günlük ${rule.recurrence?.startTime || '-'}–${rule.recurrence?.endTime || '-'}`
                        : `Tek Sefer ${formatDateTime(rule.startAt)}–${formatDateTime(rule.endAt)}`}
                    </TableCell>
                    <TableCell>
                      {plannedReasons.find((r) => r.code === rule.reasonCode)?.label || rule.reasonCode}
                    </TableCell>
                    <TableCell>{(rule.machineIds || []).length}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={rule.isActive ? 'Aktif' : 'Pasif'}
                        color={rule.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {canManagePlans ? (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Düzenle">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => setPlannedDialog({ mode: 'edit', initial: rule })}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => deleteRuleMutation.mutate(rule.id)}
                                disabled={deleteRuleMutation.isLoading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" align="right">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Stack>
    );

    const RUN_STATUS_LABEL = {
      scheduled: 'Scheduled',
      started: 'Started',
      ended: 'Ended',
      skipped_no_active_job: 'Skipped (No Job)',
      skipped_conflict: 'Skipped (Conflict)',
    };

    const getRunStatusChip = (run) => {
      const label = RUN_STATUS_LABEL[run.status] || run.status;
      if (run.status === 'started') return { label, color: 'warning' };
      if (run.status === 'scheduled') return { label, color: 'info' };
      if (run.status === 'ended' && run.debug?.reason === 'preempted') return { label: 'Ended (Preempted)', color: 'warning' };
      if (run.status === 'ended') return { label, color: 'success' };
      return { label, color: 'default' };
    };

    const renderRunHistory = () => (
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            type="datetime-local"
            label="Başlangıç"
            value={runFilters.from}
            onChange={(event) => setRunFilters((prev) => ({ ...prev, from: event.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            type="datetime-local"
            label="Bitiş"
            value={runFilters.to}
            onChange={(event) => setRunFilters((prev) => ({ ...prev, to: event.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={runFilters.status}
            onChange={(event) => setRunFilters((prev) => ({ ...prev, status: event.target.value }))}
            fullWidth
          >
            <MenuItem value="">Tümü</MenuItem>
            {Object.keys(RUN_STATUS_LABEL).map((key) => (
              <MenuItem key={key} value={key}>
                {RUN_STATUS_LABEL[key]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {plannedRuns.length === 0 ? (
          <Typography color="text.secondary">Planlı duruş run kaydı bulunmuyor.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Makine</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Zaman</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Job</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plannedRuns.map((run) => {
                  const statusChip = getRunStatusChip(run);
                  return (
                    <TableRow key={run.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{run.machineId?.name || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {run.machineId?.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{run.ruleId?.name || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plannedReasons.find((r) => r.code === run.ruleId?.reasonCode)?.label ||
                            run.ruleId?.reasonCode ||
                            '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(run.scheduledStartAt)} – {formatDateTime(run.scheduledEndAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={statusChip.label} color={statusChip.color} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{run.jobOrderId?.orderNo || '-'}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Stack>
    );

    return (
      <Stack spacing={2}>
        <Tabs value={plannedSubTab} onChange={(_e, value) => setPlannedSubTab(value)}>
          <Tab label="Kurallar" value="rules" />
          <Tab label="Run Geçmişi" value="runs" />
        </Tabs>

        {plannedSubTab === 'rules' && renderRuleList()}
        {plannedSubTab === 'runs' && renderRunHistory()}
      </Stack>
    );
  };

  const renderHistoryTab = () => {
    if (historyLoading || reasonsLoading) {
      return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            type="datetime-local"
            label="Başlangıç"
            value={historyFilters.from}
            onChange={(event) => setHistoryFilters((prev) => ({ ...prev, from: event.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            type="datetime-local"
            label="Bitiş"
            value={historyFilters.to}
            onChange={(event) => setHistoryFilters((prev) => ({ ...prev, to: event.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            select
            label="Kategori"
            value={historyFilters.category}
            onChange={(event) => setHistoryFilters((prev) => ({ ...prev, category: event.target.value }))}
            fullWidth
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="planned">Planlı</MenuItem>
            <MenuItem value="unplanned">Plansız</MenuItem>
          </TextField>
          <TextField
            select
            label="Reason"
            value={historyFilters.reasonCode}
            onChange={(event) => setHistoryFilters((prev) => ({ ...prev, reasonCode: event.target.value }))}
            fullWidth
          >
            <MenuItem value="">Tümü</MenuItem>
            {(historyFilters.category
              ? reasons.filter((r) => r.category === historyFilters.category)
              : reasons
            ).map((reason) => (
              <MenuItem key={reason.code} value={reason.code}>
                {reason.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {historyDowntimes.length === 0 ? (
          <Typography color="text.secondary">Geçmiş duruş kaydı bulunmuyor.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Makine</TableCell>
                  <TableCell>Başlangıç</TableCell>
                  <TableCell>Bitiş</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyDowntimes.map((dt) => (
                  <TableRow key={dt.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{dt.machine?.name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dt.machine?.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(dt.startedAt)}</TableCell>
                    <TableCell>{formatDateTime(dt.endedAt)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          size="small"
                          label={reasons.find((r) => r.code === dt.reasonCode)?.label || dt.reasonCode || '-'}
                          color={dt.reasonCategory === 'planned' ? 'info' : 'warning'}
                          variant="outlined"
                        />
                        {dt.metadata?.confirmationRequired && !dt.metadata?.confirmedAt && (
                          <Chip size="small" label="Onay Bekliyor" color="error" variant="outlined" />
                        )}
                        {dt.metadata?.confirmedAt && (
                          <Chip size="small" label="Onaylandı" color="success" variant="outlined" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{dt.jobOrder?.orderNo || '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {isEditableWithinWindow(dt, 5) && (
                          <Tooltip title="Düzelt (5 dk)">
                            <span>
                              <IconButton size="small" onClick={() => setEditingDowntime(dt)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {dt.metadata?.confirmationRequired && !dt.metadata?.confirmedAt && (
                          <Tooltip title="Onayla">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => confirmDowntimeMutation.mutate(dt.id)}
                                disabled={confirmDowntimeMutation.isLoading}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {!isEditableWithinWindow(dt, 5) &&
                          !(dt.metadata?.confirmationRequired && !dt.metadata?.confirmedAt) && (
                            <Typography variant="body2" color="text.secondary" align="right">
                              -
                            </Typography>
                          )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Stack>
    );
  };

  const manualDialogOpen = Boolean(manualDialog);
  const manualInitialMachineId = manualDialog?.initialMachineId || '';

  const plannedDialogOpen = Boolean(plannedDialog);
  const plannedInitial = plannedDialog?.initial;
  const isEditingRule = plannedDialog?.mode === 'edit';

  const selectedMachineId = contextMachineId || '';
  const selectedMachineLabel = selectedMachineId
    ? machines.find((m) => m.id === selectedMachineId)?.name || selectedMachineId
    : '';

  const handleMachineChange = (nextMachineId) => {
    const next = new URLSearchParams(searchParams);
    if (nextMachineId) {
      next.set('machineId', nextMachineId);
    } else {
      next.delete('machineId');
    }
    next.delete('jobOrderId');
    setSearchParams(next, { replace: true });
  };

  const refreshCurrent = () => {
    if (tab === 'open') {
      refetchOpen();
      return;
    }
    if (tab === 'history') {
      refetchHistory();
      return;
    }
    if (tab === 'planned') {
      if (plannedSubTab === 'runs') {
        refetchRuns();
      } else {
        refetchRules();
      }
    }
  };

  const refreshDisabled =
    (tab === 'open' && openLoading) ||
    (tab === 'history' && historyLoading) ||
    (tab === 'planned' && plannedSubTab === 'rules' && plannedLoading) ||
    (tab === 'planned' && plannedSubTab === 'runs' && plannedRunsLoading);

  return (
    <>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" mb={2} spacing={2}>
            <Stack spacing={1}>
              <Typography variant="h6">Duruşlar</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="Makine"
                  value={selectedMachineId}
                  onChange={(event) => handleMachineChange(event.target.value)}
                  sx={{ minWidth: 240 }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {machines.map((machine) => (
                    <MenuItem key={machine.id} value={machine.id}>
                      {machine.name} ({machine.code})
                    </MenuItem>
                  ))}
                </TextField>
                {selectedMachineId && (
                  <Chip
                    size="small"
                    color="default"
                    variant="outlined"
                    label={`Filtre: ${selectedMachineLabel}`}
                    onDelete={() => handleMachineChange('')}
                  />
                )}
              </Stack>
            </Stack>

            <Button startIcon={<RefreshIcon />} onClick={refreshCurrent} disabled={refreshDisabled}>
              Yenile
            </Button>
          </Stack>

          <Tabs value={tab} onChange={(_e, value) => setTab(value)} sx={{ mb: 3 }}>
            <Tab label="Açık Duruşlar" value="open" />
            <Tab label="Planlı Duruşlar" value="planned" />
            <Tab label="Geçmiş" value="history" />
          </Tabs>

          {tab === 'open' && renderOpenTab()}
          {tab === 'planned' && renderPlannedTab()}
          {tab === 'history' && renderHistoryTab()}
        </CardContent>
      </Card>

      <DowntimeEditDialog
        open={Boolean(editingDowntime)}
        downtime={editingDowntime}
        reasons={reasons}
        onClose={() => setEditingDowntime(null)}
        onSubmit={handleDowntimeSubmit}
        isSubmitting={updateDowntimeMutation.isLoading || splitDowntimeMutation.isLoading}
      />

      <ManualUnplannedDowntimeDialog
        open={manualDialogOpen}
        machines={machines}
        unplannedReasons={unplannedReasons}
        initialMachineId={manualInitialMachineId}
        onClose={() => setManualDialog(null)}
        onSubmit={(payload) => manualUnplannedMutation.mutate(payload)}
        isSubmitting={manualUnplannedMutation.isLoading}
      />

      <PlannedDowntimeRuleDialog
        open={plannedDialogOpen}
        machines={machines}
        plannedReasons={plannedReasons}
        initialData={plannedInitial}
        onClose={() => setPlannedDialog(null)}
        onSubmit={(payload) => {
          if (isEditingRule && plannedInitial) {
            updateRuleMutation.mutate({ id: plannedInitial.id, payload });
          } else {
            createRuleMutation.mutate(payload);
          }
        }}
        isSubmitting={createRuleMutation.isLoading || updateRuleMutation.isLoading}
      />
    </>
  );
};

export default DowntimesPage;
