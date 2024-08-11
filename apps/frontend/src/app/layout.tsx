import interClass from '@kursor/react/helpers/inter.font';

export const dynamic = 'force-dynamic';
import './global.css';
import 'react-tooltip/dist/react-tooltip.css';
import '@copilotkit/react-ui/styles.css';

import LayoutContext from '@kursor/frontend/components/layout/layout.context';
import { ReactNode } from 'react';
import { Chakra_Petch } from 'next/font/google';
import { isGeneral } from '@kursor/react/helpers/is.general';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from 'next-themes';

const chakra = Chakra_Petch({ weight: '400', subsets: ['latin'] });

export default async function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning className={interClass}>
      <head>
        <link
          rel="icon"
          href={!isGeneral() ? '/favicon.png' : '/postiz-fav.png'}
          sizes="any"
        />
      </head>
      <body className={chakra.className}>
        {/* <ThemeProvider> */}
        <PlausibleProvider domain="kursor.com">
          <LayoutContext>{children}</LayoutContext>
        </PlausibleProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
