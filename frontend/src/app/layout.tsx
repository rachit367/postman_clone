import type { Metadata } from "next";

import "./globals.css";
import { StoreProvider } from "@/store/Provider";

export const metadata: Metadata = {
  title: "Postman Clone",
  description: "An API client platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
