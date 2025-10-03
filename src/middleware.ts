import { NextRequest, NextResponse } from "next/server";

function httpsEnforcement(request: NextRequest): NextResponse | null {
  const protocol = request.headers.get("x-forwarded-proto");
  if (protocol === "http" && process.env.NODE_ENV === "production") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
  return null;
}

function basicAuth(request: NextRequest): NextResponse | null {
  const excludedPaths = ["/api/submit"];

  const pathname = request.nextUrl.pathname;
  const isStaticFile = /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname);

  if (excludedPaths.includes(pathname) || isStaticFile) {
    return null;
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  const base64Credentials = authHeader.split(" ")[1];
  if (!base64Credentials) {
    return new NextResponse("Invalid authentication", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [username, password] = credentials.split(":");

  const validUsername = process.env.BASIC_AUTH_USERNAME;
  const validPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!validUsername || !validPassword) {
    console.error(
      "BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD must be set in environment variables"
    );
    return new NextResponse("Server configuration error", {
      status: 500,
    });
  }

  if (username === validUsername && password === validPassword) {
    return null;
  }

  return new NextResponse("Invalid credentials", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export function middleware(request: NextRequest) {
  const httpsResponse = httpsEnforcement(request);
  if (httpsResponse) return httpsResponse;

  const authResponse = basicAuth(request);
  if (authResponse) return authResponse;

  return NextResponse.next();
}

// Apply to all routes except Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};
