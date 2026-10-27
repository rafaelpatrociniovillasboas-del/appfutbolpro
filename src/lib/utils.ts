import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Universal international WhatsApp phone number sanitizer.
 * Preserves country code (e.g. +506 for Costa Rica, +34 for Spain, +52 for Mexico, +54 for Argentina, etc.).
 * Does NOT force +55 or assume any specific country.
 */
export function sanitizeWhatsAppPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  // Remove all non-numeric characters (spaces, dashes, parentheses, plus signs)
  const digits = phone.replace(/\D/g, '');
  return digits;
}

export function compressImageDataUrl(dataUrl: string, maxWidth = 300, maxHeight = 300, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    // If it's already small (< 60KB base64), return as is
    if (dataUrl.length < 60000) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function compressImageFile(file: File, maxWidth = 300, maxHeight = 300, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error("Failed to read file"));
        return;
      }
      try {
        const compressed = await compressImageDataUrl(dataUrl, maxWidth, maxHeight, quality);
        resolve(compressed);
      } catch (err) {
        resolve(dataUrl);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
