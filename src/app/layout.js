import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "Zuno",
  description: "Collage market place for students to buy and sell items",
};

export default function RootLayout({ children }) {
  return (
    
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
