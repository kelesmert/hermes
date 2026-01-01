import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

const defaultValues = {
  name: '',
  label: '',
  description: '',
  permissionIds: [],
  isDefault: false,
};

const RoleFormDialog = ({ open, onClose, onSubmit, permissions, initialData }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        label: initialData.label || '',
        description: initialData.description || '',
        permissionIds: (initialData.permissions || []).map((permission) => permission.id),
        isDefault: Boolean(initialData.isDefault),
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      const category = permission.category || 'Diğer';
      acc[category] = acc[category] || [];
      acc[category].push(permission);
      return acc;
    }, {});
  }, [permissions]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? 'Rolü Düzenle' : 'Yeni Rol'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2.5} mb={3}>
            <TextField
              label="Rol Adı (sistem)"
              {...register('name', { required: true })}
              disabled={Boolean(initialData)}
              helperText={initialData ? 'Rol adı değiştirilemez.' : 'Örn: master, supervisor, operator, viewer'}
              fullWidth
            />
            <TextField label="Görünen İsim" {...register('label', { required: true })} fullWidth />
            <TextField
              label="Açıklama"
              {...register('description')}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControlLabel
              control={
                <Controller
                  name="isDefault"
                  control={control}
                  render={({ field }) => <Switch {...field} checked={field.value} />}
                />
              }
              label="Yeni kullanıcılar için varsayılan rol"
            />
          </Stack>

          <Typography variant="subtitle2" mb={1}>
            İzinler
          </Typography>
          <Controller
            name="permissionIds"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Stack spacing={2}>
                {Object.entries(groupedPermissions).map(([category, items]) => (
                  <Box key={category}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      {category}
                    </Typography>
                    <FormGroup row>
                      {items.map((permission) => (
                        <FormControlLabel
                          key={permission.id}
                          control={
                            <Checkbox
                              checked={field.value.includes(permission.id)}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  field.onChange([...field.value, permission.id]);
                                } else {
                                  field.onChange(field.value.filter((id) => id !== permission.id));
                                }
                              }}
                            />
                          }
                          label={permission.label}
                        />
                      ))}
                    </FormGroup>
                    <Divider sx={{ my: 1.5 }} />
                  </Box>
                ))}
              </Stack>
            )}
          />
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

RoleFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      label: PropTypes.string,
      category: PropTypes.string,
    }),
  ),
  initialData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    description: PropTypes.string,
    isDefault: PropTypes.bool,
    permissions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      }),
    ),
  }),
};

RoleFormDialog.defaultProps = {
  permissions: [],
  initialData: null,
};

export default RoleFormDialog;
