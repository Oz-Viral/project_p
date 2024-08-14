import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import { Register } from '@kursor/frontend/components/auth/register';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Kursor 회원가입`,
  description: '',
};

export default async function Auth() {
  return <Register />;
}
