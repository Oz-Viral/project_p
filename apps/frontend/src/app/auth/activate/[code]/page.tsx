import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { AfterActivate } from '@kursor/frontend/components/auth/after.activate';

export const metadata: Metadata = {
  title: `Kursor - Activate your account`,
  description: '',
};

export default async function Auth() {
  return <AfterActivate />;
}
