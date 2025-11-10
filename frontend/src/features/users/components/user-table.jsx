import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import {
  fetchUsers,
  fetchRoles,
  createUser,
  updateUser,
} from '@/features/users/services/users-api.js';
import UserFormDialog from '@/features/users/components/user-form-dialog.jsx';

const DataState = ({ isLoading, hasData, onRefresh, isFiltered }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!hasData) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          {isFiltered ? 'Aramanızla eşleşen kullanıcı bulunamadı.' : 'Henüz kullanıcı bulunmuyor.'}
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={onRefresh}>
          Yenile
        </Button>
      </Stack>
    );
  }
  return null;
};

DataState.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  hasData: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  isFiltered: PropTypes.bool.isRequired,
};

const UsersTable = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: roleOptions = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('Kullanıcı oluşturuldu.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Kullanıcı oluşturulamadı.';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => {
      toast.success('Kullanıcı güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Kullanıcı güncellenemedi.';
      toast.error(message);
    },
  });

  const handleOpenDialog = (user) => {
    setEditingUser(user || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmitUser = (values) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      roleIds: values.roleIds,
      isActive: values.isActive,
    };
    if (!editingUser || values.password) {
      payload.password = values.password;
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggleActive = (user) => {
    updateMutation.mutate({
      id: user.id,
      payload: { isActive: !user.isActive },
    });
  };

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const term = search.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [users, search]);

  const columns = useMemo(
    () => [
      {
        header: 'Ad Soyad',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => (
          <Stack>
            <Typography fontWeight={600}>{`${row.original.firstName} ${row.original.lastName}`}</Typography>
            <Typography variant="body2" color="text.secondary">
              {row.original.email}
            </Typography>
          </Stack>
        ),
      },
      {
        header: 'Roller',
        accessorKey: 'roles',
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(row.original.roles || []).map((role) => (
              <Chip key={role.id} label={role.label || role.name} size="small" />
            ))}
          </Stack>
        ),
      },
      {
        header: 'Durum',
        accessorKey: 'isActive',
        cell: ({ row }) => (
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={row.original.isActive}
                onChange={() => handleToggleActive(row.original)}
              />
            }
            label={row.original.isActive ? 'Aktif' : 'Pasif'}
          />
        ),
      },
      {
        header: 'İşlemler',
        cell: ({ row }) => (
          <Tooltip title="Düzenle">
            <IconButton onClick={() => handleOpenDialog(row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [handleToggleActive],
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" mb={3}>
          <TextField
            placeholder="İsim veya e-posta ara"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            sx={{ maxWidth: 320 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={rolesLoading}
          >
            Yeni Kullanıcı
          </Button>
        </Stack>

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} sx={{ fontWeight: 600 }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <DataState
          isLoading={usersLoading}
          hasData={filteredUsers.length > 0}
          isFiltered={Boolean(search)}
          onRefresh={() => refetchUsers()}
        />
      </CardContent>

      <UserFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitUser}
        roles={roleOptions}
        initialData={editingUser}
      />
    </Card>
  );
};

export default UsersTable;
