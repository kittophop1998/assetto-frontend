'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import AuthService from '@/src/services/authService';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage('');
    setMessageType('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await AuthService.login({
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setMessageType('success');
      setMessage(response.message || t('auth.loggingIn'));

      const redirectParam = searchParams.get('redirect');
      const redirectTarget = redirectParam && redirectParam.startsWith('/')
        ? decodeURIComponent(redirectParam)
        : '/dashboard';

      setTimeout(() => {
        setMessage(t('auth.welcomeUser', { username: formData.username }));
        setTimeout(() => {
          router.push(redirectTarget);
        }, 800);
      }, 800);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
          ? String(err.response.data.message)
          : t('auth.loginError');
      setMessageType('error');
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}15 100%)`,
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={8}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            borderRadius: 4,
            overflow: 'hidden',
            minHeight: { xs: 'auto', md: '600px' },
          }}
        >
          {/* Left Side: Welcome Section */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 6, md: 8 },
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                p: 3,
                mb: 3,
                backdropFilter: 'blur(10px)',
              }}
            >
              <LayersIcon sx={{ fontSize: 80 }} />
            </Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {t('auth.welcome')}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t('auth.welcomeMessage')}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t('app.title')}
            </Typography>
          </Box>

          {/* Right Side: Login Form */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 4, md: 8 },
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="600" color="text.primary" gutterBottom>
                {t('auth.loginTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.loginSubtitle')}
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Username Field */}
              <TextField
                fullWidth
                label={t('auth.username')}
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                placeholder={t('auth.usernamePlaceholder')}
                margin="normal"
                autoComplete="username"
                autoFocus
                sx={{ mb: 2 }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label={t('auth.password')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                placeholder={t('auth.passwordPlaceholder')}
                margin="normal"
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                {loading ? t('auth.loggingIn') : t('auth.login')}
              </Button>
            </Box>

            {/* Message Box */}
            {message && (
              <Alert
                severity={messageType === 'success' ? 'success' : 'error'}
                sx={{ mt: 3 }}
              >
                {message}
              </Alert>
            )}

            {/* Mock Credentials Info */}
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: 'info.lighter',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.light',
              }}
            >
              <Typography variant="caption" color="info.main" fontWeight="600" display="block" gutterBottom>
                🔐 Test Credentials
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                <strong>Username:</strong> earthdev
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                <strong>Password:</strong> Aa123456
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
