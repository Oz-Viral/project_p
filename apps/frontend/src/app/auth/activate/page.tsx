import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import {Metadata} from "next";
import { Activate } from '@kursor/frontend/components/auth/activate';

export const metadata: Metadata = {
  title: `Kursor - Activate your account`,
  description: '',
};

export default async function Auth() {
    return (
        <Activate />
    );
}
