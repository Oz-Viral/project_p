export const dynamic = 'force-dynamic';
import './global.css';
import 'react-tooltip/dist/react-tooltip.css';
import '@copilotkit/react-ui/styles.css';

import LayoutContext from '@kursor/frontend/components/layout/layout.context';
import { ReactNode } from 'react';
import { isGeneral } from '@kursor/react/helpers/is.general';
import PlausibleProvider from 'next-plausible';
import { getDictionary } from '../utils/dictionaries';
import localFont from 'next/font/local';
import { ThemeProvider } from '@kursor/react/provider/theme-provider';

const pretendard = localFont({
  src: '../static/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export default async function AppLayout({ children }: { children: ReactNode }) {
  const lang = 'ko';
  const dictionary = await getDictionary(lang);

  return (
    <html suppressHydrationWarning className={pretendard.variable}>
      <head>
        <link
          rel="icon"
          href={!isGeneral() ? '/favicon.png' : '/postiz-fav.png'}
          sizes="any"
        />
      </head>
      <body className={pretendard.className}>
        <ThemeProvider
          attribute="class"
          // defaultTheme="system"
          // enableSystem
          disableTransitionOnChange
        >
          <PlausibleProvider domain="kursor.com">
            <LayoutContext dict={dictionary}>{children}</LayoutContext>
          </PlausibleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
