import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import {Login} from "@kursor/frontend/components/auth/login";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: `Kursor Login`,
  description: '',
};

export default async function Auth() {
    return (
        <Login />
    );
}
