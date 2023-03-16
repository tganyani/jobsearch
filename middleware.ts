import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/recruiter') && request.cookies.get('accountType')?.value==="candidate") {
    return NextResponse.rewrite(new URL('/', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/candidate') && request.cookies.get('accountType')?.value==="recruiter") {
    return NextResponse.rewrite(new URL('/', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/candidate') && !request.cookies.get('user')?.value) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/recruiter') && !request.cookies.get('user')?.value) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
}