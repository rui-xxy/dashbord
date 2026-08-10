'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { FileText, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Search, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';

interface NavItemDef {
  href: string;
  label: string;
  icon: ReactNode;
  match?: (path: string) => boolean;
}

const NAV: { section: string; items: NavItemDef[] }[] = [
  {
    section: '业务',
    items: [
      { href: '/users', label: '用户管理', icon: <Users className="w-[18px] h-[18px]" />, match: (p) => p.startsWith('/users') },
      { href: '/forms', label: '表单管理', icon: <FileText className="w-[18px] h-[18px]" />, match: (p) => p.startsWith('/forms') },
      { href: '/', label: '仪表盘', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, match: (p) => p === '/' },
    ],
  },
];

const COLLAPSE_KEY = 'hgbord.sidebar.collapsed';

/** DESIGN.md — avatar-circle：pastel 填充 + 白色首字母（按 id 稳定取色） */
const PASTELS = ['#FB923C', '#EC4899', '#8B5CF6', '#34D399'];
function pastelFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PASTELS[h % PASTELS.length];
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const listRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [railY, setRailY] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  // 折叠状态持久化
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
  }, []);
  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      return !c;
    });
  }, []);

  // 未登录 → 跳登录页
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  // 活线位置：跟随当前激活项
  useLayoutEffect(() => {
    if (!activeRef.current || !listRef.current) return;
    const listRect = listRef.current.getBoundingClientRect();
    const itemRect = activeRef.current.getBoundingClientRect();
    setRailY(itemRect.top - listRect.top + (itemRect.height - 28) / 2);
  }, [pathname, user, collapsed]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center text-muted text-[13px]">加载中…</div>
    );
  }

  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ───── Sidebar ───── */}
      <aside
        className={cn(
          'shrink-0 bg-sidebar border-r border-hairline flex flex-col transition-[width] duration-200 ease-out-expo overflow-hidden',
          collapsed ? 'w-[68px]' : 'w-[236px]',
        )}
      >
        {/* 品牌 —— 近黑方块 + Cal Sans 字标 */}
        <div className={cn('h-16 flex items-center gap-2.5 border-b border-hairline', collapsed ? 'justify-center px-0' : 'px-5')}>
          <div className="w-7 h-7 rounded-md bg-ink flex items-center justify-center shrink-0">
            <span className="text-white font-display text-[15px]">h</span>
          </div>
          {!collapsed && (
            <>
              <span className="font-display text-ink text-[17px] whitespace-nowrap">hgbord</span>
              <span className="ml-auto text-micro text-muted-soft">v0.1</span>
            </>
          )}
        </div>

        {/* 导航（活线在这里）—— 激活态：浅灰胶囊 + 墨色文字 */}
        <nav ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden py-4 relative">
          <div className="nav-rail" style={{ transform: `translateY(${railY}px)` }} />
          {NAV.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <div className="text-[11px] font-semibold tracking-wider uppercase text-muted-soft px-5 mt-4 mb-2 whitespace-nowrap">{group.section}</div>
              )}
              {group.items.map((item) => {
                const isActive = item.match ? item.match(pathname) : pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={isActive ? activeRef : undefined}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center h-11 rounded-md text-[15px] transition-colors duration-120 ease-out-expo whitespace-nowrap',
                      collapsed ? 'justify-center w-11 mx-auto' : 'gap-3 px-4 mx-2',
                      isActive
                        ? 'text-ink font-semibold bg-surface-card'
                        : 'text-body hover:text-ink hover:bg-sidebar-hover font-medium',
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 折叠开关 */}
        <div className={cn('px-3 pb-2', collapsed && 'flex justify-center px-0')}>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? '展开侧栏' : '收起侧栏'}
            className="flex items-center justify-center w-9 h-9 rounded-md text-muted-soft hover:text-ink hover:bg-sidebar-hover transition-colors duration-120 ease-out-expo"
          >
            {collapsed ? <PanelLeftOpen className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          </button>
        </div>

        {/* 用户区 —— pastel 圆形头像 */}
        <div className="p-3 border-t border-hairline">
          <button
            onClick={() => logout().then(() => router.replace('/login'))}
            title={collapsed ? `${user.name} · 退出登录` : undefined}
            className={cn(
              'w-full flex items-center gap-3 rounded-md hover:bg-sidebar-hover transition-colors duration-120 ease-out-expo cursor-pointer',
              collapsed ? 'justify-center p-2' : 'px-2.5 py-2',
            )}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
              style={{ backgroundColor: pastelFor(user.id) }}
            >
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[14px] text-ink font-semibold truncate">{user.name}</div>
                  <div className="text-[12px] text-muted truncate tnum">{user.phone}</div>
                </div>
                <LogOut className="w-4 h-4 text-muted" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ───── Main ───── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶栏 */}
        <header className="h-16 bg-canvas border-b border-hairline flex items-center gap-3 px-8 shrink-0">
          <Breadcrumbs path={pathname} />
          <button className="ml-auto flex items-center gap-2 h-10 pl-4 pr-3 bg-surface-soft hover:bg-surface-card border border-transparent hover:border-hairline rounded-md text-[14px] text-muted-soft transition-all duration-120 ease-out-expo">
            <Search className="w-4 h-4" />
            <span>搜索…</span>
            <kbd className="font-mono text-[11px] text-muted-faint bg-canvas border border-hairline rounded-xs px-1.5 py-0.5">⌘K</kbd>
          </button>
        </header>

        {/* 工作区 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Breadcrumbs({ path }: { path: string }) {
  // /forms/:id → 表单管理 / 数据
  if (/^\/forms\/[^/]+$/.test(path)) {
    return (
      <div className="flex items-center gap-2 text-[14px]">
        <span className="text-muted">管理后台</span>
        <span className="text-muted-faint">/</span>
        <Link href="/forms" className="text-muted hover:text-ink transition-colors">表单管理</Link>
        <span className="text-muted-faint">/</span>
        <span className="text-ink font-medium">数据</span>
      </div>
    );
  }
  const map: Record<string, string> = {
    '/users': '用户管理',
    '/forms': '表单管理',
    '/': '仪表盘',
  };
  const label = map[path] ?? '管理后台';
  return (
    <div className="flex items-center gap-2 text-[14px]">
      <span className="text-muted">管理后台</span>
      <span className="text-muted-faint">/</span>
      <span className="text-ink font-medium">{label}</span>
    </div>
  );
}
