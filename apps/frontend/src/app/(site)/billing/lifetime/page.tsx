import { LifetimeDeal } from '@kursor/frontend/components/billing/lifetime.deal';

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { isGeneral } from '@kursor/react/helpers/is.general';

export const metadata: Metadata = {
  title: `Kursor Lifetime deal`,
  description: '',
};

export default async function Page() {
  return <LifetimeDeal />;
}
