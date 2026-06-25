import type { Metadata } from "next";

import "./globals.css";
import { StoreProvider } from "@/store/Provider";

export const metadata: Metadata = {
  title: "Postman",
  description: "An API client platform",
  icons: {
    icon: "/postman.png",
    shortcut: "/postman.png",
    apple: "/postman.png",
  },
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
