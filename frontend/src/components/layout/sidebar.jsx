import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import usePermissions from '@/hooks/use-permissions.js';
import { NAV_ITEMS } from '@/constants/navigation.js';
import Logo from '@/components/ui/logo.jsx';

const drawerWidth = 260;
const logoAreaHeight = 76;

const Sidebar = () => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const hasNavAccess = (permission) => {
    if (!permission) return true;
    if (Array.isArray(permission)) {
      return permission.some((perm) => hasPermission(perm));
    }
    return hasPermission(permission);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#111827',
          color: '#f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        },
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Box
        sx={{
          height: logoAreaHeight,
          minHeight: logoAreaHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Logo />
      </Box>
      <List sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {NAV_ITEMS.filter((item) => hasNavAccess(item.permission)).map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={active}
              sx={{
                '&.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight={active ? 600 : 400}>
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
