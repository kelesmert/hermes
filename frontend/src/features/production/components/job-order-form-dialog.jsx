import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';

const defaultValues = {
  part: '',
  machine: '',
  targetQuantity: 100,
  notes: '',
};

const JobOrderFormDialog = ({ open, onClose, onSubmit, initialData, isSubmitting, parts, machines }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const partValue = watch('part');
  const machineValue = watch('machine');

  useEffect(() => {
    if (initialData) {
      reset({
        part: initialData.part?.id || initialData.part || parts[0]?.id || '',
        machine: initialData.machine?.id || initialData.machine || '',
        targetQuantity: initialData.targetQuantity || 100,
        notes: initialData.notes || '',
      });
    } else if (parts.length) {
      reset({
        ...defaultValues,
        part: parts[0]?.id || '',
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, parts, reset]);

  useEffect(() => {
    if (!partValue && parts.length) {
      setValue('part', parts[0]?.id || '');
    }
  }, [partValue, parts, setValue]);

  const selectedPart = useMemo(() => parts.find((part) => part.id === partValue), [partValue, parts]);

  const compatibleMachineIds = useMemo(() => {
    if (!selectedPart || !selectedPart.compatibleMachines?.length) return null;
    return selectedPart.compatibleMachines.map((machineId) => machineId?.toString?.() || machineId);
  }, [selectedPart]);

  const availableMachines = useMemo(() => {
    if (!compatibleMachineIds || compatibleMachineIds.length === 0) return machines;
    return machines.filter((machine) => compatibleMachineIds.includes(machine.id || machine._id));
  }, [compatibleMachineIds, machines]);

  useEffect(() => {
    if (!machineValue && availableMachines.length) {
      setValue('machine', availableMachines[0]?.id || '');
    }
  }, [availableMachines, machineValue, setValue]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmitForm = (values) => {
    const payload = {
      part: values.part,
      machine: values.machine,
      targetQuantity: Number(values.targetQuantity),
      notes: values.notes?.trim() || undefined,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'İş Emrini Düzenle' : 'Yeni İş Emri'}</DialogTitle>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              select
              label="Parça"
              {...register('part', { required: 'Bu alan zorunludur.' })}
              error={Boolean(errors.part)}
              helperText={errors.part?.message}
              fullWidth
            >
              {parts.map((part) => (
                <MenuItem key={part.id} value={part.id}>
                  {part.name} ({part.code})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Makine"
              {...register('machine', { required: 'Bu alan zorunludur.' })}
              error={Boolean(errors.machine)}
              helperText={errors.machine?.message}
              fullWidth
            >
              {availableMachines.map((machine) => (
                <MenuItem key={machine.id} value={machine.id}>
                  {machine.name} ({machine.code})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Hedef Miktar"
              type="number"
              {...register('targetQuantity', {
                required: 'Bu alan zorunludur.',
                min: { value: 1, message: 'En az 1 olmalı.' },
              })}
              error={Boolean(errors.targetQuantity)}
              helperText={errors.targetQuantity?.message}
              inputProps={{ min: 1, step: 1 }}
              fullWidth
            />

            <TextField label="Notlar" multiline minRows={2} {...register('notes')} fullWidth />

            {selectedPart && (
              <Typography variant="body2" color="text.secondary">
                İdeal çevrim: {selectedPart.idealCycleTime ? `${selectedPart.idealCycleTime}s` : 'Tanımsız'}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {initialData ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

JobOrderFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isSubmitting: PropTypes.bool,
  parts: PropTypes.array,
  machines: PropTypes.array,
};

JobOrderFormDialog.defaultProps = {
  initialData: null,
  isSubmitting: false,
  parts: [],
  machines: [],
};

export default JobOrderFormDialog;
