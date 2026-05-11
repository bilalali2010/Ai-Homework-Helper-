import "./globals.css";
import React from "react";

export const metadata = {
  title: "AI Homework Helper",
  description: "AI SaaS Homework Solver"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
