import { Messages } from '@kursor/frontend/components/messages/messages';

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { isGeneral } from '@kursor/react/helpers/is.general';

export const metadata: Metadata = {
  title: `Kursor Messages`,
  description: '',
};

export default async function Index() {
  return <Messages />;
}
