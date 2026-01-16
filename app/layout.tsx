import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/providers/Providers";

export const metadata: Metadata = {
  title: "AssetFlow - Asset Management System",
  description: "ระบบจัดการทรัพย์สินองค์กร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
