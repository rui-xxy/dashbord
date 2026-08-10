'use client';
import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserVo } from '@hgbord/shared';
import { api, ApiError } from '@/lib/api';
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

export function EditUserDialog({ user, children }: { user: UserVo; children: ReactNode }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [error, setError] = useState<string | null>(null);

  const phoneValid = /^1[3-9]\d{9}$/.test(phone);

  const mut = useMutation({
    mutationFn: () => api.users.update(user.id, { name, phone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setOpen(false);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : '保存失败'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑资料</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-1.5">
            <Label htmlFor="eu-name">姓名</Label>
            <Input id="eu-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eu-phone">手机号</Label>
            <Input
              id="eu-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              inputMode="numeric"
            />
            {phone.length > 0 && !phoneValid && (
              <div className="text-[11px] text-muted-soft">请输入正确的 11 位手机号</div>
            )}
          </div>
          {error && (
            <div className="text-[12px] text-danger bg-danger-soft/60 border border-danger/20 rounded-md px-2.5 py-1.5">{error}</div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">取消</Button>
          </DialogClose>
          <Button variant="accent" disabled={!phoneValid || mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? '保存中…' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
