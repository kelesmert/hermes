import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { tr } from 'date-fns/locale';

const isEditableWithinWindow = (downtime, windowMinutes = 5) => {
  const base = downtime.endedAt ? new Date(downtime.endedAt) : new Date(downtime.startedAt);
  const deadline = new Date(base.getTime() + windowMinutes * 60 * 1000);
  return new Date() <= deadline;
};

const DowntimeEditDialog = ({ open, downtime, reasons, onClose, onSubmit, isSubmitting }) => {
  const plannedReasons = useMemo(() => reasons.filter((r) => r.category === 'planned'), [reasons]);
  const unplannedReasons = useMemo(() => reasons.filter((r) => r.category === 'unplanned'), [reasons]);

  const isPlanned = downtime?.reasonCategory === 'planned';
  const options = isPlanned ? plannedReasons : unplannedReasons;
  const fallbackOptions = reasons;

  const [form, setForm] = useState({ reasonCode: '', notes: '' });

  const canPatch = downtime ? isEditableWithinWindow(downtime, 5) : false;
  const actionLabel = canPatch ? 'Kaydet' : 'Split ile Değiştir';

  const handleEnter = () => {
    setForm({
      reasonCode: downtime?.reasonCode || '',
      notes: downtime?.metadata?.notes || '',
    });
  };

  const handleConfirm = () => {
    if (!downtime) return;
    if (!form.reasonCode) return;
    onSubmit({ downtime, payload: { reasonCode: form.reasonCode, notes: form.notes } });
  };

  const durationText = downtime?.startedAt
    ? formatDistanceToNowStrict(new Date(downtime.startedAt), { addSuffix: true, locale: tr })
    : '-';

  const machineLabel = downtime?.machine
    ? `${downtime.machine.name || '-'} (${downtime.machine.code || '-'})`
    : downtime?.machine;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" TransitionProps={{ onEnter: handleEnter }}>
      <DialogTitle>Duruş Sınıflandır</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Makine</Typography>
            <Typography variant="body2" color="text.secondary">
              {machineLabel}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Başlangıç</Typography>
            <Typography variant="body2" color="text.secondary">
              {durationText}
            </Typography>
          </Stack>
          <TextField
            select
            label="Reason"
            value={form.reasonCode}
            onChange={(event) => setForm((prev) => ({ ...prev, reasonCode: event.target.value }))}
            required
            fullWidth
          >
            {(options.length ? options : fallbackOptions).map((reason) => (
              <MenuItem key={reason.code} value={reason.code}>
                {reason.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Not"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            multiline
            minRows={2}
            fullWidth
          />
          {!canPatch && (
            <Typography variant="caption" color="text.secondary">
              5 dk düzeltme penceresi doldu, reason değişimi split ile yapılacak.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Vazgeç
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isSubmitting || !form.reasonCode}
        >
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DowntimeEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  downtime: PropTypes.object,
  reasons: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    }),
  ),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default DowntimeEditDialog;

