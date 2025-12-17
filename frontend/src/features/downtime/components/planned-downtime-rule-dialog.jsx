import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useMemo, useState } from 'react';

const toIso = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
};

const toDatetimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const PlannedDowntimeRuleDialog = ({
  open,
  machines,
  plannedReasons,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [form, setForm] = useState({
    name: '',
    type: 'recurring_daily',
    startTime: '12:00',
    endTime: '13:00',
    startAt: '',
    endAt: '',
    reasonCode: 'planned_break',
    machineIds: [],
    priority: 10,
    isActive: true,
  });

  const machineOptions = useMemo(() => machines || [], [machines]);

  const handleEnter = () => {
    if (!initialData) {
      setForm((prev) => ({ ...prev, machineIds: [] }));
      return;
    }
    setForm({
      name: initialData.name || '',
      type: initialData.type || 'recurring_daily',
      startTime: initialData.recurrence?.startTime || '12:00',
      endTime: initialData.recurrence?.endTime || '13:00',
      startAt: toDatetimeLocalValue(initialData.startAt),
      endAt: toDatetimeLocalValue(initialData.endAt),
      reasonCode: initialData.reasonCode || 'planned_break',
      machineIds: (initialData.machineIds || []).map((m) => m.id || m._id || m),
      priority: initialData.priority ?? 10,
      isActive: initialData.isActive !== false,
    });
  };

  const handleConfirm = () => {
    const payload = {
      name: form.name,
      type: form.type,
      reasonCode: form.reasonCode,
      machineIds: form.machineIds,
      priority: Number(form.priority) || 0,
      isActive: Boolean(form.isActive),
      timezone: 'Europe/Istanbul',
    };
    if (form.type === 'recurring_daily') {
      payload.recurrence = { startTime: form.startTime, endTime: form.endTime };
    } else {
      payload.startAt = toIso(form.startAt);
      payload.endAt = toIso(form.endAt);
    }
    onSubmit(payload);
  };

  const isRecurring = form.type === 'recurring_daily';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" TransitionProps={{ onEnter: handleEnter }}>
      <DialogTitle>{initialData ? 'Planlı Duruş Düzenle' : 'Yeni Planlı Duruş'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Ad"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            fullWidth
            required
          />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              select
              label="Tip"
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              fullWidth
            >
              <MenuItem value="recurring_daily">Günlük Tekrar</MenuItem>
              <MenuItem value="one_time">Tek Sefer</MenuItem>
            </TextField>
            <TextField
              select
              label="Reason"
              value={form.reasonCode}
              onChange={(event) => setForm((prev) => ({ ...prev, reasonCode: event.target.value }))}
              fullWidth
              required
            >
              {plannedReasons.map((reason) => (
                <MenuItem key={reason.code} value={reason.code}>
                  {reason.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          {isRecurring ? (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                type="time"
                label="Başlangıç"
                value={form.startTime}
                onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                type="time"
                label="Bitiş"
                value={form.endTime}
                onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Stack>
          ) : (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                type="datetime-local"
                label="Başlangıç"
                value={form.startAt}
                onChange={(event) => setForm((prev) => ({ ...prev, startAt: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                type="datetime-local"
                label="Bitiş"
                value={form.endAt}
                onChange={(event) => setForm((prev) => ({ ...prev, endAt: event.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Stack>
          )}
          <TextField
            select
            label="Makineler"
            value={form.machineIds}
            SelectProps={{ multiple: true }}
            onChange={(event) => setForm((prev) => ({ ...prev, machineIds: event.target.value }))}
            fullWidth
            required
            helperText="Supervisor seçili makineler için plan oluşturur"
          >
            {machineOptions.map((machine) => (
              <MenuItem key={machine.id} value={machine.id}>
                {machine.name} ({machine.code})
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <TextField
              label="Öncelik"
              type="number"
              value={form.priority}
              onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
              }
              label="Aktif"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Vazgeç
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isSubmitting || !form.name || form.machineIds.length === 0}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PlannedDowntimeRuleDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  machines: PropTypes.array.isRequired,
  plannedReasons: PropTypes.array.isRequired,
  initialData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default PlannedDowntimeRuleDialog;
