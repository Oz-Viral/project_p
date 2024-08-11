import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import { ForgotReturn } from '@kursor/frontend/components/auth/forgot-return';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Kursor Forgot Password`,
  description: '',
};
export default async function Auth(params: { params: { token: string } }) {
  return <ForgotReturn token={params.params.token} />;
}
