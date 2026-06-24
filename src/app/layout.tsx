import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowKit",
  description:
    "Power Automate フローをインポート可能な zip 形式で出力するツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
