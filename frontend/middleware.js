// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Списък на защитени пътища
const protectedRoutes = ["/events/create", "/dashboard"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Само ако пътят е защитен
  if (protectedRoutes.includes(pathname)) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      // Пренасочи към login, ако няма токен
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname); // За redirect след login
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Провери валидността на токена (използвай същия SECRET като в backend)
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next(); // ОК
    } catch (err) {
      console.error("JWT error:", err);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next(); // Пусни всички останали маршрути
}

export const config = {
  matcher: ["/events/create", "/dashboard"],
};
