import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DBD Order Portal",
  description: "Internal purchase order intake form that emails Zoho Desk.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
