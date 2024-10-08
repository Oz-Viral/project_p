import { useIntegration } from '@kursor/frontend/components/launches/helpers/use.integration';
import { useCallback } from 'react';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';

export const useCustomProviderFunction = () => {
  const { integration } = useIntegration();
  const fetch = useFetch();
  const get = useCallback(
    async (funcName: string, customData?: any) => {
      const load = await fetch('/integrations/function', {
        method: 'POST',
        body: JSON.stringify({
          name: funcName,
          id: integration?.id!,
          data: customData,
        }),
      });

      if (load.status !== 200 && load.status !== 201) {
        throw new Error('Failed to fetch');
      }

      return load.json();
    },
    [integration]
  );

  return { get };
};
