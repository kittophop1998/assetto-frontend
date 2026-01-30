'use client';

import { Box, Typography } from '@mui/material';

export default function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        AssetFlow
      </Typography>
      <Typography variant="h6" color="text.secondary">
        ระบบจัดการทรัพย์สินองค์กร
      </Typography>
    </Box>
  );
}
