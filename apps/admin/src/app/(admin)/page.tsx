import Link from 'next/link';
import { Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-display text-ink mb-1" style={{ fontSize: 24, letterSpacing: '-0.6px' }}>
        仪表盘
      </h1>
      <p className="text-[13px] text-muted mb-7">欢迎使用 hgbord 管理后台</p>

      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/users"
          className="bg-surface-card border border-hairline rounded-xl p-5 hover:shadow-lift transition-all duration-200 ease-out-expo group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-faint flex items-center justify-center">
              <Users className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-ink">用户管理</div>
              <div className="text-[12px] text-muted mt-0.5">管理账号、角色与权限</div>
            </div>
          </div>
        </Link>

        <div className="bg-surface-card border border-hairline rounded-xl p-5 opacity-70">
          <div className="text-[14px] font-semibold text-ink">表单管理</div>
          <div className="text-[12px] text-muted mt-0.5">即将上线</div>
        </div>
      </div>
    </div>
  );
}
