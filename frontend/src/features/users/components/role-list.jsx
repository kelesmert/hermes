import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
} from '@/features/users/services/users-api.js';
import RoleFormDialog from '@/features/users/components/role-form-dialog.jsx';

const RoleManagement = () => {
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success('Rol oluşturuldu.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      handleCloseDialog();
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Rol oluşturulamadı.';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: () => {
      toast.success('Rol güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      handleCloseDialog();
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Rol güncellenemedi.';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRole(id),
    onSuccess: (result) => {
      toast.success(
        result.reassignedUserCount
          ? `Rol silindi. ${result.reassignedUserCount} kullanıcı viewer rolüne atandı.`
          : 'Rol silindi.',
      );
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setConfirmOpen(false);
      setSelectedRole(null);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Rol silinemedi.';
      toast.error(message);
    },
  });

  const handleOpenDialog = (role) => {
    setSelectedRole(role || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRole(null);
  };

  const handleSubmitRole = (values) => {
    const payload = {
      name: values.name,
      label: values.label,
      description: values.description,
      permissionIds: values.permissionIds,
      isDefault: values.isDefault,
    };

    if (selectedRole) {
      payload.name = selectedRole.name;
      updateMutation.mutate({ id: selectedRole.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;
    deleteMutation.mutate(selectedRole.id);
  };

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" mb={3}>
          <Typography variant="h6">Roller & İzinler</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={permissionsLoading}
          >
            Yeni Rol
          </Button>
        </Stack>

        {rolesLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {roles.map((role) => (
              <Grid item xs={12} md={6} key={role.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box>
                        <Typography fontWeight={600}>{role.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.description || role.name}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Düzenle">
                          <span>
                            <IconButton onClick={() => handleOpenDialog(role)} disabled={permissionsLoading}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <span>
                            <IconButton
                              onClick={() => {
                                setSelectedRole(role);
                                setConfirmOpen(true);
                              }}
                              disabled={role.name === 'viewer' || role.name === 'master'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {(role.permissions || []).slice(0, 6).map((permission) => (
                        <Chip
                          key={permission.id}
                          label={permission.label || permission.name}
                          size="small"
                        />
                      ))}
                      {(role.permissions || []).length > 6 && (
                        <Chip
                          size="small"
                          label={`+${role.permissions.length - 6} izin`}
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>

      <RoleFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitRole}
        permissions={permissions}
        initialData={selectedRole}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!deleteMutation.isLoading) {
            setConfirmOpen(false);
            setSelectedRole(null);
          }
        }}
      >
        <DialogTitle>Rolü Sil</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            {selectedRole?.label} rolünü silmek üzeresiniz. Bu role sahip kullanıcılar, başka rolleri yoksa
            otomatik olarak temel viewer rolüne atanacaktır.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Devam etmek istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setSelectedRole(null);
            }}
            disabled={deleteMutation.isLoading}
          >
            Vazgeç
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteRole}
            disabled={deleteMutation.isLoading}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default RoleManagement;
