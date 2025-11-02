
import { getAuth } from "firebase-admin/auth";
import { initializeApp } from "firebase-admin/app";
import db from "@repo/db/client";

// Extend globalThis to include firebaseAdminApp
declare global {
  // eslint-disable-next-line no-var
  var firebaseAdminApp: ReturnType<typeof initializeApp> | undefined;
}

// Initialize Firebase Admin once
let adminApp;
if (!global.firebaseAdminApp) {
  adminApp = initializeApp();
  global.firebaseAdminApp = adminApp;
} else {
  adminApp = global.firebaseAdminApp;
}
const adminAuth = getAuth(adminApp);

export async function POST(req: Request) {
  try {
    const { idToken, phone } = await req.json();

    if (process.env.NODE_ENV === "development" && idToken === "mock-token") {
      const user = await db.user.findUnique({
        where: { number: phone.replace("+91", "") },
      });
      if (!user) return Response.json({ error: "User not found" }, { status: 404 });
      return Response.json({ userId: user.id });
    }

    // Verify Firebase token
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (decoded.phone_number !== phone) {
      return Response.json({ error: "Phone mismatch" }, { status: 400 });
    }

    // Find user by phone
    const user = await db.user.findUnique({
      where: { number: phone.replace("+91", "") },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ userId: user.id });
  } catch (e: any) {
    console.error("Firebase verify error:", e);
    return Response.json({ error: "Invalid token" }, { status: 400 });
  }
}