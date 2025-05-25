
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { EmailSignInGate } from '@/components/email-sign-in-gate'; // Added import

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
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <EmailSignInGate> {/* Wrapped children */}
          {children}
        </EmailSignInGate>
        <Toaster />
      </body>
    </html>
  );
}
