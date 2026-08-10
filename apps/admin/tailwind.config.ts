import type { Config } from 'tailwindcss';

/**
 * hgbord admin —— design tokens
 * 与 prototype/dashboard.html + docs/design-admin.md 完全对齐
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FCFCFD',
        ink: '#0A0A0B',
        'ink-soft': '#27272A',
        body: '#3F3F46',
        muted: '#71717A',
        'muted-soft': '#A1A1AA',
        'muted-faint': '#D4D4D8',
        hairline: '#E4E4E7',
        'hairline-soft': '#F4F4F5',
        'surface-soft': '#FAFAFA',
        'surface-panel': '#F4F4F5',
        'surface-hover': '#E4E4E7',
        'surface-active': '#D4D4D8',
        'surface-inset': '#F4F4F5',
        'surface-card': '#FFFFFF',
        'sidebar': '#F8F8FA',
        'sidebar-hover': '#EDEDF0',
        accent: '#2563EB',
        'accent-hover': '#1D4ED8',
        'accent-soft': '#DBEAFE',
        'accent-faint': '#EFF4FF',
        success: '#059669', 'success-soft': '#D1FAE5',
        warning: '#D97706', 'warning-soft': '#FEF3C7',
        danger: '#DC2626', 'danger-soft': '#FEE2E2',
        'viz-1': '#1E3A8A', 'viz-2': '#2563EB', 'viz-3': '#60A5FA',
        'viz-4': '#93C5FD', 'viz-5': '#DBEAFE',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'sans-serif'], // Cal Sans fallback → Inter 600 -0.04em
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        micro: ['10px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      borderRadius: { xs: '4px', sm: '6px', md: '8px', lg: '10px', xl: '12px', '2xl': '14px' },
      boxShadow: {
        lift: '0 1px 2px rgba(0,0,0,0.04)',
        raised: '0 4px 12px rgba(0,0,0,0.08)',
        overlay: '0 20px 50px -10px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.1)',
        'accent-glow': '0 0 8px rgba(37, 99, 235, 0.45)',
      },
      transitionTimingFunction: { 'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)' },
      transitionDuration: { '120': '120ms', '200': '200ms', '320': '320ms' },
    },
  },
  plugins: [],
};
export default config;
