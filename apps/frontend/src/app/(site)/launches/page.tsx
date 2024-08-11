import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import {LaunchesComponent} from "@kursor/frontend/components/launches/launches.component";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: `${isGeneral() ? 'Kursor Calendar' : 'Kursor Launches'}`,
  description: '',
}

export default async function Index() {
  return (
      <LaunchesComponent />
  );
}
