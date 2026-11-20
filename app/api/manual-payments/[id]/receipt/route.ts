import { NextResponse, type NextRequest } from "next/server";

import { API_BASE_URL, USE_MOCK_DATA } from "@/lib/config";
import { isAdmin } from "@/lib/permissions";
import { getSession } from "@/lib/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Proxies the admin-authenticated receipt image from the API.
 *
 * The access token is an httpOnly cookie that never reaches the browser (the
 * API also has no CORS policy for it), so the client cannot attach an
 * Authorization header itself. This route does that server-side and streams
 * the bytes back same-origin; the client turns the response into a blob URL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || !isAdmin(session.user)) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await params;
  if (!UUID.test(id)) return new NextResponse(null, { status: 400 });
  if (USE_MOCK_DATA) return new NextResponse(null, { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/api/v1/uploads/${id}/file`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
}
