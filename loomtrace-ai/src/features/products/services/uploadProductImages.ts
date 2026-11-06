"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

/**
 * Uploads to uploadQueue/{userId}/{fileName} — the path storage.rules
 * already permits for exactly this case (staging uploads before a
 * product/DPI ID exists yet). Returns public download URLs to attach to
 * the product-create payload.
 */
export async function uploadProductImages(userId: string, files: File[]): Promise<string[]> {
  const uploads = files.map(async (file) => {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const fileRef = ref(storage, `uploadQueue/${userId}/${safeName}`);
    await uploadBytes(fileRef, file, { contentType: file.type });
    return getDownloadURL(fileRef);
  });
  return Promise.all(uploads);
}
