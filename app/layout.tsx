import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ollama Bot – Talk to your character",
  description: "Voice chat with a character powered by Ollama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
