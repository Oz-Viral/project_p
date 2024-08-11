import { Buyer } from '@kursor/frontend/components/marketplace/buyer';

export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { isGeneral } from '@kursor/react/helpers/is.general';

export const metadata: Metadata = {
  title: `Kursor Marketplace`,
  description: '',
};
export default async function Index({
  searchParams,
}: {
  searchParams: { code: string };
}) {
  return <Buyer />;
}
