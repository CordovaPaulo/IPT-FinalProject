// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'MindMates - Peer Tutoring Platform',
  description: 'Connect with peer tutors at your institution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body className="bg-white">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}