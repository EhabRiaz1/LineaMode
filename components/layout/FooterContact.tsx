"use client";

import { useCallback, useState } from "react";
import { ContactQuickModal } from "@/components/sections/ContactQuickModal";

const DEFAULT_EMAIL = "saif@lineamode.com";
const DEFAULT_PHONE = "+92 300 1234567";

const linkClass =
  "text-body text-stone/85 hover:text-stone transition-colors text-left";

export function FooterContact({
  email = DEFAULT_EMAIL,
  phone = DEFAULT_PHONE,
}: {
  email?: string;
  phone?: string;
} = {}) {
  const [activeModal, setActiveModal] = useState<"email" | "phone" | null>(null);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <>
      <div>
        <p className="text-eyebrow text-stone/60 mb-5">Contact</p>
        <ul className="space-y-3">
          <li>
            <button
              type="button"
              onClick={() => setActiveModal("email")}
              className={linkClass}
            >
              Email us
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setActiveModal("phone")}
              className={linkClass}
            >
              Contact us
            </button>
          </li>
        </ul>
      </div>

      <ContactQuickModal
        open={activeModal !== null}
        type={activeModal}
        email={email}
        phone={phone}
        onClose={closeModal}
      />
    </>
  );
}
