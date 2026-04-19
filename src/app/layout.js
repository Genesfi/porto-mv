import "./globals.css";

export const metadata = {
  title: "Migi Gustian | Motion Designer",
  description: "Portfolio of Migi Gustian - Motion Graphics & MV Editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}