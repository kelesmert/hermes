import { useMemo, useState } from 'react';
import {
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
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  fetchJobOrders,
  createJobOrder,
  updateJobOrder,
  deleteJobOrder,
  startJobOrder,
  pauseJobOrder,
  resumeJobOrder,
  completeJobOrder,
  cancelJobOrder,
  recordProduction,
} from '@/features/production/services/job-orders-api.js';
import { fetchParts } from '@/features/parts/services/parts-api.js';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import JobOrderFormDialog from '@/features/production/components/job-order-form-dialog.jsx';
import JobOrderEventsDialog from '@/features/production/components/job-order-events-dialog.jsx';
import { DEFECT_OPTIONS, JOB_ORDER_STATUS_CONFIG, QUALITY_OPTIONS } from '@/features/production/constants/job-order.js';
import usePermissions from '@/hooks/use-permissions.js';
import { PERMISSIONS } from '@/constants/permissions.js';

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: tr });
  } catch {
    return value;
  }
};

const getId = (entity) => entity?.id || entity?._id || entity;

const ACTION_TITLES = {
  start: 'İş Emrini Başlat',
  pause: 'İş Emrini Duraklat',
  resume: 'İş Emrini Devam Ettir',
  complete: 'İş Emrini Tamamla',
  cancel: 'İş Emrini İptal Et',
  produce: 'Üretim Kaydı',
  delete: 'İş Emrini Sil',
};

const ACTION_MESSAGES = {
  start: 'İş emri başlatıldı.',
  pause: 'İş emri duraklatıldı.',
  resume: 'İş emri devam ettirildi.',
  complete: 'İş emri tamamlandı.',
  cancel: 'İş emri iptal edildi.',
  produce: 'Üretim kaydedildi.',
  delete: 'İş emri silindi.',
};

