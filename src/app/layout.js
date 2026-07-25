import "./globals.css";
import SecurityShield from "@/components/SecurityShield";

export const metadata = {
  title: "Migi Gustian | Motion Designer",
  description: "Portfolio of Migi Gustian - Motion Graphics & MV Editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <SecurityShield />
        {children}
      </body>
    </html>
  );
}