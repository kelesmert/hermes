import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import usePermissions from '@/hooks/use-permissions.js';
import { NAV_ITEMS } from '@/constants/navigation.js';
import Logo from '@/components/ui/logo.jsx';

const drawerWidth = 260;

const Sidebar = () => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

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
        },
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
        <Logo />
      </Toolbar>
      <List>
        {NAV_ITEMS.filter((item) => hasPermission(item.permission)).map((item) => {
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
