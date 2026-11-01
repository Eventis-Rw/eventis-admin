import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Eventis Admin", template: "%s · Eventis Admin" },
  description: "Eventis platform administration console",
  robots: { index: false, follow: false },
};

const themeScript = `(function(){try{var t=localStorage.getItem("eventis-admin-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
