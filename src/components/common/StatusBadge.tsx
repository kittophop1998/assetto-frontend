import { Chip } from '@mui/material';

type Status =
  | 'NORMAL'
  | 'LOW_STOCK'
  | 'IN_USE'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Reviewed';

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const statusConfig: Record<
  Status,
  { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; label?: string }
> = {
  NORMAL: { color: 'success', label: 'Normal' },
  IN_USE: { color: 'info', label: 'In Use' },
  LOW_STOCK: { color: 'warning', label: 'Low Stock' },
  Pending: { color: 'warning', label: 'Pending' },
  Approved: { color: 'success', label: 'Approved' },
  Rejected: { color: 'error', label: 'Rejected' },
  Reviewed: { color: 'secondary', label: 'Reviewed' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status] || { color: 'default' as const, label: status };

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
