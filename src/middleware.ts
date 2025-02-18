import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 检查是否是 API 路由
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // 允许 API 请求直接通过
    return NextResponse.next();
  }

  // 如果已经在认证页面，直接通过
  if (request.nextUrl.pathname === '/auth') {
    return NextResponse.next();
  }

  const hasValidPassword = request.cookies.has('auth_pass') && 
    request.cookies.get('auth_pass')?.value === process.env.NEXT_PUBLIC_AUTH_PASSWORD;

  // 如果没有认证，重定向到认证页面
  if (!hasValidPassword) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

// 配置需要进行认证检查的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api 路由 (/api/*)
     * - 静态文件 (/_next/static/*, /favicon.ico, 等)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 