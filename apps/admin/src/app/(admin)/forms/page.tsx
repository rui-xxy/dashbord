import { FileText } from 'lucide-react';

export default function FormsPage() {
  return (
    <div>
      <h1 className="font-display text-ink mb-1" style={{ fontSize: 24, letterSpacing: '-0.6px' }}>
        表单管理
      </h1>
      <p className="text-[13px] text-muted mb-7">创建和管理业务表单</p>

      <div className="bg-surface-card border border-hairline rounded-xl py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-surface-panel flex items-center justify-center mb-4">
          <FileText className="w-5 h-5 text-muted-soft" />
        </div>
        <h2 className="font-display text-ink-soft text-[20px] mb-1" style={{ letterSpacing: '-0.4px' }}>
          即将上线
        </h2>
        <p className="text-[13px] text-muted">表单管理功能正在开发中，敬请期待。</p>
      </div>
    </div>
  );
}
