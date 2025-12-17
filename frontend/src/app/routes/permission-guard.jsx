import PropTypes from 'prop-types';
import { Alert, Box } from '@mui/material';
import usePermissions from '@/hooks/use-permissions.js';

const PermissionGuard = ({ requiredPermissions = [], mode = 'every', children }) => {
  const { hasPermission, hasEveryPermission } = usePermissions();

  const isAllowed =
    requiredPermissions.length === 0 ||
    (mode === 'any'
      ? requiredPermissions.some((perm) => hasPermission(perm))
      : hasEveryPermission(requiredPermissions));

  if (isAllowed) {
    return children;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Alert severity="warning" variant="outlined">
        Bu alanı görüntülemek için yetkiniz yok. Lütfen sistem yöneticinizle iletişime geçin.
      </Alert>
    </Box>
  );
};

PermissionGuard.propTypes = {
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  mode: PropTypes.oneOf(['every', 'any']),
  children: PropTypes.node.isRequired,
};

export default PermissionGuard;
