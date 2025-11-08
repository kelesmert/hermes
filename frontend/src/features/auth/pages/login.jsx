import { Box, Container, Paper, Typography } from '@mui/material';
import LoginForm from '@/features/auth/components/login-form.jsx';

const LoginPage = () => (
  <Container maxWidth="sm" sx={{ py: 8 }}>
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Hermes MES
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Lütfen yönetici hesabınızla giriş yapın.
        </Typography>
      </Box>
      <LoginForm />
    </Paper>
  </Container>
);

export default LoginPage;
