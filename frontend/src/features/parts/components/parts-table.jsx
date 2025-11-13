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
import RefreshIcon from '@mui/icons-material/Refresh';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { fetchParts, createPart, updatePart, deletePart } from '@/features/parts/services/parts-api.js';
import { fetchMachines } from '@/features/machines/services/machines-api.js';
import PartFormDialog from '@/features/parts/components/part-form-dialog.jsx';
import usePermissions from '@/hooks/use-permissions.js';
import { PERMISSIONS } from '@/constants/permissions.js';
import { PART_CATEGORY_MAP } from '@/features/parts/constants/part-categories.js';

const formatMachineNames = (ids = [], map) => {
  if (!ids?.length) return '-';
  const names = ids
    .map((id) => {
      const key = id?.toString?.() || id;
      return map.get(key)?.name || key;
    })
    .filter(Boolean);
  return names.length ? (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {names.map((name) => (
        <Chip key={name} label={name} size="small" />
      ))}
    </Stack>
  ) : (
    '-'
  );
};

const formatTags = (tags = []) => {
  if (!tags.length) return '-';
  return (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" variant="outlined" />
      ))}
    </Stack>
  );
};

const formatSettings = (settings = {}, categoryId) => {
  const category = PART_CATEGORY_MAP.get(categoryId);
  const fields = category?.machineSettings || [];
  const entries = fields
    .map((field) => ({ ...field, value: settings?.[field.key] }))
    .filter((field) => field.value !== undefined && field.value !== null && field.value !== '');

  if (!entries.length) return '-';
  return (
    <Stack spacing={0.5}>
      {entries.map((field) => (
        <Typography variant="caption" key={field.key}>
          {`${field.label}: ${field.value}`}
        </Typography>
      ))}
    </Stack>
  );
};

const getCategoryLabel = (categoryId) => PART_CATEGORY_MAP.get(categoryId)?.label || categoryId || '-';

const PartsTable = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.PARTS_MANAGE);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: parts = [], isLoading, refetch } = useQuery({
    queryKey: ['parts'],
    queryFn: fetchParts,
  });

  const { data: machines = [] } = useQuery({
    queryKey: ['machines'],
    queryFn: fetchMachines,
  });

  const machineMap = useMemo(() => {
    const map = new Map();
    machines.forEach((machine) => {
      const key = machine.id || machine._id;
      if (key) map.set(key.toString(), { id: key.toString(), name: machine.name });
    });
    return map;
  }, [machines]);

  const createMutation = useMutation({
    mutationFn: createPart,
    onSuccess: () => {
      toast.success('Parça eklendi.');
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Parça eklenemedi.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePart(id, payload),
    onSuccess: () => {
      toast.success('Parça güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Parça güncellenemedi.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePart(id),
    onSuccess: () => {
      toast.success('Parça silindi.');
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setConfirmDelete(false);
      setSelectedPart(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Parça silinemedi.');
    },
  });

  const handleOpenForm = (part = null) => {
    setSelectedPart(part);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (!createMutation.isLoading && !updateMutation.isLoading) {
      setFormOpen(false);
      setSelectedPart(null);
    }
  };

  const handleSubmitForm = (payload) => {
    if (selectedPart) {
      updateMutation.mutate({ id: selectedPart.id || selectedPart._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (part) => {
    setSelectedPart(part);
    setConfirmDelete(true);
  };

  const rows = useMemo(() => parts, [parts]);

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          mb={3}
        >
          <Typography variant="h6">Parçalar</Typography>
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
              Yeni Parça
            </Button>
          </Stack>
        </Stack>

        {isLoading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Typography align="center" color="text.secondary">
            Henüz parça kaydı bulunmuyor.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Kod</TableCell>
                  <TableCell>Ad</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Birim</TableCell>
                  <TableCell>İdeal Süre (sn)</TableCell>
                  <TableCell>Etiketler</TableCell>
                  <TableCell>Uyumlu Makineler</TableCell>
                  <TableCell>Varsayılan Ayarlar</TableCell>
                  <TableCell>Açıklama</TableCell>
                  {canManage && <TableCell align="right">İşlemler</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((part) => (
                  <TableRow key={part.id || part._id} hover>
                    <TableCell>{part.code}</TableCell>
                    <TableCell>{part.name}</TableCell>
                    <TableCell>{getCategoryLabel(part.category)}</TableCell>
                    <TableCell>{part.unit || '-'}</TableCell>
                    <TableCell>{part.idealCycleTime ?? '-'}</TableCell>
                    <TableCell>{formatTags(part.tags)}</TableCell>
                    <TableCell>
                      {formatMachineNames(part.compatibleMachines, machineMap)}
                    </TableCell>
                    <TableCell>{formatSettings(part.defaultMachineSettings, part.category)}</TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>{part.description || '-'}</TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <Tooltip title="Düzenle">
                          <span>
                            <IconButton size="small" onClick={() => handleOpenForm(part)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <span>
                            <IconButton size="small" color="error" onClick={() => handleDelete(part)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>

      <PartFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={selectedPart}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        machines={machines.map((machine) => ({
          id: (machine.id || machine._id)?.toString(),
          name: machine.name,
        }))}
      />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Parçayı sil</DialogTitle>
        <DialogContent dividers>
          {selectedPart ? (
            <Typography>
              <strong>{selectedPart.name}</strong> kodu {selectedPart.code} olan parçayı silmek istediğine emin misin?
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Vazgeç</Button>
          <Button
            color="error"
            onClick={() => deleteMutation.mutate(selectedPart.id || selectedPart._id)}
            disabled={deleteMutation.isLoading}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PartsTable;
