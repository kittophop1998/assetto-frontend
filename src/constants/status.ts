import { RequestStatus } from '@/src/services/requestService';
import { AssetStatusType } from '@/src/services/assetService';

export type RequestStatusBadge = 'Pending' | 'Approved' | 'Rejected';
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
  Approved: { color: 'success', label: 'Approved' },
  Rejected: { color: 'error', label: 'Rejected' },
  // Other
  Reviewed: { color: 'secondary', label: 'Reviewed' },
};

export const REQUEST_STATUS_BADGE_MAP: Record<
  RequestStatus,
  { badge: RequestStatusBadge; labelKey: string }
> = {
  PENDING: { badge: 'Pending', labelKey: 'request.status.pending' },
  APPROVED: { badge: 'Approved', labelKey: 'request.status.approved' },
  REJECTED: { badge: 'Rejected', labelKey: 'request.status.rejected' },
  FULFILLED: { badge: 'Approved', labelKey: 'request.status.fulfilled' },
};

// Asset status badge mapping for StatusBadge component
export const ASSET_STATUS_BADGE_MAP: Record<
  AssetStatusType,
  { badge: AssetStatusBadge; labelKey?: string }
> = {
  NORMAL: { badge: 'NORMAL', labelKey: 'status.asset.normal' },
  LOW_STOCK: { badge: 'LOW_STOCK', labelKey: 'status.asset.lowStock' },
};
