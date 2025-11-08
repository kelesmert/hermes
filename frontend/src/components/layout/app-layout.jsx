import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/header.jsx';
import Sidebar from '@/components/layout/sidebar.jsx';
import BreadcrumbsNav from '@/components/layout/breadcrumbs.jsx';

const AppLayout = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, ml: { xs: 0, md: '260px' } }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <BreadcrumbsNav />
        <Outlet />
      </Container>
    </Box>
  </Box>
);

export default AppLayout;
