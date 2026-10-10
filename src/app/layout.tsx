import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
export const metadata: Metadata = { title: 'SlideRecall AI — Learn it for life', description: 'Turn your lecture slides into active recall practice, powered by AI.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
