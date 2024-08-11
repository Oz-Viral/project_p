import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import {Forgot} from "@kursor/frontend/components/auth/forgot";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: `Kursor Forgot Password`,
  description: '',
};

export default async function Auth() {
    return (
        <Forgot />
    );
}
