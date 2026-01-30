import { Chip } from '@mui/material';
import { StatusBadgeType, STATUS_BADGE_CONFIG } from '@/src/constants/status';

interface StatusBadgeProps {
  status: StatusBadgeType;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status] || { color: 'default' as const, label: status };

  return (
    <Chip
      label={label || config.label}
      color={config.color}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: 11,
        height: 24,
        '& .MuiChip-label': {
          px: 1.5,
        },
      }}
    />
  );
}
