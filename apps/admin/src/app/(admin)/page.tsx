import Link from 'next/link';
import { ArrowRight, FileText, Users } from 'lucide-react';

/**
 * 仪表盘 —— DESIGN.md feature-card：浅灰卡片（surface-card #F5F5F5）/ 12px 圆角 / 32px 内边距
 */
export default function DashboardPage() {
  return (
    <div>
      {/* display-sm: Cal Sans 28px / 600 / -0.5px */}
      <h1 className="font-display text-ink text-[28px] leading-[1.2] mb-1.5" style={{ letterSpacing: '-0.5px' }}>
        仪表盘
      </h1>
      <p className="text-[14px] text-muted mb-8">欢迎使用 hgbord 管理后台</p>

      <div className="grid grid-cols-3 gap-6">
        {/* feature-card（可点击） */}
        <Link
          href="/users"
          className="bg-surface-card rounded-lg p-6 transition-shadow duration-200 ease-out-expo hover:shadow-raised group"
        >
          <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center mb-4">
            <Users className="w-[18px] h-[18px] text-ink" />
          </div>
          <div className="text-[16px] font-semibold text-ink">用户管理</div>
          <p className="text-[14px] text-muted mt-1 leading-relaxed">管理账号、角色与权限，控制后台访问范围。</p>
          <div className="flex items-center gap-1 text-[13px] font-medium text-ink mt-4">
            进入管理
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* feature-card（未上线） */}
        <div className="bg-surface-card rounded-lg p-6 opacity-60">
          <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center mb-4">
            <FileText className="w-[18px] h-[18px] text-ink" />
          </div>
          <div className="text-[16px] font-semibold text-ink">表单管理</div>
          <p className="text-[14px] text-muted mt-1 leading-relaxed">创建和管理业务表单。</p>
          <div className="text-[13px] font-medium text-muted-soft mt-4">即将上线</div>
        </div>
      </div>
    </div>
  );
}
