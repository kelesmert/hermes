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
  Switch,
  TextField,
  FormControlLabel,
} from '@mui/material';
import { useForm } from 'react-hook-form';

const defaultValues = {
  code: '',
  name: '',
  tags: '',
  isActive: true,
  responsibleUser: '',
};

const MachineFormDialog = ({ open, onClose, onSubmit, initialData, isSubmitting, users }) => {
  const {
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
        tags: (initialData.tags || []).join(', '),
        isActive: typeof initialData.isActive === 'boolean' ? initialData.isActive : true,
        responsibleUser: initialData.responsibleUser?.id || initialData.responsibleUser || '',
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmitForm = (values) => {
    const responsibleUserValue = values.responsibleUser?.toString?.() || values.responsibleUser;
    const responsibleUser =
      responsibleUserValue || (initialData ? null : undefined);
    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      isActive: values.isActive,
      ...(responsibleUser !== undefined && { responsibleUser }),
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Makineyi Düzenle' : 'Yeni Makine'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              label="Makine Kodu"
              {...register('code', { required: 'Bu alan zorunludur.' })}
              error={Boolean(errors.code)}
              helperText={errors.code?.message}
              fullWidth
              disabled={Boolean(initialData)}
            />
            <TextField
              label="Makine Adı"
              {...register('name', { required: 'Bu alan zorunludur.' })}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              fullWidth
            />
            <TextField
              label="Etiketler (virgülle ayır)"
              {...register('tags')}
              helperText="Örn: press, hat-a"
              fullWidth
            />
            <TextField select label="Sorumlu Kullanıcı" {...register('responsibleUser')} fullWidth>
              <MenuItem value="">Seçilmedi</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.username})
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={<Switch {...register('isActive')} defaultChecked />}
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

MachineFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.string,
    code: PropTypes.string,
    name: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    isActive: PropTypes.bool,
    responsibleUser: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  isSubmitting: PropTypes.bool,
  users: PropTypes.array,
};

MachineFormDialog.defaultProps = {
  initialData: null,
  isSubmitting: false,
  users: [],
};

export default MachineFormDialog;
