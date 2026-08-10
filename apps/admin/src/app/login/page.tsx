'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(phone, password);
      router.push('/users');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft px-4">
      <div className="relative w-[380px]">
        {/* 品牌 —— 近黑方块 + Cal Sans 字标 */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
            <span className="text-white font-display text-[16px]">h</span>
          </div>
          <span className="font-display text-ink text-[20px]">hgbord</span>
        </div>

        {/* 登录卡 —— 白底 / hairline / 12px 圆角 / 轻投影 */}
        <div className="bg-surface-panel border border-hairline rounded-lg p-8 shadow-lift">
          <h1 className="font-display text-ink text-[22px] mb-1" style={{ letterSpacing: '-0.3px' }}>
            欢迎回来
          </h1>
          <p className="text-[13px] text-muted mb-6">登录到管理后台</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="11 位手机号"
                maxLength={11}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">密码</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="text-[13px] text-danger bg-danger-soft/60 border border-danger/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中…' : '登录'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[12px] text-muted-soft mt-6">
          hgbord 管理控制台 · v0.1
        </p>
      </div>
    </div>
  );
}
