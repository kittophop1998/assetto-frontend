import { Box, Typography, Container } from '@mui/material';
import { Construction } from '@mui/icons-material';

interface UnderDevelopmentProps {
  pageName: string;
}

export default function UnderDevelopment({ pageName }: UnderDevelopmentProps) {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Construction
          sx={{
            fontSize: 120,
            color: 'warning.main',
            opacity: 0.7,
          }}
        />
        <Typography variant="h4" color="text.primary" fontWeight="medium">
          หน้า {pageName} กำลังอยู่ในการพัฒนา
        </Typography>
        <Typography variant="body1" color="text.secondary">
          เรากำลังพัฒนาฟีเจอร์นี้อยู่ โปรดติดตามในเร็วๆ นี้
        </Typography>
      </Box>
    </Container>
  );
}
