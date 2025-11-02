
import db from "@repo/db/client";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    // Find user
    const user = await db.user.findUnique({
      where: { number: phoneNumber },
    });

    if (!user) {
      return Response.json({ message: "If the number exists, an OTP was sent." });
    }

    // Generate OTP (fallback for mock)
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP (for mock fallback)
    await db.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetExpires: expires },
    });

    // === MOCK SMS (for local dev) ===
    if (process.env.NODE_ENV === "development") {
      console.log(`[MOCK SMS] OTP for ${phoneNumber}: ${otp}`);
      return Response.json({ message: "OTP sent (check console)" });
    }

    // === PRODUCTION: Firebase Phone Auth ===
    try {
      const recaptcha = new RecaptchaVerifier(auth, "recaptcha", { size: "invisible" });
      const confirmation = await signInWithPhoneNumber(auth, `+91${phoneNumber}`, recaptcha);
      (global as any).confirmationResult = confirmation; // Store for verification
    } catch (firebaseError) {
      console.error("Firebase OTP failed:", firebaseError);
      // Fallback to mock
      console.log(`[FALLBACK] OTP for ${phoneNumber}: ${otp}`);
    }

    return Response.json({ message: "OTP sent" });
  } catch (e) {
    console.error("Reset request error:", e);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}