const JobOrdersTable = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.PRODUCTION_MANAGE);
  const canExecute = hasPermission(PERMISSIONS.WORK_ORDERS_EXECUTE) || canManage;

  const [formOpen, setFormOpen] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState(null);
  const [actionDialog, setActionDialog] = useState(null);
  const [actionForm, setActionForm] = useState({ quantity: '', qualityStatus: 'good', defectType: DEFECT_OPTIONS[0].value, reason: '' });
  const [eventsDialogJob, setEventsDialogJob] = useState(null);

  const { data: jobOrders = [], isLoading, refetch } = useQuery({
    queryKey: ['jobOrders'],
    queryFn: fetchJobOrders,
  });

  const { data: parts = [] } = useQuery({ queryKey: ['parts'], queryFn: fetchParts });
  const { data: machines = [] } = useQuery({ queryKey: ['machines'], queryFn: fetchMachines });

  const createMutation = useMutation({
    mutationFn: createJobOrder,
    onSuccess: () => {
      toast.success('İş emri oluşturuldu.');
      queryClient.invalidateQueries({ queryKey: ['jobOrders'] });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İş emri oluşturulamadı.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateJobOrder(id, payload),
    onSuccess: () => {
      toast.success('İş emri güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['jobOrders'] });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İş emri güncellenemedi.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteJobOrder(id),
    onSuccess: () => {
      toast.success('İş emri silindi.');
      queryClient.invalidateQueries({ queryKey: ['jobOrders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'İş emri silinemedi.');
    },
  });

  const actionMutation = useMutation({
    mutationFn: ({ type, jobOrder, payload }) => {
      const id = getId(jobOrder);
      switch (type) {
        case 'start':
          return startJobOrder(id);
        case 'pause':
          return pauseJobOrder(id, { reason: payload?.reason });
        case 'resume':
          return resumeJobOrder(id);
        case 'complete':
          return completeJobOrder(id);
        case 'cancel':
          return cancelJobOrder(id, { reason: payload?.reason });
        case 'produce':
          return recordProduction(id, payload);
        case 'delete':
          return deleteMutation.mutateAsync(id);
        default:
          return Promise.resolve();
      }
    },
    onSuccess: (_data, variables) => {
      if (variables.type !== 'delete') {
        toast.success(ACTION_MESSAGES[variables.type] || 'İşlem başarıyla tamamlandı.');
        queryClient.invalidateQueries({ queryKey: ['jobOrders'] });
      }
      closeActionDialog();
    },
    onError: (error, variables) => {
      if (variables.type !== 'delete') {
        toast.error(error.response?.data?.message || 'İşlem gerçekleştirilemedi.');
      }
    },
  });

  const handleOpenForm = (jobOrder = null) => {
    setEditingJobOrder(jobOrder);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (!createMutation.isLoading && !updateMutation.isLoading) {
      setFormOpen(false);
      setEditingJobOrder(null);
    }
  };

  const handleSubmitForm = (payload) => {
    if (editingJobOrder) {
      updateMutation.mutate({ id: getId(editingJobOrder), payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleActionClick = (type, jobOrder) => {
    if (type === 'pause') {
      const machineId = getId(jobOrder.machine);
      const jobOrderId = getId(jobOrder);
      const params = new URLSearchParams();
      if (machineId) params.set('machineId', machineId);
      if (jobOrderId) params.set('jobOrderId', jobOrderId);
      navigate(`/downtimes${params.toString() ? `?${params.toString()}` : ''}`);
      return;
    }
    setActionDialog({ type, jobOrder });
    const remaining = Math.max(jobOrder.targetQuantity - jobOrder.producedQuantity, 1);
    setActionForm({
      quantity: remaining,
      qualityStatus: 'good',
      defectType: DEFECT_OPTIONS[0].value,
      reason: '',
    });
  };

  const closeActionDialog = () => {
    if (!actionMutation.isLoading && !deleteMutation.isLoading) {
      setActionDialog(null);
    }
  };

  const handleConfirmAction = () => {
    if (!actionDialog) return;
    const { type, jobOrder } = actionDialog;

    if (type === 'produce') {
      const quantityValue = Number(actionForm.quantity);
      if (Number.isNaN(quantityValue) || quantityValue <= 0) {
        toast.error('Geçerli bir miktar girin.');
        return;
      }
      const payload = {
        quantity: quantityValue,
        qualityStatus: actionForm.qualityStatus,
      };
      if (actionForm.qualityStatus === 'defective') {
        payload.defectType = actionForm.defectType;
      }
      actionMutation.mutate({ type, jobOrder, payload });
      return;
    }

    if (type === 'pause' || type === 'cancel') {
      actionMutation.mutate({ type, jobOrder, payload: { reason: actionForm.reason } });
      return;
    }

    actionMutation.mutate({ type, jobOrder });
  };

  const rows = useMemo(() => jobOrders, [jobOrders]);

  const actionDialogOpen = Boolean(actionDialog);
  const actionType = actionDialog?.type;
  const currentJob = actionDialog?.jobOrder;

  const isProduce = actionType === 'produce';
  const isPause = actionType === 'pause';
  const isCancel = actionType === 'cancel';
  const isDelete = actionType === 'delete';

  const disableConfirm =
    actionMutation.isLoading || deleteMutation.isLoading || (isProduce && !actionForm.quantity);

  const renderStatusChip = (status) => {
    const config = JOB_ORDER_STATUS_CONFIG[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" mb={3} spacing={2}>
          <Typography variant="h6">İş Emirleri</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshIcon />} onClick={() => refetch()} disabled={isLoading}>
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              disabled={!canManage}
            >
              Yeni İş Emri
            </Button>
          </Stack>
        </Stack>

        {isLoading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">Henüz iş emri bulunmuyor.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Parça</TableCell>
                  <TableCell>Makine</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Üretim</TableCell>
                  <TableCell>Başlangıç</TableCell>
                  <TableCell>Bitiş</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((job) => {
                  const status = job.status;
                  const canEdit =
                    canManage && (status === 'pending' || status === 'paused');
                  const canDeleteJob =
                    canManage && (status === 'pending' || status === 'cancelled');
                  const canStart = canExecute && status === 'pending';
                  const canPauseAction = canExecute && status === 'in_progress';
                  const canResumeAction = canExecute && status === 'paused';
                  const canCompleteAction = canExecute && (status === 'in_progress' || status === 'paused');
                  const canCancelAction = canManage && (status === 'pending' || status === 'paused');
                  const canProduceAction = canExecute && status === 'in_progress';

                  return (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={600}>{job.orderNo}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Hedef: {job.targetQuantity}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography>{job.part?.name || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {job.part?.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>{job.machine?.name || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {job.machine?.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{renderStatusChip(status)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {job.producedQuantity} / {job.targetQuantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sağlam: {job.goodQuantity} · Hatalı: {job.defectiveQuantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(job.startTime)}</TableCell>
                      <TableCell>{formatDate(job.endTime)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Olaylar">
                            <span>
                              <IconButton size="small" onClick={() => setEventsDialogJob(job)}>
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          {canEdit && (
                            <Tooltip title="Düzenle">
                              <span>
                                <IconButton size="small" onClick={() => handleOpenForm(job)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canStart && (
                            <Tooltip title="Başlat">
                              <span>
                                <IconButton size="small" onClick={() => handleActionClick('start', job)}>
                                  <PlayArrowIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canPauseAction && (
                            <Tooltip title="Duruşlar">
                              <span>
                                <IconButton size="small" onClick={() => handleActionClick('pause', job)}>
                                  <PauseIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canResumeAction && (
                            <Tooltip title="Devam Ettir">
                              <span>
                                <IconButton size="small" onClick={() => handleActionClick('resume', job)}>
                                  <PlayCircleOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canProduceAction && (
                            <Tooltip title="Üretim Kaydı">
                              <span>
                                <IconButton size="small" onClick={() => handleActionClick('produce', job)}>
                                  <ProductionQuantityLimitsIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canCompleteAction && (
                            <Tooltip title="Tamamla">
                              <span>
                                <IconButton size="small" onClick={() => handleActionClick('complete', job)}>
                                  <DoneAllIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canCancelAction && (
                            <Tooltip title="İptal Et">
                              <span>
                                <IconButton size="small" onClick={() => handleActionClick('cancel', job)}>
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {canDeleteJob && (
                            <Tooltip title="Sil">
                              <span>
                                <IconButton size="small" onClick={() => handleActionClick('delete', job)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>

      <JobOrderFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingJobOrder}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        parts={parts}
        machines={machines}
      />

      <Dialog open={actionDialogOpen} onClose={closeActionDialog} fullWidth maxWidth="xs">
        <DialogTitle>{ACTION_TITLES[actionType] || 'İşlem'}</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            {currentJob ? `${currentJob.orderNo || currentJob.id} için işlem uygulanacak.` : ''}
          </Typography>
          {isProduce && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Miktar"
                type="number"
                value={actionForm.quantity}
                onChange={(event) => setActionForm((prev) => ({ ...prev, quantity: event.target.value }))}
                inputProps={{ min: 1, step: 1 }}
                fullWidth
              />
              <TextField
                select
                label="Ürün Durumu"
                value={actionForm.qualityStatus}
                onChange={(event) =>
                  setActionForm((prev) => ({ ...prev, qualityStatus: event.target.value }))
                }
                fullWidth
              >
                {QUALITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              {actionForm.qualityStatus === 'defective' && (
                <TextField
                  select
                  label="Hata Tipi"
                  value={actionForm.defectType}
                  onChange={(event) =>
                    setActionForm((prev) => ({ ...prev, defectType: event.target.value }))
                  }
                  fullWidth
                >
                  {DEFECT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          )}

          {(isPause || isCancel) && (
            <TextField
              sx={{ mt: 2 }}
              label="Not / Sebep"
              value={actionForm.reason}
              onChange={(event) => setActionForm((prev) => ({ ...prev, reason: event.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
          )}

          {isDelete && (
            <Typography color="error" sx={{ mt: 1 }}>
              Bu iş emrini silmek istediğinizden emin misiniz?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog} disabled={disableConfirm}>
            Vazgeç
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAction}
            disabled={disableConfirm}
            color={isCancel || isDelete ? 'error' : 'primary'}
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      <JobOrderEventsDialog
        open={Boolean(eventsDialogJob)}
        jobOrder={eventsDialogJob}
        onClose={() => setEventsDialogJob(null)}
      />
    </Card>
  );
};

export default JobOrdersTable;
