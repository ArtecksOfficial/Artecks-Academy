"use client";
// Imported once from the root layout. Its only job is to load native-fetch.ts
// on the client so the fetch patch is installed before any page code runs.
import "@/lib/native-fetch";

export default function NativeBridge() {
  return null;
}
