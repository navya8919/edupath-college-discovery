import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CompareProvider } from '@/context/CompareContext';
import Navbar from '@/components/Navbar';
import CompareBar from '@/components/CompareBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'EduPath — Discover Your Perfect College',
  description: 'Search, compare and discover top colleges across India. Make informed decisions with real data on fees, placements, courses, and more.',
  keywords: 'colleges india, college search, compare colleges, jee colleges, engineering colleges',
  openGraph: {
    title: 'EduPath — College Discovery Platform',
    description: 'Find and compare top colleges across India',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <CompareProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <CompareBar />
          </CompareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
