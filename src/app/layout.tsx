import type {Metadata} from 'next';
import { Geist_Sans } from 'next/font/google'; // Correct import for Geist Sans
import { Geist_Mono } from 'next/font/google'; // Correct import for Geist Mono
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist_Sans({ // Use Geist_Sans
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Study Buddy',
  description: 'Your personal AI-powered study assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
