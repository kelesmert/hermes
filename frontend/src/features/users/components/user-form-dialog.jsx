import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

const defaultValues = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roleIds: [],
  isActive: true,
};

const UserFormDialog = ({ open, onClose, onSubmit, roles, initialData }) => {
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
        username: initialData.username || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        password: '',
        roleIds: (initialData.roles || []).map((role) => role.id),
        isActive: typeof initialData.isActive === 'boolean' ? initialData.isActive : true,
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              label="Kullanıcı Adı"
              {...register('username', { required: true })}
              fullWidth
            />
            <TextField label="Ad" {...register('firstName', { required: true })} fullWidth />
            <TextField label="Soyad" {...register('lastName', { required: true })} fullWidth />
            <TextField
              label="E-posta"
              type="email"
              {...register('email')}
              helperText="Opsiyonel - şifre reset ve bildirimler için kullanılacak."
              fullWidth
            />
            <TextField
              label="Şifre"
              type="password"
              {...register('password', { required: !initialData })}
              fullWidth
              helperText={initialData ? 'Boş bırakırsanız şifre değişmez.' : ''}
            />
            <FormControl fullWidth>
              <InputLabel id="role-select-label">Roller</InputLabel>
              <Controller
                name="roleIds"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="role-select-label"
                    label="Roller"
                    multiple
                    renderValue={(selected) =>
                      roles
                        .filter((role) => selected.includes(role.id))
                        .map((role) => role.label || role.name)
                        .join(', ')
                    }
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.label || role.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => <Switch {...field} checked={field.value} />}
                />
              }
              label="Aktif"
            />
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

UserFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      label: PropTypes.string,
    }),
  ),
  initialData: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
      }),
    ),
    isActive: PropTypes.bool,
  }),
};

UserFormDialog.defaultProps = {
  roles: [],
  initialData: null,
};

export default UserFormDialog;
