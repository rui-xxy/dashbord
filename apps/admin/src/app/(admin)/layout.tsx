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
      { href: '/users', label: '用户管理', icon: <Users className="w-4 h-4" />, match: (p) => p.startsWith('/users') },
      { href: '/forms', label: '表单管理', icon: <FileText className="w-4 h-4" />, match: (p) => p.startsWith('/forms') },
      { href: '/', label: '仪表盘', icon: <LayoutDashboard className="w-4 h-4" />, match: (p) => p === '/' },
    ],
  },
];

const COLLAPSE_KEY = 'hgbord.sidebar.collapsed';

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
    setRailY(itemRect.top - listRect.top + (itemRect.height - 24) / 2);
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
          collapsed ? 'w-[60px]' : 'w-[208px]',
        )}
      >
        {/* 品牌 */}
        <div className={cn('h-14 flex items-center gap-2.5 border-b border-hairline', collapsed ? 'justify-center px-0' : 'px-4')}>
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shadow-accent-glow shrink-0"
            style={{ background: 'linear-gradient(135deg, #5B8CFF 0%, #6D4EFF 100%)' }}
          >
            <span className="text-white font-display text-[13px]">h</span>
          </div>
          {!collapsed && (
            <>
              <span className="font-display text-ink text-[15px] whitespace-nowrap">hgbord</span>
              <span className="ml-auto text-micro text-muted-soft">v0.1</span>
            </>
          )}
        </div>

        {/* 导航（活线在这里） */}
        <nav ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden py-3 relative">
          <div className="nav-rail" style={{ transform: `translateY(${railY}px)` }} />
          {NAV.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <div className="text-micro text-muted px-4 mt-3 mb-1.5 whitespace-nowrap">{group.section}</div>
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
                      'flex items-center h-8 rounded-sm text-[13px] transition-colors duration-120 ease-out-expo whitespace-nowrap',
                      collapsed ? 'justify-center w-9 mx-auto' : 'gap-2.5 px-3 mx-2',
                      isActive
                        ? 'text-ink font-semibold bg-accent-faint'
                        : 'text-body hover:text-ink hover:bg-sidebar-hover font-medium',
                    )}
                  >
                    <span className={cn(isActive && 'text-accent')}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 折叠开关 */}
        <div className={cn('px-2 pb-1', collapsed && 'flex justify-center px-0')}>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? '展开侧栏' : '收起侧栏'}
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-soft hover:text-ink hover:bg-sidebar-hover transition-colors duration-120 ease-out-expo"
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* 用户区 */}
        <div className="p-2 border-t border-hairline">
          <button
            onClick={() => logout().then(() => router.replace('/login'))}
            title={collapsed ? `${user.name} · 退出登录` : undefined}
            className={cn(
              'w-full flex items-center gap-2.5 rounded-sm hover:bg-sidebar-hover transition-colors duration-120 ease-out-expo cursor-pointer',
              collapsed ? 'justify-center p-1.5' : 'px-2 py-1.5',
            )}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
              style={{ background: 'linear-gradient(135deg, #5B8CFF 0%, #6D4EFF 100%)' }}
            >
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[12px] text-ink font-semibold truncate">{user.name}</div>
                  <div className="text-[11px] text-muted truncate tnum">{user.phone}</div>
                </div>
                <LogOut className="w-3.5 h-3.5 text-muted" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ───── Main ───── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶栏 */}
        <header className="h-14 bg-canvas border-b border-hairline flex items-center gap-3 px-6 shrink-0">
          <Breadcrumbs path={pathname} />
          <button className="ml-auto flex items-center gap-2 h-8 pl-3 pr-2 bg-surface-soft hover:bg-surface-panel border border-transparent hover:border-hairline rounded-md text-[12px] text-muted-soft transition-all duration-120 ease-out-expo">
            <Search className="w-3.5 h-3.5" />
            <span>搜索…</span>
            <kbd className="font-mono text-[10px] text-muted-faint bg-surface-card border border-hairline rounded-xs px-1.5 py-0.5">⌘K</kbd>
          </button>
        </header>

        {/* 工作区 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-8 py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Breadcrumbs({ path }: { path: string }) {
  const map: Record<string, string> = {
    '/users': '用户管理',
    '/forms': '表单管理',
    '/': '仪表盘',
  };
  const label = map[path] ?? '管理后台';
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-muted">管理后台</span>
      <span className="text-muted-faint">/</span>
      <span className="text-ink font-medium">{label}</span>
    </div>
  );
}
