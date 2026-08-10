'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('18684593792');
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
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      {/* 极简品牌背景 */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #2563EB 0, transparent 40%), radial-gradient(circle at 80% 70%, #6D4EFF 0, transparent 40%)',
        }}
      />
      <div className="relative w-[360px]">
        {/* 品牌 */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-accent-glow"
            style={{ background: 'linear-gradient(135deg, #5B8CFF 0%, #6D4EFF 100%)' }}
          >
            <span className="text-white font-display text-[16px]">h</span>
          </div>
          <span className="font-display text-ink text-[20px]">hgbord</span>
        </div>

        <div className="bg-surface-card border border-hairline rounded-xl p-6 shadow-lift">
          <h1 className="font-display text-ink text-[20px] mb-1" style={{ letterSpacing: '-0.5px' }}>
            欢迎回来
          </h1>
          <p className="text-[12px] text-muted mb-5">登录到管理后台</p>

          <form onSubmit={onSubmit} className="space-y-3.5">
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-[12px] text-danger bg-danger-soft/60 border border-danger/20 rounded-md px-2.5 py-1.5">
                {error}
              </div>
            )}

            <Button type="submit" variant="accent" className="w-full h-9" disabled={loading}>
              {loading ? '登录中…' : '登录'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-soft mt-5">
          hgbord 管理控制台 · v0.1
        </p>
      </div>
    </div>
  );
}
