import { FileText } from 'lucide-react';

export default function FormsPage() {
  return (
    <div>
      <h1 className="font-display text-ink text-[28px] leading-[1.2] mb-1.5" style={{ letterSpacing: '-0.5px' }}>
        表单管理
      </h1>
      <p className="text-[14px] text-muted mb-8">创建和管理业务表单</p>

      {/* 空状态 —— feature-card 浅灰卡片 */}
      <div className="bg-surface-card rounded-lg py-24 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-md bg-canvas border border-hairline flex items-center justify-center mb-4">
          <FileText className="w-5 h-5 text-muted-soft" />
        </div>
        <h2 className="font-display text-ink text-[22px] mb-1.5" style={{ letterSpacing: '-0.3px' }}>
          即将上线
        </h2>
        <p className="text-[14px] text-muted">表单管理功能正在开发中，敬请期待。</p>
      </div>
    </div>
  );
}
