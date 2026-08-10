'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Plus } from 'lucide-react';
import type { Role, UserStatus, UserVo } from '@hgbord/shared';
import { Permission } from '@hgbord/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RoleBadge, StatusBadge } from '@/components/ui/status';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateUserDialog } from './components/create-user-dialog';
import { EditUserDialog } from './components/edit-user-dialog';
import { RoleDialog } from './components/role-dialog';
import { cn } from '@/lib/cn';

export default function UsersPage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter, statusFilter],
    queryFn: () =>
      api.users.list({
        page,
        pageSize: 20,
        ...(search ? { search } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  // 删除
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.users.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  // 状态切换
  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.users.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const users = data?.items ?? [];

  return (
    <div>
      {/* 标题 + 操作 */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-ink" style={{ fontSize: 24, letterSpacing: '-0.6px' }}>
            用户管理
          </h1>
          <p className="text-[13px] text-muted mt-1">
            {data ? <span className="tnum">共 {data.total} 位用户</span> : '加载中…'}
          </p>
        </div>
        {can(Permission.USER_CREATE) && (
          <CreateUserDialog>
            <Button variant="accent">
              <Plus className="w-3.5 h-3.5" />
              新建用户
            </Button>
          </CreateUserDialog>
        )}
      </div>

      {/* 表格卡 */}
      <div className="bg-surface-card border border-hairline rounded-xl overflow-hidden">
        {/* 工具栏 */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-hairline-soft">
          <div className="relative w-56">
            <Input
              placeholder="搜索姓名或手机号…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 bg-surface-soft border-transparent"
            />
            <svg className="w-3.5 h-3.5 text-muted-soft absolute left-2.5 top-1/2 -translate-y-1/2" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
          </div>
          <FilterSelect
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="全部角色"
            options={[
              { value: 'SUPER_ADMIN', label: '超级管理员' },
              { value: 'ADMIN', label: '管理员' },
              { value: 'MANAGER', label: '经理' },
              { value: 'STAFF', label: '员工' },
            ]}
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="全部状态"
            options={[
              { value: 'ACTIVE', label: '正常' },
              { value: 'DISABLED', label: '已停用' },
            ]}
          />
          {(search || roleFilter || statusFilter) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                setStatusFilter('');
                setPage(1);
              }}
              className="text-[12px]"
            >
              清除筛选
            </Button>
          )}
        </div>

        {/* 表格 */}
        <table className="w-full">
          <thead>
            <tr className="bg-surface-inset h-9 text-micro text-muted">
              <th className="text-left font-semibold px-5">用户</th>
              <th className="text-left font-semibold px-3">手机号</th>
              <th className="text-left font-semibold px-3">角色</th>
              <th className="text-left font-semibold px-3">状态</th>
              <th className="text-right font-semibold px-3">注册时间</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-10">
                  加载中…
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-10">
                  暂无用户
                </td>
              </tr>
            )}
            {users.map((u: UserVo) => (
              <UserRow key={u.id} user={u} onDelete={(id) => deleteMut.mutate(id)} onToggleStatus={(id, status) => statusMut.mutate({ id, status })} />
            ))}
          </tbody>
        </table>

        {/* 分页 */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-hairline-soft text-[12px]">
            <span className="text-muted tnum">
              第 <span className="text-ink font-medium">{page}</span> / {data.totalPages} 页 · 共 {data.total} 条
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                ←
              </Button>
              <Button variant="outline" size="icon-sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  onDelete,
  onToggleStatus,
}: {
  user: UserVo;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
}) {
  const { can, user: me } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canEdit = can(Permission.USER_UPDATE);
  const canChangeRole = can(Permission.USER_UPDATE_ROLE);
  const canChangeStatus = can(Permission.USER_UPDATE_STATUS);
  const canDelete = can(Permission.USER_DELETE);
  const isSelf = me?.id === user.id;

  return (
    <tr className="row-wash border-t border-hairline-soft h-11">
      <td className="px-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
            style={{ background: gradientFor(user.id) }}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-semibold text-ink">{user.name}</span>
        </div>
      </td>
      <td className="px-3 text-muted tnum">{user.phone}</td>
      <td className="px-3">
        <RoleBadge role={user.role as Role} />
      </td>
      <td className="px-3">
        <StatusBadge status={user.status as UserStatus} />
      </td>
      <td className="px-3 text-right tnum text-muted text-[12px]">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</td>
      <td className="px-3">
        {(canEdit || canChangeRole || canChangeStatus || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-7 h-7 flex items-center justify-center text-muted-soft hover:text-ink hover:bg-surface-soft rounded-md transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <EditUserDialog user={user}>
                  <button className="flex h-8 w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 text-[13px] text-ink data-[highlighted]:bg-surface-soft">
                    编辑资料
                  </button>
                </EditUserDialog>
              )}
              {canChangeRole && !isSelf && (
                <RoleDialog user={user}>
                  <button className="flex h-8 w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 text-[13px] text-ink data-[highlighted]:bg-surface-soft">
                    修改角色
                  </button>
                </RoleDialog>
              )}
              {canChangeStatus && !isSelf && (
                <DropdownMenuItem
                  onClick={() => onToggleStatus(user.id, user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')}
                >
                  {user.status === 'ACTIVE' ? '停用账号' : '启用账号'}
                </DropdownMenuItem>
              )}
              {canDelete && !isSelf && (
                <>
                  <DropdownMenuSeparator />
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                      <button className="flex h-8 w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 text-[13px] text-danger data-[highlighted]:bg-surface-soft">
                        删除用户
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认删除</DialogTitle>
                        <DialogDescription>此操作不可撤销。</DialogDescription>
                      </DialogHeader>
                      <DialogBody>
                        <p className="text-[13px] text-body">
                          确定要删除用户 <span className="font-semibold text-ink">{user.name}</span>（{user.phone}）吗？该用户的所有数据将被永久移除。
                        </p>
                      </DialogBody>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="ghost">取消</Button>
                        </DialogClose>
                        <Button
                          variant="danger"
                          onClick={() => {
                            onDelete(user.id);
                            setDeleteOpen(false);
                          }}
                        >
                          确认删除
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  );
}

/** 小型筛选 select（简化实现） */
function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className={cn(
          'h-8 pl-2.5 pr-7 text-[12px] font-medium bg-surface-soft border border-transparent rounded-md cursor-pointer focus:outline-none focus:border-accent appearance-none',
          value ? 'text-ink' : 'text-muted',
        )}
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2371717A' d='M5 6.5L1.5 3h7z'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** 根据用户 id 生成稳定的渐变色（头像用） */
function gradientFor(seed: string): string {
  const grads = [
    'linear-gradient(135deg, #5B8CFF 0%, #6D4EFF 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)',
    'linear-gradient(135deg, #14B8A6 0%, #2563EB 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #1E3A8A 100%)',
    'linear-gradient(135deg, #F43F5E 0%, #8B5CF6 100%)',
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return grads[h % grads.length];
}
