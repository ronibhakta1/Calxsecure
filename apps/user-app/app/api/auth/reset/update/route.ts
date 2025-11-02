
import db from "@repo/db/client";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { userId, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return Response.json({ message: "Password too weak" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return Response.json({ message: "Password updated" });
  } catch (e) {
    console.error("Reset update error:", e);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}