import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
    console.log("Webhook payload:", evt.data);

    // const rawBody = await req.text();
    //   const signature = req.headers.get("clerk-signature");

    // You can verify the signature here (optional but recommended)
    // const event = JSON.parse(rawBody);
    if (eventType === "user.created") {
      try {
        const user = evt.data;

        await db.user.create({
          data: {
            clerkId: user.id,
            email: user.email_addresses[0]?.email_address || "",
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            image: user.image_url,
          },
        });

        return NextResponse.json({ success: true });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }
    if (eventType === "user.deleted") {
      try {
        await db.user.delete({
          where: { clerkId: evt.data.id },
        });
        return NextResponse.json({ success: true });
      } catch (error) {
        console.log("Error deleting user:", error);
        return new Response("Error deleting user", { status: 500 });
      }
    }
    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await db.user.update({
          where: {
            clerkId: id,
          },
          data: {
            clerkId: id,
            email,
            name,
            image: image_url,
          },
        });
        return NextResponse.json({ success: true });
      } catch (error) {
        console.log("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }
  } catch (error) {
    console.error("Webhook handling error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
