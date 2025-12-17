import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import usePermissions from '@/hooks/use-permissions.js';
import { PERMISSIONS } from '@/constants/permissions.js';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import {
  createPlannedDowntimeRule,
  deletePlannedDowntimeRule,
  fetchDowntimes,
  fetchPlannedDowntimeRules,
  fetchReasonCatalog,
  splitDowntime,
  updateDowntime,
  updatePlannedDowntimeRule,
} from '@/features/downtime/services/downtime-api.js';
import DowntimeEditDialog from '@/features/downtime/components/downtime-edit-dialog.jsx';
import PlannedDowntimeRuleDialog from '@/features/downtime/components/planned-downtime-rule-dialog.jsx';

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: tr });
  } catch {
    return value;
  }
};

const DowntimesPage = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManagePlans = hasPermission(PERMISSIONS.PRODUCTION_MANAGE);
  const [searchParams, setSearchParams] = useSearchParams();
  const contextMachineId = searchParams.get('machineId') || undefined;

  const [tab, setTab] = useState('open');
  const [editingDowntime, setEditingDowntime] = useState(null);
  const [plannedDialog, setPlannedDialog] = useState(null);

  const { data: reasons = [], isLoading: reasonsLoading } = useQuery({
    queryKey: ['reasonCatalog'],
    queryFn: fetchReasonCatalog,
  });

  const plannedReasons = useMemo(() => reasons.filter((r) => r.category === 'planned'), [reasons]);

  const { data: machines = [] } = useQuery({
    queryKey: ['machines'],
    queryFn: fetchMachines,
    enabled: canManagePlans,
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
    queryKey: ['plannedDowntimeRules'],
    queryFn: fetchPlannedDowntimeRules,
    enabled: tab === 'planned',
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
    const base = downtime.endedAt ? new Date(downtime.endedAt) : new Date(downtime.startedAt);
    const deadline = new Date(base.getTime() + 5 * 60 * 1000);
    if (new Date() <= deadline) {
      updateDowntimeMutation.mutate({ downtime, payload });
    } else {
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

    if (openDowntimes.length === 0) {
      return <Typography color="text.secondary">Açık duruş bulunmuyor.</Typography>;
    }

    return (
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
                <TableCell>{formatDate(dt.startedAt)}</TableCell>
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
    );
  };

  const renderPlannedTab = () => {
    if (plannedLoading || reasonsLoading) {
      return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Typography variant="subtitle1">Planlı Duruş Kuralları</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshIcon />} onClick={() => refetchRules()} disabled={plannedLoading}>
              Yenile
            </Button>
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
            Planlı duruş oluşturma ve silme için supervisor yetkisi gerekir. Bu tab read only gösterilir.
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
                        : `Tek Sefer ${formatDate(rule.startAt)}–${formatDate(rule.endAt)}`}
                    </TableCell>
                    <TableCell>
                      {plannedReasons.find((r) => r.code === rule.reasonCode)?.label || rule.reasonCode}
                    </TableCell>
                    <TableCell>{(rule.machineIds || []).length}</TableCell>
                    <TableCell>
                      <Chip size="small" label={rule.isActive ? 'Aktif' : 'Pasif'} color={rule.isActive ? 'success' : 'default'} variant="outlined" />
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
  };

  const plannedDialogOpen = Boolean(plannedDialog);
  const plannedInitial = plannedDialog?.initial;
  const isEditingRule = plannedDialog?.mode === 'edit';

  return (
    <>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" mb={2} spacing={2}>
            <Typography variant="h6">Duruşlar</Typography>
            {tab === 'open' && (
              <Stack direction="row" spacing={1} alignItems="center">
                {contextMachineId && (
                  <Chip
                    size="small"
                    color="default"
                    variant="outlined"
                    label="Makine filtresi aktif"
                    onDelete={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('machineId');
                      next.delete('jobOrderId');
                      setSearchParams(next, { replace: true });
                    }}
                  />
                )}
                <Button startIcon={<RefreshIcon />} onClick={() => refetchOpen()} disabled={openLoading}>
                  Yenile
                </Button>
              </Stack>
            )}
          </Stack>

          <Tabs value={tab} onChange={(_e, value) => setTab(value)} sx={{ mb: 3 }}>
            <Tab label="Açık Duruşlar" value="open" />
            <Tab label="Planlı Duruşlar" value="planned" />
          </Tabs>

          {tab === 'open' && renderOpenTab()}
          {tab === 'planned' && renderPlannedTab()}
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
