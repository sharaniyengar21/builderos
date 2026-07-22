import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/current-user";
import { logout } from "./login/actions";
import "./globals.css";

export const metadata = {
  title: "BuilderOS",
  description: "The operating system for open source builders.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        {user && (
          <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-3">
            <a href="/" className="text-sm font-semibold text-neutral-100">
              BuilderOS
            </a>
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <span>
                {user.email}
                {user.isDemo && <span className="ml-2 rounded bg-blue-950 px-2 py-0.5 text-xs text-blue-300">demo</span>}
              </span>
              <form action={logout}>
                <button type="submit" className="text-neutral-400 underline">
                  Log out
                </button>
              </form>
            </div>
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
