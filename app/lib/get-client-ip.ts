/**
 * Vercel (and most reverse proxies) set x-forwarded-for to a comma-separated
 * list, client IP first. Falls back to a fixed key so local dev without a
 * proxy still rate-limits sanely (as a single bucket) rather than throwing.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
