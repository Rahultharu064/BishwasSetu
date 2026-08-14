// Matches Nepali mobile numbers (98XXXXXXXX / 97XXXXXXXX / 96XXXXXXXX),
// optionally +977-prefixed, with optional spaces/dashes/dots between digit
// groups — the "share a number and take it off-platform" pattern the
// PHONE_IN_CHAT leakage signal is meant to catch (PRD §5).
const PHONE_PATTERN = /(?:\+?977[-.\s]?)?9[6-9](?:[-.\s]?\d){8}/;

export function findPhoneNumber(text: string): string | null {
  const match = text.match(PHONE_PATTERN);
  return match ? match[0] : null;
}
