import { Card, CardContent, Box, Typography, SvgIconProps } from '@mui/material';
import { ElementType } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ElementType<SvgIconProps>;
  color?: string;
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, color = 'primary.main', subtitle }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
