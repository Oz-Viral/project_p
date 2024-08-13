'use client';

import { ReactNode, useCallback } from 'react';
import { FetchWrapperComponent } from '@kursor/helpers/utils/custom.fetch';
import { deleteDialog } from '@kursor/react/helpers/delete.dialog';
import { isGeneral } from '@kursor/react/helpers/is.general';
import useDictionary from '../../hooks/stores/useDictionary';

export default function LayoutContext(params: {
  dict: any;
  children: ReactNode;
}) {
  if (params?.children) {
    // eslint-disable-next-line react/no-children-prop
    return <LayoutContextInner dict={params.dict} children={params.children} />;
  }

  return <></>;
}
function LayoutContextInner(params: { dict: any; children: ReactNode }) {
  const { setDictionary } = useDictionary();

  setDictionary(params.dict);
  const afterRequest = useCallback(
    async (url: string, options: RequestInit, response: Response) => {
      if (response?.headers?.get('onboarding')) {
        window.location.href = isGeneral()
          ? '/launches?onboarding=true'
          : '/analytics?onboarding=true';
      }

      if (response?.headers?.get('reload')) {
        window.location.reload();
      }

      if (response.status === 401) {
        window.location.href = '/';
      }

      if (response.status === 402) {
        if (
          await deleteDialog(
            (await response.json()).message,
            'Move to billing',
            'Payment Required',
          )
        ) {
          window.open('/billing', '_blank');
        }
        return false;
      }

      return true;
    },
    [],
  );

  return (
    <FetchWrapperComponent
      baseUrl={process.env.NEXT_PUBLIC_BACKEND_URL!}
      afterRequest={afterRequest}
    >
      {params?.children || <></>}
    </FetchWrapperComponent>
  );
}
