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
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  fetchMachines,
  createMachine,
  updateMachine,
  deleteMachine,
} from '@/features/machines/services/machines-api.js';
import MachineFormDialog from '@/features/machines/components/machine-form-dialog.jsx';
import MachineEventDialog from '@/features/machines/components/machine-event-dialog.jsx';
import usePermissions from '@/hooks/use-permissions.js';
import { PERMISSIONS } from '@/constants/permissions.js';

const STATUS_LABELS = {
  running: { label: 'Çalışıyor', color: 'success' },
  idle: { label: 'Boşta', color: 'default' },
  downtime: { label: 'Duruş', color: 'error' },
  maintenance: { label: 'Bakım', color: 'warning' },
  unknown: { label: 'Bilinmiyor', color: 'default' },
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: tr });
  } catch (_err) {
    return value;
  }
};

const MachineTable = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission(PERMISSIONS.MACHINES_WRITE);

  const [formOpen, setFormOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: machines = [], isLoading, refetch } = useQuery({
    queryKey: ['machines'],
    queryFn: fetchMachines,
  });

  const createMutation = useMutation({
    mutationFn: createMachine,
    onSuccess: () => {
      toast.success('Makine oluşturuldu.');
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Makine oluşturulamadı.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateMachine(id, payload),
    onSuccess: () => {
      toast.success('Makine güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Makine güncellenemedi.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMachine(id),
    onSuccess: () => {
      toast.success('Makine silindi.');
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      setConfirmDelete(false);
      setSelectedMachine(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Makine silinemedi.');
    },
  });

  const handleOpenForm = (machine = null) => {
    setSelectedMachine(machine);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (!createMutation.isLoading && !updateMutation.isLoading) {
      setFormOpen(false);
      setSelectedMachine(null);
    }
  };

  const handleSubmitForm = (payload) => {
    if (selectedMachine) {
      updateMutation.mutate({ id: selectedMachine.id || selectedMachine._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggleActive = (machine) => {
    updateMutation.mutate({
      id: machine.id || machine._id,
      payload: { isActive: !machine.isActive },
    });
  };

  const handleOpenEvents = (machine) => {
    setSelectedMachine(machine);
    setEventDialogOpen(true);
  };

  const handleCloseEvents = () => {
    setEventDialogOpen(false);
    setSelectedMachine(null);
  };

  const rows = useMemo(() => machines, [machines]);

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          mb={3}
        >
          <Typography variant="h6">Makineler</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshIcon />} onClick={() => refetch()} disabled={isLoading}>
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              disabled={!canWrite}
            >
              Yeni Makine
            </Button>
          </Stack>
        </Stack>

        {isLoading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Kod</TableCell>
                  <TableCell>Ad</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Son Değişiklik</TableCell>
                  <TableCell>Etiketler</TableCell>
                  <TableCell>Aktif</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((machine) => {
                  const status = STATUS_LABELS[machine.status] || STATUS_LABELS.unknown;
                  return (
                    <TableRow key={machine.id || machine._id} hover>
                      <TableCell>{machine.code}</TableCell>
                      <TableCell>{machine.name}</TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} size="small" />
                      </TableCell>
                      <TableCell>{formatDate(machine.lastEventAt)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(machine.tags || []).length === 0
                            ? '-'
                            : machine.tags.map((tag) => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" />
                              ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={machine.isActive}
                          onChange={() => handleToggleActive(machine)}
                          disabled={!canWrite}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Durum Kayıtları">
                            <span>
                              <IconButton onClick={() => handleOpenEvents(machine)}>
                                <EventNoteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <span>
                              <IconButton onClick={() => handleOpenForm(machine)} disabled={!canWrite}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <span>
                              <IconButton
                                onClick={() => {
                                  setSelectedMachine(machine);
                                  setConfirmDelete(true);
                                }}
                                disabled={!canWrite}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
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

      <MachineFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={selectedMachine}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
      />

      <MachineEventDialog open={eventDialogOpen} onClose={handleCloseEvents} machine={selectedMachine} />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Makineyi Sil</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            {selectedMachine
              ? `${selectedMachine.name} (${selectedMachine.code}) makinesini silmek üzeresiniz.`
              : 'Bu makineyi silmek üzeresiniz.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={deleteMutation.isLoading}>
            Vazgeç
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteMutation.mutate(selectedMachine.id || selectedMachine._id)}
            disabled={deleteMutation.isLoading}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default MachineTable;
