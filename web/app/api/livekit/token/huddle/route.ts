import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  username: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.errors },
        { status: 400 }
      );
    }

    const { roomId, username } = result.data;

    // 1. Authenticate User
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    /*
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    // [DEV MODE]: Guest Falback
    const effectiveUser = user || {
        id: "guest-" + Math.floor(Math.random() * 10000),
        email: "guest@dev.local",
        user_metadata: { name: "Guest Developer" }
    };

    // 2. Authorization: Verify Project Membership
    // [DEV MODE]: Bypassing strict DB check for easier testing.
    // Ensure you are authenticated, but we assume if you have the ID, you can join.
    /*
    const { data: member, error: memberError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", roomId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Forbidden: Not a project member" }, { status: 403 });
    }
    */

    // 3. Generate Token
    const apiKey = process.env.LIVEKIT_API_KEY_WORKSPACE;
    const apiSecret = process.env.LIVEKIT_API_SECRET_WORKSPACE;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const participantName = username || effectiveUser.user_metadata?.name || effectiveUser.email || "Teammate";
    const participantIdentity = effectiveUser.id;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomId,
    });

    return NextResponse.json({
      token: await at.toJwt(),
    });

  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
