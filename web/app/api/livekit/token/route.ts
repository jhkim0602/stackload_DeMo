import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room") || "quickstart-room";
  const username = req.nextUrl.searchParams.get("username") || "guest";

  if (!process.env.LIVEKIT_API_KEY_INTERVIEW || !process.env.LIVEKIT_API_SECRET_INTERVIEW) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY_INTERVIEW,
    process.env.LIVEKIT_API_SECRET_INTERVIEW,
    {
      identity: username,
    }
  );

  at.addGrant({ roomJoin: true, room: room });

  return NextResponse.json({ token: await at.toJwt() });
}
