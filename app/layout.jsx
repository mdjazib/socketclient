import { Toaster } from "sonner";
import "./globals.sass"

export const metadata = {
  title: "Socket.io",
  description: "Learning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
