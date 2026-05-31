import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Secure Election System",
  description: "Homomorphic Encryption Voting System using Threshold Paillier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <nav className="glass-panel m-4 p-4 flex justify-between items-center z-50 relative">
          <div className="text-xl font-bold gradient-text">SecureVote</div>
          <div className="flex gap-4">
            <a href="/setup" className="text-sm hover:text-primary transition-colors">Setup</a>
            <a href="/vote" className="text-sm hover:text-primary transition-colors">Vote</a>
            <a href="/tally-server" className="text-sm hover:text-primary transition-colors">Tally Server</a>
            <a href="/admin" className="text-sm hover:text-primary transition-colors">Admin Tally</a>
            <a href="/simulate" className="text-sm hover:text-primary transition-colors">Simulation</a>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
