import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { createMachineEvent, fetchMachineEvents } from '@/features/machines/services/machines-api.js';
import { PERMISSIONS } from '@/constants/permissions.js';
import usePermissions from '@/hooks/use-permissions.js';

const STATUS_OPTIONS = [
  { label: 'Çalışıyor', value: 'running' },
  { label: 'Boşta', value: 'idle' },
  { label: 'Duruş', value: 'downtime' },
  { label: 'Bakım', value: 'maintenance' },
];

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: tr });
  } catch (_err) {
    return value;
  }
};

const MachineEventDialog = ({ open, onClose, machine }) => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission(PERMISSIONS.MACHINES_WRITE);
  const [formValues, setFormValues] = useState({
    state: 'running',
    reasonCode: '',
    description: '',
    startedAt: '',
  });

  const machineId = machine?.id || machine?._id;

  const { data: events = [], isFetching } = useQuery({
    queryKey: ['machines', machineId, 'events'],
    queryFn: () => fetchMachineEvents({ machineId }),
    enabled: open && Boolean(machineId),
  });

  const createEventMutation = useMutation({
    mutationFn: (payload) => createMachineEvent({ machineId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machines', machineId, 'events'] });
      setFormValues((prev) => ({ ...prev, reasonCode: '', description: '', startedAt: '' }));
    },
  });

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      state: formValues.state,
      reasonCode: formValues.reasonCode || undefined,
      description: formValues.description || undefined,
      startedAt: formValues.startedAt || undefined,
      source: 'operator',
    };
    createEventMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{machine?.name} - Durum Kayıtları</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {canWrite && (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="Durum"
                    value={formValues.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    fullWidth
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Başlangıç (ISO format)"
                    value={formValues.startedAt}
                    onChange={(e) => handleChange('startedAt', e.target.value)}
                    helperText="Boş bırakırsanız şimdi olarak kaydedilir."
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Neden Kodu"
                  value={formValues.reasonCode}
                  onChange={(e) => handleChange('reasonCode', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Açıklama"
                  value={formValues.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createEventMutation.isLoading}
                >
                  Durum Kaydı Ekle
                </Button>
              </Stack>
            </Box>
          )}

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="subtitle1">Son Kayıtlar</Typography>
            {isFetching ? (
              <Typography color="text.secondary">Yükleniyor...</Typography>
            ) : events.length === 0 ? (
              <Typography color="text.secondary">Henüz kayıt yok.</Typography>
            ) : (
              events.map((eventItem) => (
                <Box
                  key={eventItem.id || eventItem._id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    p: 1.5,
                  }}
                >
                  <Typography fontWeight={600}>
                    {eventItem.state} {eventItem.reasonCode ? `• ${eventItem.reasonCode}` : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Başlangıç: {formatDate(eventItem.startedAt)}{' '}
                    {eventItem.endedAt ? `• Bitiş: ${formatDate(eventItem.endedAt)}` : ''}
                  </Typography>
                  {eventItem.description && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {eventItem.description}
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

MachineEventDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  machine: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
};

MachineEventDialog.defaultProps = {
  machine: null,
};

export default MachineEventDialog;
