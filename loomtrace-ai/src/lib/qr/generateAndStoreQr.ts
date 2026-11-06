import "server-only";
import QRCode from "qrcode";
import { adminStorage } from "@/lib/firebase/admin";
import { buildVerificationUrl } from "@/lib/qr/signing";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Generates a signed verification URL + QR PNG, uploads to Storage, and
 * returns public URLs to store on the DPI document. Shared by DPI
 * creation and any future "regenerate QR" admin action — one
 * implementation, not one per caller.
 */
export async function generateAndStoreQrForDpi(dpiId: string): Promise<{ qrCodeUrl: string; verificationUrl: string }> {
  const verificationUrl = buildVerificationUrl(dpiId, APP_BASE_URL);

  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  const bucket = adminStorage.bucket();
  const file = bucket.file(`qrcodes/${dpiId}.png`);
  await file.save(qrBuffer, { contentType: "image/png", public: true });

  // makePublic() + a stable public URL pattern, rather than a signed URL
  // with an expiry — QR codes get printed on physical products and need
  // to keep working indefinitely, unlike a typical time-limited download link.
  const qrCodeUrl = `https://storage.googleapis.com/${bucket.name}/qrcodes/${dpiId}.png`;

  return { qrCodeUrl, verificationUrl };
}
