import './globals.css';
import type { ReactNode } from 'react';
export const metadata = { title: 'mangatracker', description: 'Phase 0 scaffold' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
