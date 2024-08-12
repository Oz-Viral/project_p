import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { orderBy } from 'lodash';
import { useUser } from '@kursor/frontend/components/layout/user.context';
import clsx from 'clsx';
import Image from 'next/image';
import { Menu } from '@kursor/frontend/components/launches/menu/menu';
import { ApiModal } from '@kursor/frontend/components/launches/add.provider.component';
import { useRouter } from 'next/navigation';
import { isGeneral } from '@kursor/react/helpers/is.general';

export const ConnectChannels: FC = () => {
  const fetch = useFetch();
  const router = useRouter();
  const [identifier, setIdentifier] = useState<any>(undefined);
  const [popup, setPopups] = useState<undefined | string[]>(undefined);

  const getIntegrations = useCallback(async () => {
    return (await fetch('/integrations')).json();
  }, []);

  const [reload, setReload] = useState(false);

  const getSocialLink = useCallback(
    (identifier: string) => async () => {
      const { url } = await (
        await fetch('/integrations/social/' + identifier)
      ).json();

      window.open(url, 'Social Connect', 'width=700,height=700');
    },
    [],
  );

  const load = useCallback(async (path: string) => {
    const list = (await (await fetch(path)).json()).integrations;
    setPopups(list.map((p: any) => p.id));
    return list;
  }, []);

  const { data: integrations, mutate } = useSWR('/integrations/list', load, {
    fallbackData: [],
  });

  const user = useUser();

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

  useEffect(() => {
    if (sortedIntegrations.length === 0 || !popup) {
      return;
    }

    const betweenSteps = sortedIntegrations.find((p) => p.inBetweenSteps);
    if (betweenSteps && popup.indexOf(betweenSteps.id) === -1) {
      const url = new URL(window.location.href);
      url.searchParams.append('added', betweenSteps.identifier);
      url.searchParams.append('continue', betweenSteps.id);
      router.push(url.toString());
      setPopups([...popup, betweenSteps.id]);
    }
  }, [sortedIntegrations, popup]);

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
      const url = new URL(window.location.href);
      url.searchParams.append('added', integration.identifier);
      url.searchParams.append('continue', integration.id);
      router.push(url.toString());
    },
    [],
  );

  const finishUpdate = useCallback(() => {
    setIdentifier(undefined);
    update(true);
  }, []);

  const { data } = useSWR('get-all-integrations', getIntegrations);

  return (
    <>
      {!!identifier && (
        <div className="absolute left-0 top-0 z-[200] flex h-full w-full items-center justify-center bg-black/80 p-[30px]">
          <div className="w-[400px]">
            <ApiModal
              close={() => setIdentifier(undefined)}
              update={finishUpdate}
              identifier={identifier.identifier}
              name={identifier.name}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex flex-col gap-[4px]">
          <div className="text-[20px]">Connect Channels</div>
          <div className="text-[14px] text-[#AAA]">
            Connect your social media and publishing websites channels to
            schedule posts later
          </div>
        </div>
        <div className="mt-[16px] flex rounded-[4px] border border-[#182034]">
          <div className="flex flex-1 flex-col gap-[10px] p-[16px]">
            <div className="text-[18px]">Social</div>
            <div className="grid grid-cols-3 gap-[16px]">
              {data?.social.map((social: any) => (
                <div
                  key={social.identifier}
                  onClick={getSocialLink(social.identifier)}
                  className="bg-input flex h-[96px] cursor-pointer flex-col items-center justify-center gap-[10px]"
                >
                  <div>
                    <Image
                      alt={social.identifier}
                      src={`/icons/platforms/${social.identifier}.png`}
                      className="h-[32px] w-[32px] rounded-full"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-[1.2px] text-[#64748B]">
                    {social.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!isGeneral() && (
            <div className="flex flex-1 flex-col gap-[10px] p-[16px]">
              <div className="text-[18px]">Publishing Platforms</div>
              <div className="grid grid-cols-3 gap-[16px]">
                {data?.article.map((article: any) => (
                  <div
                    onClick={() => setIdentifier(article)}
                    key={article.identifier}
                    className="bg-input flex h-[96px] cursor-pointer flex-col items-center justify-center gap-[10px]"
                  >
                    <div>
                      <img
                        src={`/icons/platforms/${article.identifier}.png`}
                        className="h-[32px] w-[32px] rounded-full"
                      />
                    </div>
                    <div className="text-[10px] uppercase tracking-[1.2px] text-[#64748B]">
                      {article.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="my-[24px] rounded-[4px] border border-[#182034] p-[16px]">
          <div className="flex flex-col gap-[16px]">
            {sortedIntegrations.length === 0 && (
              <div className="text-[12px]">No channels</div>
            )}
            {sortedIntegrations.map((integration) => (
              <div key={integration.id} className="flex items-center gap-[8px]">
                <div
                  className={clsx(
                    'bg-fifth relative flex h-[34px] w-[34px] items-center justify-center rounded-full',
                    integration.disabled && 'opacity-50',
                  )}
                >
                  {integration.inBetweenSteps && (
                    <div
                      className="absolute left-0 top-0 h-[46px] w-[39px] cursor-pointer"
                      onClick={continueIntegration(integration)}
                    >
                      <div className="absolute -left-[5px] -top-[5px] z-[200] flex h-[15px] w-[15px] items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        !
                      </div>
                      <div className="absolute left-0 top-0 z-[199] h-[46px] w-[39px] rounded-full !bg-transparent dark:bg-black/60" />
                    </div>
                  )}
                  <Image
                    src={integration.picture}
                    className="rounded-full"
                    alt={integration.identifier}
                    width={32}
                    height={32}
                  />
                  <Image
                    src={`/icons/platforms/${integration.identifier}.png`}
                    className="border-fifth absolute -bottom-[5px] -right-[5px] z-10 rounded-full border"
                    alt={integration.identifier}
                    width={20}
                    height={20}
                  />
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
                    'flex-1',
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
        </div>
      </div>
    </>
  );
};
