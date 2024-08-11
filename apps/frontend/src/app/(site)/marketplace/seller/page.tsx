import { Seller } from '@kursor/frontend/components/marketplace/seller';

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
  return <Seller />;
}
