import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h3" gutterBottom>
      404
    </Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      Aradığınız sayfa bulunamadı.
    </Typography>
    <Button component={RouterLink} to="/dashboard" variant="contained">
      Dashboard'a dön
    </Button>
  </Box>
);

export default NotFoundPage;
