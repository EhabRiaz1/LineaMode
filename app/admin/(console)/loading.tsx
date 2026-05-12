import { SpinnerOverlay } from "@/components/admin/Spinner";

/**
 * Next 16 uses `loading.tsx` as the Suspense fallback wrapping the
 * sibling `page.tsx` of every nested admin route. Swap the silent blank
 * frame for a small swirling spinner so navigations always feel alive.
 */
export default function ConsoleLoading() {
  return <SpinnerOverlay label="Loading" />;
}
