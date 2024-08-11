import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import { AnalyticsComponent } from '@kursor/frontend/components/analytics/analytics.component';
import { Metadata } from 'next';
import { PlatformAnalytics } from '@kursor/frontend/components/platform-analytics/platform.analytics';

export const metadata: Metadata = {
  title: `Kursor Analytics`,
  description: '',
};

export default async function Index() {
  return (
    <>
      {isGeneral() ? <PlatformAnalytics /> : <AnalyticsComponent />}
    </>
  );
}
