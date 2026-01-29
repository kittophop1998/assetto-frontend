'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import MainLayout from '@/src/components/layout/MainLayout';
import { useTranslation } from 'react-i18next';
import UserService, { UpdateUserRequest } from '@/src/services/userService';
import { getDepartment, Department } from '@/src/services/masterService';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  email: string;
  department_id: string;
  department_name: string;
}

export default function SettingsPage() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    fullName: '',
    email: '',
    departmentId: '',
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userResponse, departmentsData] = await Promise.all([
        UserService.getCurrentUser(),
        getDepartment(),
      ]);

      // Extract user data from response wrapper
      const userData = userResponse.data;

      setUserProfile(userData);
      setDepartments(departmentsData);
      setFormData({
        fullName: userData.full_name,
        email: userData.email,
        departmentId: userData.department_id,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setError(errorMessage || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateUserRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.departmentId) {
      setError('Please select a department');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await UserService.updateUser(formData);

      if (typeof window !== 'undefined' && userProfile) {
        const selectedDept = departments.find(d => d.id.toString() === formData.departmentId);
        const updatedUser = {
          ...userProfile,
          full_name: formData.fullName,
          email: formData.email,
          department_id: formData.departmentId,
          department_name: selectedDept?.name || userProfile.department_name,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserProfile(updatedUser);
      }

      setSuccess('Profile updated successfully!');

      setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/login');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setError(errorMessage || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title={t('menu.settings')}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={t('menu.settings')}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              User Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Update your profile information
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="User ID"
                    value={userProfile?.id || ''}
                    disabled
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    disabled
                    label="Username"
                    value={userProfile?.username || ''}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  required
                  type='text'
                  label="Full Name"
                  value={formData?.fullName}
                  onChange={handleChange('fullName')}
                />

                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  required
                  select
                  label="Department"
                  value={formData.departmentId}
                  onChange={handleChange('departmentId')}
                  disabled={saving}
                  helperText="Select your department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id.toString()}>
                      {dept.name} ({dept.code})
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={fetchData}
                    disabled={saving}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
