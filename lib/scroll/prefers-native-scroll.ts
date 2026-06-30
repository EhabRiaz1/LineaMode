/**
 * Lenis smooth scroll feels great on Chromium but fights WebKit momentum:
 * Safari desktop is capped at 60fps with quirky wheel handling, and iOS
 * syncTouch can jitter. Use native scroll on those engines instead.
 */
export function prefersNativeScroll(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;

  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const isSafariDesktop =
    /Safari/i.test(ua) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS|EdgiOS/i.test(ua);

  return isIOS || isSafariDesktop;
}
