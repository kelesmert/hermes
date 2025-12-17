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
} from '@mui/material';
import { useMemo, useState } from 'react';

const ManualUnplannedDowntimeDialog = ({
  open,
  machines,
  unplannedReasons,
  initialMachineId,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const machineOptions = useMemo(() => machines || [], [machines]);
  const reasonOptions = useMemo(() => unplannedReasons || [], [unplannedReasons]);

  const [form, setForm] = useState({ machineId: '', reasonCode: '', notes: '' });

  const handleEnter = () => {
    setForm({ machineId: initialMachineId || '', reasonCode: '', notes: '' });
  };

  const handleConfirm = () => {
    onSubmit({
      machineId: form.machineId,
      reasonCode: form.reasonCode,
      notes: form.notes,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" TransitionProps={{ onEnter: handleEnter }}>
      <DialogTitle>Plansız Duruş Başlat</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            select
            label="Makine"
            value={form.machineId}
            onChange={(event) => setForm((prev) => ({ ...prev, machineId: event.target.value }))}
            fullWidth
            required
          >
            {machineOptions.map((machine) => (
              <MenuItem key={machine.id} value={machine.id}>
                {machine.name} ({machine.code})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Reason"
            value={form.reasonCode}
            onChange={(event) => setForm((prev) => ({ ...prev, reasonCode: event.target.value }))}
            fullWidth
            required
          >
            {reasonOptions.map((reason) => (
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Vazgeç
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isSubmitting || !form.machineId || !form.reasonCode}
        >
          Başlat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ManualUnplannedDowntimeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  machines: PropTypes.array.isRequired,
  unplannedReasons: PropTypes.array.isRequired,
  initialMachineId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default ManualUnplannedDowntimeDialog;

