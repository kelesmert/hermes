import { Box, Container, Paper, Typography } from "@mui/material";
import LoginForm from "@/features/auth/components/login-form.jsx";

const LoginPage = () => (
  <Container maxWidth="sm" sx={{ py: 8 }}>
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Box
          component="img"
          src="/brand/hermes-logo.png"
          alt="Hermes MES"
          sx={{
            height: 35,
            width: "auto",
            maxWidth: "100%",
            mb: 1,
          }}
        />
        <Typography color="text.secondary" variant="body2">
          Hoşgeldiniz!
        </Typography>
      </Box>
      <LoginForm />
    </Paper>
  </Container>
);

export default LoginPage;
