'use client';
import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROLE_ASSIGNABLE_BY, ROLE_LABELS, Role, type UserVo } from '@hgbord/shared';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RoleDialog({ user, children }: { user: UserVo; children: ReactNode }) {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>(user.role);
  const [error, setError] = useState<string | null>(null);

  const assignable = me ? (Object.keys(ROLE_LABELS) as Role[]).filter((r) => ROLE_ASSIGNABLE_BY[r].includes(me.role)) : [];

  const mut = useMutation({
    mutationFn: () => api.users.updateRole(user.id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setOpen(false);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : '修改失败'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改角色</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="text-[12px] text-muted mb-2">
            将 <span className="font-semibold text-ink">{user.name}</span> 的角色从{' '}
            <span className="font-semibold text-ink">{ROLE_LABELS[user.role as Role]}</span> 修改为：
          </div>
          <div className="space-y-1.5">
            <Label>新角色</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignable.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="text-[12px] text-danger bg-danger-soft/60 border border-danger/20 rounded-md px-2.5 py-1.5">{error}</div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">取消</Button>
          </DialogClose>
          <Button disabled={role === user.role || mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? '保存中…' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
