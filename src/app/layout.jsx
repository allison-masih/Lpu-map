import './globals.css';
import './App.css';

export const metadata = {
  title: 'Which Block Is 34? | LPU Campus Guide',
  description: 'Find your way around the LPU campus with a verified campus guide.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
