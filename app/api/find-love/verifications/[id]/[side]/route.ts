import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/config";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; side: string }> },
) {
  const session = await getSession();
  if (!session || !isAdmin(session.user))
    return new NextResponse(null, { status: 401 });
  const { id, side } = await params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    ) ||
    !["front", "back"].includes(side)
  )
    return new NextResponse(null, { status: 400 });
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/findlove/admin/age-verifications/${id}/documents/${side}`,
      {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok)
      return new NextResponse(null, { status: response.status });
    return new NextResponse(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
