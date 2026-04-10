import type { Metadata } from "next";
import "./globals.css";
import { TransitionProvider } from "@/lib/transitions/TransitionContext";
import { GlobalNav }          from "@/components/ui/GlobalNav";

export const metadata: Metadata = {
  title: "DOMANI — The Great Architect of Tomorrow",
  description: "Design and technology studio. Precise. Inevitable. Earned.",
  keywords: ["design studio","technology","AI","brand identity","Africa"],
  openGraph: {
    title: "DOMANI",
    description: "The future belongs to organisations that behave like systems.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TransitionProvider>
          <GlobalNav light={true} />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}