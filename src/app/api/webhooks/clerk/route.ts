import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("clerk-signature");

  // You can verify the signature here (optional but recommended)
  const event = JSON.parse(rawBody);

  try {
    if (event.type === "user.created") {
      const user = event.data;

      await db.user.create({
        data: {
          clerkId: user.id,
          email: user.email_addresses[0]?.email_address || "",
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          image: user.imageUrl,
        },
      });
    }

    if (event.type === "user.deleted") {
      await db.user.delete({
        where: { id: event.data.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
