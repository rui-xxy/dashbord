'use client';
import { ROLE_LABELS, UserStatus, USER_STATUS_LABELS, type Role } from '@hgbord/shared';
import { Badge } from './badge';
import { cn } from '@/lib/cn';

/** 角色徽章 —— 颜色按层级区分 */
export function RoleBadge({ role }: { role: Role }) {
  const variant =
    role === 'SUPER_ADMIN'
      ? 'accent'
      : role === 'ADMIN'
        ? 'neutral'
        : role === 'MANAGER'
          ? 'neutral'
          : 'neutral';
  return <Badge variant={variant}>{ROLE_LABELS[role]}</Badge>;
}

/** 状态点 + 徽章 */
export function StatusBadge({ status }: { status: UserStatus }) {
  const map = {
    [UserStatus.ACTIVE]: { color: 'bg-success', ring: 'shadow-[0_0_0_3px_#D1FAE5]', text: 'text-success', soft: 'bg-success-soft' },
    [UserStatus.DISABLED]: { color: 'bg-danger', ring: 'shadow-[0_0_0_3px_#FEE2E2]', text: 'text-danger', soft: 'bg-danger-soft' },
  }[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded-xs', map.soft, map.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', map.color, map.ring)} />
      {USER_STATUS_LABELS[status]}
    </span>
  );
}
