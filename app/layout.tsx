import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/providers/Providers";
import RouteGuard from "@/src/components/layout/RouteGuard";

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
          <RouteGuard>
            {children}
          </RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
