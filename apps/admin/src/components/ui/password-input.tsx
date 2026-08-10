'use client';
import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * 密码输入框 —— 在 Input 基础上增加「眼睛」显隐切换。
 *
 * 实现细节：始终用 type="text" + -webkit-text-security 做掩码，而非 type="password"。
 * 这样可避免新版 Chromium 对 type=password 自动注入的原生显隐按钮（无法用 CSS 关闭），
 * 显隐完全交由组件右侧的眼睛图标控制。
 * - 默认隐藏：应用 text-security: disc（显示为圆点）
 * - 点击眼睛：移除 text-security，明文显示
 */
export function PasswordInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative w-full">
      <input
        type="text"
        style={visible ? undefined : { WebkitTextSecurity: 'disc' }}
        className={cn(
          'bloom h-10 w-full px-3.5 pr-10 text-[14px] text-ink bg-canvas border border-hairline rounded-md',
          'placeholder:text-muted-soft transition-all duration-120 ease-out-expo',
          'disabled:bg-surface-soft disabled:text-muted',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? '隐藏密码' : '显示密码'}
        tabIndex={-1}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-muted-soft hover:text-ink transition-colors"
      >
        {visible ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
      </button>
    </div>
  );
}
