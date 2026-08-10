'use client';
import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROLE_ASSIGNABLE_BY, ROLE_LABELS, Role } from '@hgbord/shared';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CreateUserDialog({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('STAFF');
  const [error, setError] = useState<string | null>(null);

  // 当前角色可分配的角色列表
  const assignable = user
    ? (Object.keys(ROLE_LABELS) as Role[]).filter((r) => ROLE_ASSIGNABLE_BY[r].includes(user.role))
    : [];

  const mut = useMutation({
    mutationFn: () => api.users.create({ phone, name, password, role: role as Role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setOpen(false);
      reset();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : '创建失败'),
  });

  function reset() {
    setPhone('');
    setName('');
    setPassword('');
    setRole('STAFF');
    setError(null);
  }

  // 手机号实时校验
  const phoneValid = /^1[3-9]\d{9}$/.test(phone);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建用户</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-1.5">
            <Label htmlFor="cu-phone">手机号</Label>
            <Input
              id="cu-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="11 位手机号"
              inputMode="numeric"
              autoComplete="off"
            />
            {phone.length > 0 && !phoneValid && (
              <div className="text-[11px] text-muted-soft">请输入正确的 11 位手机号</div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cu-name">姓名</Label>
            <Input id="cu-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="如：张三" autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cu-pw">初始密码</Label>
            <PasswordInput
              id="cu-pw"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label>角色</Label>
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
          <Button
            disabled={!phoneValid || !name || password.length < 6 || mut.isPending}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? '创建中…' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
