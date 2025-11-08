import { AppBar, Avatar, Badge, Box, IconButton, InputBase, Toolbar, Typography } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import useSession from '@/features/auth/hooks/use-session.js';

const Header = () => {
  const { user, logout } = useSession();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'background.paper',
      }}
    >
      <Toolbar sx={{ display: 'flex', gap: 2 }}>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: 999,
            px: 2,
            py: 0.5,
            maxWidth: 420,
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase placeholder="Genel arama (yakında)" fullWidth sx={{ fontSize: 14 }} />
        </Box>

        <IconButton color="inherit">
          <Badge color="error" variant="dot">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            {user?.firstName?.[0] || 'H'}
          </Avatar>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="subtitle2">{user?.fullName || 'Hermes Admin'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.roles?.[0] || 'Operator'}
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
