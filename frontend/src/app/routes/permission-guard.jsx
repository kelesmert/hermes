import PropTypes from 'prop-types';
import { Alert, Box } from '@mui/material';
import usePermissions from '@/hooks/use-permissions.js';

const PermissionGuard = ({ requiredPermissions = [], children }) => {
  const { hasEveryPermission } = usePermissions();

  if (requiredPermissions.length === 0 || hasEveryPermission(requiredPermissions)) {
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
  children: PropTypes.node.isRequired,
};

export default PermissionGuard;
