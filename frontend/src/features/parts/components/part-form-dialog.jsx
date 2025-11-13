import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
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
import { Controller, useForm } from 'react-hook-form';

const defaultValues = {
  code: '',
  name: '',
  description: '',
  category: '',
  unit: '',
  tags: '',
  idealCycleTime: '',
  compatibleMachines: [],
  feedRate: '',
  spindleSpeed: '',
  coolant: '',
};

const PartFormDialog = ({ open, onClose, onSubmit, initialData, isSubmitting, machines }) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || '',
        unit: initialData.unit || '',
        tags: (initialData.tags || []).join(', '),
        idealCycleTime: initialData.idealCycleTime ?? '',
        compatibleMachines: (initialData.compatibleMachines || []).map((id) => id?.toString?.() || id),
        feedRate: initialData.defaultMachineSettings?.feedRate ?? '',
        spindleSpeed: initialData.defaultMachineSettings?.spindleSpeed ?? '',
        coolant: initialData.defaultMachineSettings?.coolant ?? '',
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmitForm = (values) => {
    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || '',
      category: values.category?.trim() || '',
      unit: values.unit?.trim() || '',
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      idealCycleTime: Number(values.idealCycleTime) || 0,
      compatibleMachines: values.compatibleMachines || [],
    };

    const defaultMachineSettings = {
      feedRate:
        values.feedRate === '' || values.feedRate === null ? undefined : Number(values.feedRate),
      spindleSpeed:
        values.spindleSpeed === '' || values.spindleSpeed === null
          ? undefined
          : Number(values.spindleSpeed),
      coolant: values.coolant?.trim() || undefined,
    };

    const cleanedSettings = Object.fromEntries(
      Object.entries(defaultMachineSettings).filter(([, val]) => val !== undefined && val !== ''),
    );

    if (Object.keys(cleanedSettings).length) {
      payload.defaultMachineSettings = cleanedSettings;
    }

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? 'Parçayı Düzenle' : 'Yeni Parça'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
              <TextField
                label="Parça Kodu"
                {...register('code', { required: 'Bu alan zorunludur.' })}
                error={Boolean(errors.code)}
                helperText={errors.code?.message}
                fullWidth
                disabled={Boolean(initialData)}
              />
              <TextField
                label="Parça Adı"
                {...register('name', { required: 'Bu alan zorunludur.' })}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                fullWidth
              />
            </Stack>
            <TextField
              label="Açıklama"
              {...register('description')}
              multiline
              minRows={2}
              fullWidth
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
              <TextField label="Kategori" {...register('category')} fullWidth />
              <TextField label="Birim" {...register('unit')} fullWidth />
              <TextField
                label="İdeal Çevrim Süresi (sn)"
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                {...register('idealCycleTime', { required: 'Bu alan zorunludur.' })}
                error={Boolean(errors.idealCycleTime)}
                helperText={errors.idealCycleTime?.message}
                fullWidth
              />
            </Stack>
            <TextField label="Etiketler (virgülle ayır)" {...register('tags')} fullWidth />
            <Controller
              name="compatibleMachines"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Uyumlu Makineler"
                  SelectProps={{
                    multiple: true,
                    value: field.value,
                    onChange: (event) => field.onChange(event.target.value),
                  }}
                  fullWidth
                  helperText="Birden fazla makine seçebilirsiniz"
                >
                  {machines.map((machine) => (
                    <MenuItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Varsayılan Makine Ayarları (opsiyonel)
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
                <TextField
                  label="Feed Rate"
                  type="number"
                  inputProps={{ step: 0.01 }}
                  {...register('feedRate')}
                  fullWidth
                />
                <TextField
                  label="Spindle Speed"
                  type="number"
                  inputProps={{ step: 1 }}
                  {...register('spindleSpeed')}
                  fullWidth
                />
                <TextField label="Soğutma" {...register('coolant')} fullWidth />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {initialData ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

PartFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    code: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    unit: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    idealCycleTime: PropTypes.number,
    compatibleMachines: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
    defaultMachineSettings: PropTypes.shape({
      feedRate: PropTypes.number,
      spindleSpeed: PropTypes.number,
      coolant: PropTypes.string,
    }),
  }),
  isSubmitting: PropTypes.bool,
  machines: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

PartFormDialog.defaultProps = {
  initialData: null,
  isSubmitting: false,
  machines: [],
};

export default PartFormDialog;
