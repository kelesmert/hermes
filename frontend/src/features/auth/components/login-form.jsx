import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, CircularProgress, Stack, TextField } from '@mui/material';
import useSession from '@/features/auth/hooks/use-session.js';
import toast from 'react-hot-toast';
import authApi from '@/features/auth/services/auth-api.js';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin.'),
  password: z.string().min(6, 'En az 6 karakter olmalı.'),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values) => {
    try {
      const data = await authApi.login(values);
      login(data);
      toast.success('Giriş başarılı');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Giriş işlemi başarısız oldu.';
      toast.error(message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        <TextField
          label="E-posta"
          type="email"
          {...register('email')}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          fullWidth
        />
        <TextField
          label="Şifre"
          type="password"
          {...register('password')}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          fullWidth
        />

        <Alert severity="info" variant="outlined">
          Demo kullanıcı: `admin@hermes.local` / `ChangeMe123!`
        </Alert>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          fullWidth
          startIcon={isSubmitting ? <CircularProgress color="inherit" size={16} /> : null}
        >
          {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginForm;
