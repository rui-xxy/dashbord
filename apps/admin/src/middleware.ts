import { NextResponse, type NextRequest } from 'next/server';

/**
 * 边缘路由守卫
 *
 * 注意：middleware 在 Edge runtime 运行，无法访问 localStorage。
 * 真正的鉴权在 AuthProvider（客户端）和后端守卫里完成。
 * 这里只做基本路径卫生：访问根路径时让客户端决定跳转。
 *
 * 因为 token 在 localStorage，无法在 middleware 读取。
 * 所以登录态守卫放在 (admin)/layout.tsx 的 useEffect 里。
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
