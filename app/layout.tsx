import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "TD Studios VIP" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
