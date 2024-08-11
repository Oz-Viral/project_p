import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import { BillingComponent } from '@kursor/frontend/components/billing/billing.component';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Kursor Billing`,
  description: '',
};

export default async function Page() {
  return <BillingComponent />;
}
