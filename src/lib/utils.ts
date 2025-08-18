import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UUID cookie management
export function generateUUID(): string {
  return crypto.randomUUID();
}

export function getUUIDFromCookie(): string | null {
  try {
    const cookie = document.cookie.split('; ').find((row) => row.startsWith('chat_uuid='));
    return cookie?.split('=')[1] || null;
  } catch {
    return null;
  }
}

export function setUUIDCookie(uuid: string): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + (12 * 60 * 60 * 1000)); // 12 hours
  document.cookie = `chat_uuid=${uuid}; path=/; expires=${expires.toUTCString()}`;
}

export function getOrCreateUUID(): string {
  let uuid = getUUIDFromCookie();
  if (!uuid) {
    uuid = generateUUID();
    setUUIDCookie(uuid);
  }
  return uuid;
}

export function clearChatUUID(): string {
  const newUUID = generateUUID();
  setUUIDCookie(newUUID);
  return newUUID;
} 