'use client';
import { ROLE_LABELS, UserStatus, USER_STATUS_LABELS, type Role } from '@hgbord/shared';
import { Badge } from './badge';
import { cn } from '@/lib/cn';

/** 角色徽章 —— DESIGN.md badge-pill：超管用墨色实心，其余用 pastel 色组区分层级 */
export function RoleBadge({ role }: { role: Role }) {
  const variant =
    role === 'SUPER_ADMIN'
      ? 'ink'
      : role === 'ADMIN'
        ? 'violet'
        : role === 'MANAGER'
          ? 'orange'
          : 'neutral';
  return <Badge variant={variant}>{ROLE_LABELS[role]}</Badge>;
}

/** 状态点 + 胶囊徽章 */
export function StatusBadge({ status }: { status: UserStatus }) {
  const map = {
    [UserStatus.ACTIVE]: { dot: 'bg-success', text: 'text-success', soft: 'bg-success-soft' },
    [UserStatus.DISABLED]: { dot: 'bg-danger', text: 'text-danger', soft: 'bg-danger-soft' },
  }[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-caption px-2.5 py-0.5 rounded-full', map.soft, map.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', map.dot)} />
      {USER_STATUS_LABELS[status]}
    </span>
  );
}
