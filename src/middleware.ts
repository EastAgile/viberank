import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
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
    return NextResponse.next();
  }

  return new NextResponse("Invalid credentials", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
