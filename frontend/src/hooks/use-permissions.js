import { useMemo } from 'react';
import useSession from '@/features/auth/hooks/use-session.js';

const usePermissions = () => {
  const { permissions = [] } = useSession();

  const hasPermission = useMemo(
    () => (permission) => (!permission ? true : permissions.includes(permission)),
    [permissions],
  );

  const hasEveryPermission = (required = []) => required.every((perm) => hasPermission(perm));

  return { permissions, hasPermission, hasEveryPermission };
};

export default usePermissions;
