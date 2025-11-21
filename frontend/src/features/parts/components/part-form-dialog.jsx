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
import { Controller, useForm, useWatch } from 'react-hook-form';
import { PART_CATEGORIES, getCategoryById } from '@/features/parts/constants/part-categories.js';

const FIRST_CATEGORY = PART_CATEGORIES[0]?.id || '';

const defaultValues = {
  code: '',
  name: '',
  description: '',
  category: FIRST_CATEGORY,
  unit: PART_CATEGORIES[0]?.defaultUnit || '',
  tags: '',
  idealCycleTime: '',
  compatibleMachines: [],
  settings: {},
};

const PartFormDialog = ({ open, onClose, onSubmit, initialData, isSubmitting, machines }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || FIRST_CATEGORY,
        unit: initialData.unit || '',
        tags: (initialData.tags || []).join(', '),
        idealCycleTime: initialData.idealCycleTime ?? '',
        compatibleMachines: (initialData.compatibleMachines || []).map((id) => id?.toString?.() || id),
        settings: initialData.defaultMachineSettings || {},
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const selectedCategory = useWatch({ control, name: 'category' });
  const categoryConfig = getCategoryById(selectedCategory) || getCategoryById(FIRST_CATEGORY) || PART_CATEGORIES[0];

  useEffect(() => {
    if (!categoryConfig) return;
    const currentUnit = getValues('unit');
    if (!currentUnit || !categoryConfig.units.includes(currentUnit)) {
      setValue('unit', categoryConfig.defaultUnit || categoryConfig.units[0] || '', {
        shouldDirty: true,
      });
    }
  }, [categoryConfig, getValues, setValue]);

  useEffect(() => {
    if (!categoryConfig) return;
    if (initialData) return;
    (categoryConfig.machineSettings || []).forEach((field) => {
      const currentValue = getValues(`settings.${field.key}`);
      if (
        (currentValue === undefined || currentValue === null || currentValue === '') &&
        field.defaultValue !== undefined &&
        field.defaultValue !== null
      ) {
        setValue(`settings.${field.key}`, field.defaultValue, { shouldDirty: true });
      }
    });
  }, [categoryConfig, getValues, setValue, initialData]);

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmitForm = (values) => {
    const tags = values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const defaultMachineSettings = {};
    const settings = values.settings || {};
    (categoryConfig?.machineSettings || []).forEach((field) => {
      const raw = settings?.[field.key];
      const effectiveValue =
        raw === undefined || raw === null || raw === ''
          ? field.defaultValue
          : raw;
      if (effectiveValue === undefined || effectiveValue === null || effectiveValue === '') return;
      defaultMachineSettings[field.key] =
        field.type === 'number' ? Number(effectiveValue) : effectiveValue;
    });

    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || '',
      category: values.category,
      unit: values.unit,
      tags,
      idealCycleTime: Number(values.idealCycleTime),
      compatibleMachines: values.compatibleMachines || [],
      defaultMachineSettings: Object.keys(defaultMachineSettings).length
        ? defaultMachineSettings
        : undefined,
    };

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

            <TextField label="Açıklama" {...register('description')} multiline minRows={2} fullWidth />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
              <TextField
                select
                label="Kategori"
                {...register('category', { required: 'Bu alan zorunludur.' })}
                fullWidth
              >
                {PART_CATEGORIES.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Birim"
                {...register('unit', { required: 'Bu alan zorunludur.' })}
                fullWidth
              >
                {categoryConfig?.units?.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>

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
                {categoryConfig?.label} için Varsayılan Makine Ayarları
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} flexWrap="wrap">
                {(categoryConfig?.machineSettings || []).map((field) => (
                  <TextField
                    key={field.key}
                    label={field.label}
                    type={field.type === 'number' ? 'number' : 'text'}
                    inputProps={field.type === 'number' ? { step: field.step || 1 } : undefined}
                    placeholder={
                      field.defaultValue !== undefined && field.defaultValue !== null
                        ? String(field.defaultValue)
                        : ''
                    }
                    {...register(`settings.${field.key}`)}
                    sx={{ flex: '1 1 260px' }}
                  />
                ))}
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
    compatibleMachines: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    ),
    defaultMachineSettings: PropTypes.object,
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
