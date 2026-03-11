"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="min-h-[44px] min-w-[44px] px-3 text-sm font-medium text-slate-600 hover:text-slate-900 -my-2"
    >
      Sign out
    </button>
  );
}
