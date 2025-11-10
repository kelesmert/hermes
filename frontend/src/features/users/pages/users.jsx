import { useState, useMemo, useEffect } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import usePermissions from '@/hooks/use-permissions.js';
import UsersTable from '@/features/users/components/user-table.jsx';
import RoleManagement from '@/features/users/components/role-list.jsx';

const UsersPage = () => {
  const { hasPermission } = usePermissions();
  const canManageRoles = hasPermission('roles.manage');
  const tabs = useMemo(
    () => [
      { label: 'Kullanıcılar', value: 'users' },
      ...(canManageRoles ? [{ label: 'Roller & İzinler', value: 'roles' }] : []),
    ],
    [canManageRoles],
  );

  const [activeTab, setActiveTab] = useState(tabs[0]?.value || 'users');

  useEffect(() => {
    if (!tabs.find((tab) => tab.value === activeTab)) {
      setActiveTab(tabs[0]?.value || 'users');
    }
  }, [tabs, activeTab]);

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 3 }}
        textColor="primary"
        indicatorColor="primary"
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      {activeTab === 'users' && <UsersTable />}
      {activeTab === 'roles' && canManageRoles && <RoleManagement />}
    </Box>
  );
};

export default UsersPage;
