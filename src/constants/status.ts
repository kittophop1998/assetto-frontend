import { RequestStatus } from '@/src/services/requestService';
import { AssetStatusType } from '@/src/services/assetService';

export type RequestStatusBadge = 'Pending' | 'Approved' | 'Rejected' | 'Pending_return';
export type AssetStatusBadge = 'NORMAL' | 'LOW_STOCK' | 'IN_USE';
export type StatusBadgeType = RequestStatusBadge | AssetStatusBadge | 'Reviewed';

export type BadgeColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

// Status badge color and label configuration
export const STATUS_BADGE_CONFIG: Record<
  StatusBadgeType,
  { color: BadgeColor; label?: string }
> = {
  // Asset statuses
  NORMAL: { color: 'success', label: 'Normal' },
  IN_USE: { color: 'info', label: 'In Use' },
  LOW_STOCK: { color: 'warning', label: 'Low Stock' },
  // Request statuses
  Pending: { color: 'warning', label: 'Pending' },
  Pending_return: { color: 'warning', label: 'Pending Return' },
  Approved: { color: 'success', label: 'Approved' },
  Rejected: { color: 'error', label: 'Rejected' },
  // Other
  Reviewed: { color: 'secondary', label: 'Reviewed' },
};

export const REQUEST_STATUS_BADGE_MAP: Record<
  RequestStatus,
  { badge: RequestStatusBadge; labelKey: string }
> = {
  PENDING: { badge: 'Pending', labelKey: 'status.request.pending' },
  PENDING_RETURN: { badge: 'Pending_return', labelKey: 'status.request.pending_return' },
  APPROVED: { badge: 'Approved', labelKey: 'status.request.approved' },
  REJECTED: { badge: 'Rejected', labelKey: 'status.request.rejected' },
};

// Asset status badge mapping for StatusBadge component
export const ASSET_STATUS_BADGE_MAP: Record<
  AssetStatusType,
  { badge: AssetStatusBadge; labelKey?: string }
> = {
  NORMAL: { badge: 'NORMAL', labelKey: 'status.asset.normal' },
  LOW_STOCK: { badge: 'LOW_STOCK', labelKey: 'status.asset.lowStock' },
};
