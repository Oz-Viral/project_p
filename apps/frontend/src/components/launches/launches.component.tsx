'use client';

import { AddProviderButton } from '@kursor/frontend/components/launches/add.provider.component';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { orderBy } from 'lodash';
import { Calendar } from '@kursor/frontend/components/launches/calendar';
import { CalendarWeekProvider } from '@kursor/frontend/components/launches/calendar.context';
import { Filters } from '@kursor/frontend/components/launches/filters';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { LoadingComponent } from '@kursor/frontend/components/layout/loading';
import clsx from 'clsx';
import { useUser } from '../layout/user.context';
import { Menu } from '@kursor/frontend/components/launches/menu/menu';
import { GeneratorComponent } from '@kursor/frontend/components/launches/generator/generator';
import { useRouter, useSearchParams } from 'next/navigation';
import { Integration } from '@prisma/client';
import ImageWithFallback from '@kursor/react/helpers/image.with.fallback';
import { useToaster } from '@kursor/react/toaster/toaster';
import { useFireEvents } from '@kursor/helpers/utils/use.fire.events';

export const LaunchesComponent = () => {
  const fetch = useFetch();
  const router = useRouter();
  const search = useSearchParams();
  const toast = useToaster();
  const fireEvents = useFireEvents();

  const [reload, setReload] = useState(false);
  const load = useCallback(async (path: string) => {
    return (await (await fetch(path)).json()).integrations;
  }, []);
  const user = useUser();

  const {
    isLoading,
    data: integrations,
    mutate,
  } = useSWR('/integrations/list', load, {
    fallbackData: [],
  });

  const totalNonDisabledChannels = useMemo(() => {
    return (
      integrations?.filter((integration: any) => !integration.disabled)
        ?.length || 0
    );
  }, [integrations]);

  const sortedIntegrations = useMemo(() => {
    return orderBy(
      integrations,
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc'],
    );
  }, [integrations]);

  const update = useCallback(async (shouldReload: boolean) => {
    if (shouldReload) {
      setReload(true);
    }
    await mutate();

    if (shouldReload) {
      setReload(false);
    }
  }, []);

  const continueIntegration = useCallback(
    (integration: any) => async () => {
      router.push(
        `/launches?added=${integration.identifier}&continue=${integration.id}`,
      );
    },
    [],
  );

  const refreshChannel = useCallback(
    (integration: Integration & { identifier: string }) => async () => {
      const { url } = await (
        await fetch(
          `/integrations/social/${integration.identifier}?refresh=${integration.internalId}`,
          {
            method: 'GET',
          },
        )
      ).json();

      window.location.href = url;
    },
    [],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (search.get('scope') === 'missing') {
      toast.show('You have to approve all the channel permissions', 'warning');
    }
    if (search.get('added')) {
      fireEvents('channel_added');
    }
    if (window.opener) {
      window.close();
    }
  }, []);

  if (isLoading || reload) {
    return <LoadingComponent />;
  }

  // @ts-ignore
  return (
    <CalendarWeekProvider integrations={sortedIntegrations}>
      <div className="flex flex-1 flex-col">
        <div className="relative flex flex-1">
          <div className="scrollbar scrollbar-thumb-tableBorder scrollbar-track-secondary absolute grid h-full w-full grid-cols-[220px_minmax(0,1fr)] gap-[30px] overflow-hidden overflow-y-scroll">
            <div className="flex min-h-[100%] w-[220px] flex-col gap-[24px] p-[16px]">
              <h2 className="text-[20px]">Channels</h2>
              <div className="flex flex-col gap-[16px]">
                {sortedIntegrations.length === 0 && (
                  <div className="text-[12px]">No channels</div>
                )}
                {sortedIntegrations.map((integration) => (
                  <div
                    {...(integration.refreshNeeded && {
                      'data-tooltip-id': 'tooltip',
                      'data-tooltip-content':
                        'Channel disconnected, click to reconnect.',
                    })}
                    key={integration.id}
                    className="flex items-center gap-[8px]"
                  >
                    <div
                      className={clsx(
                        'bg-fifth relative flex h-[34px] w-[34px] items-center justify-center rounded-full',
                        integration.disabled && 'opacity-50',
                      )}
                    >
                      {(integration.inBetweenSteps ||
                        integration.refreshNeeded) && (
                        <div
                          className="absolute left-0 top-0 h-[46px] w-[39px] cursor-pointer"
                          onClick={
                            integration.refreshNeeded
                              ? refreshChannel(integration)
                              : continueIntegration(integration)
                          }
                        >
                          <div className="absolute -left-[5px] -top-[5px] z-[200] flex h-[15px] w-[15px] items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                            !
                          </div>
                          <div className="absolute left-0 top-0 z-[199] h-[46px] w-[39px] rounded-full bg-transparent dark:bg-black/60" />
                        </div>
                      )}
                      <ImageWithFallback
                        fallbackSrc={`/icons/platforms/${integration.identifier}.png`}
                        src={integration.picture}
                        className="rounded-full"
                        alt={integration.identifier}
                        width={32}
                        height={32}
                      />
                      {integration.identifier === 'youtube' ? (
                        <img
                          src="/icons/platforms/youtube.svg"
                          className="absolute -bottom-[5px] -right-[5px] z-10"
                          width={20}
                        />
                      ) : (
                        <Image
                          src={`/icons/platforms/${integration.identifier}.png`}
                          className="border-fifth absolute -bottom-[5px] -right-[5px] z-10 rounded-full border"
                          alt={integration.identifier}
                          width={20}
                          height={20}
                        />
                      )}
                    </div>
                    <div
                      {...(integration.disabled &&
                      totalNonDisabledChannels === user?.totalChannels
                        ? {
                            'data-tooltip-id': 'tooltip',
                            'data-tooltip-content':
                              'This channel is disabled, please upgrade your plan to enable it.',
                          }
                        : {})}
                      className={clsx(
                        'flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
                        integration.disabled && 'opacity-50',
                      )}
                    >
                      {integration.name}
                    </div>
                    <Menu
                      onChange={update}
                      id={integration.id}
                      canEnable={
                        user?.totalChannels! > totalNonDisabledChannels &&
                        integration.disabled
                      }
                      canDisable={!integration.disabled}
                    />
                  </div>
                ))}
              </div>
              <AddProviderButton update={() => update(true)} />
              {/*{sortedIntegrations?.length > 0 && user?.tier?.ai && <GeneratorComponent />}*/}
            </div>
            <div className="flex flex-1 flex-col gap-[14px]">
              <Filters />
              <Calendar />
            </div>
          </div>
        </div>
      </div>
    </CalendarWeekProvider>
  );
};
