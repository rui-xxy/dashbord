import type { Config } from 'tailwindcss';

/**
 * hgbord admin —— design tokens
 * 与根目录 DESIGN.md（Cal.com 设计语言）完全对齐：
 * 白底画布 + 近黑主 CTA + 单色行动层 + 浅灰卡片 + Cal Sans(Inter 600 -0.04em) 展示字体
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Surface ─────────────────────────────
        canvas: '#FFFFFF', // {colors.canvas} 页面地板
        'surface-soft': '#F8F9FA', // nav-pill-group 背景 / 极软分区
        'surface-card': '#F5F5F5', // {colors.surface-card} 浅灰卡片
        'surface-strong': '#E5E7EB', // 禁用态 / 边框替代
        'surface-dark': '#101010', // 唯一的深色表面（footer / featured）
        'surface-dark-elevated': '#1A1A1A',
        'surface-panel': '#FFFFFF', // 白色内容卡（表格卡、对话框）
        'surface-hover': '#F3F4F6',
        'surface-inset': '#F8F9FA',
        sidebar: '#F8F9FA',
        'sidebar-hover': '#F3F4F6',

        // ── Text ────────────────────────────────
        ink: '#111111', // 标题 / 主文本 / 主 CTA
        'ink-soft': '#242424', // primary-active
        body: '#374151',
        muted: '#6B7280',
        'muted-soft': '#898989',
        'muted-faint': '#D4D4D8',

        // ── Line ────────────────────────────────
        hairline: '#E5E7EB',
        'hairline-soft': '#F3F4F6',

        // ── Brand accent（极少使用：行内链接 / 小徽章）──
        accent: '#3B82F6',
        'accent-hover': '#2563EB',
        'accent-soft': '#DBEAFE',
        'accent-faint': '#EFF6FF',

        // ── Semantic ────────────────────────────
        success: '#10B981', 'success-soft': '#D1FAE5',
        warning: '#F59E0B', 'warning-soft': '#FEF3C7',
        danger: '#EF4444', 'danger-soft': '#FEE2E2',

        // ── Badge pastels（标签 pill / 头像填充）──
        'badge-orange': '#FB923C',
        'badge-pink': '#EC4899',
        'badge-violet': '#8B5CF6',
        'badge-emerald': '#34D399',

        // ── Data viz ────────────────────────────
        'viz-1': '#111111', 'viz-2': '#4B5563', 'viz-3': '#9CA3AF',
        'viz-4': '#D1D5DB', 'viz-5': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"Cal Sans"', 'Inter', 'sans-serif'], // Cal Sans fallback → Inter 600 -0.04em
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        micro: ['10px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
        caption: ['13px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      // {rounded}: xs 4 / sm 6 / md 8（按钮·输入框）/ lg 12（内容卡）/ xl 16（hero 卡）
      borderRadius: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px' },
      boxShadow: {
        // DESIGN.md Elevation: 0 1px 2px / 0 4px 12px
        lift: '0 1px 2px rgba(0,0,0,0.05)',
        raised: '0 4px 12px rgba(0,0,0,0.08)',
        overlay: '0 20px 50px -10px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.1)',
      },
      transitionTimingFunction: { 'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)' },
      transitionDuration: { '120': '120ms', '200': '200ms', '320': '320ms' },
    },
  },
  plugins: [],
};
export default config;
