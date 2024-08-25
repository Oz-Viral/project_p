'use client';

import useSWR from 'swr';
import { useCallback, useMemo, useState } from 'react';
import { capitalize, orderBy } from 'lodash';
import clsx from 'clsx';
import ImageWithFallback from '@kursor/react/helpers/image.with.fallback';
import Image from 'next/image';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import { RenderAnalytics } from '@kursor/frontend/components/platform-analytics/render.analytics';
import { Button } from '@kursor/react/form/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kursor/react/components/ui/select';
import { useRouter } from 'next/navigation';
import { useToaster } from '@kursor/react/toaster/toaster';
import { useTranslations } from 'next-intl';

const allowedIntegrations = [
  'facebook',
  'instagram',
  'linkedin-page',
  // 'tiktok',
  'youtube',
  'pinterest',
  'threads',
];

export const PlatformAnalytics = () => {
  const fetch = useFetch();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [key, setKey] = useState(7);
  const [refresh, setRefresh] = useState(false);
  const toaster = useToaster();

  const t = useTranslations();

  const load = useCallback(async () => {
    const int = (await (await fetch('/integrations/list')).json()).integrations;
    return int.filter((f: any) => allowedIntegrations.includes(f.identifier));
  }, []);

  const { data, isLoading } = useSWR('analytics-list', load, {
    fallbackData: [],
  });

  const sortedIntegrations = useMemo(() => {
    return orderBy(
      data,
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc'],
    );
  }, [data]);

  const currentIntegration = useMemo(() => {
    return sortedIntegrations[current];
  }, [current, sortedIntegrations]);

  const options = useMemo(() => {
    if (!currentIntegration) {
      return [];
    }
    const arr = [];
    if (
      [
        'facebook',
        'instagram',
        'linkedin-page',
        'pinterest',
        'youtube',
        'threads',
      ].indexOf(currentIntegration.identifier) !== -1
    ) {
      arr.push({
        key: 7,
        value: t('filters.day', { day: 7 }),
      });
    }

    if (
      [
        'facebook',
        'instagram',
        'linkedin-page',
        'pinterest',
        'youtube',
        'threads',
      ].indexOf(currentIntegration.identifier) !== -1
    ) {
      arr.push({
        key: 30,
        value: t('filters.day', { day: 30 }),
      });
    }

    if (
      ['facebook', 'linkedin-page', 'pinterest', 'youtube'].indexOf(
        currentIntegration.identifier,
      ) !== -1
    ) {
      arr.push({
        key: 90,
        value: t('filters.day', { day: 90 }),
      });
    }

    return arr;
  }, [currentIntegration]);

  const keys = useMemo(() => {
    if (!currentIntegration) {
      return 7;
    }
    if (options.find((p) => p.key === key)) {
      return key;
    }

    return options[0]?.key;
  }, [key, currentIntegration]);

  if (isLoading) {
    return null;
  }

  if (!sortedIntegrations.length && !isLoading) {
    return (
      <div className="mt-[100px] flex flex-col items-center gap-[27px] text-center">
        <div>
          <img src="/peoplemarketplace.svg" />
        </div>
        <div className="text-[48px]">
          {t('analytics.cantShowAnalytics')}
          <br />
          {t('analytics.addSocialMediaNotification')}
        </div>
        <div className="text-[20px]">
          {t('analytics.supported')}:{' '}
          {allowedIntegrations.map((p) => capitalize(p)).join(', ')}
        </div>
        <Button onClick={() => router.push('/launches')}>
          {t('analytics.goToCalendar')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-[30px]">
      <div className="flex w-[220px] overflow-hidden p-[16px]">
        <div className="flex flex-col gap-[16px] overflow-hidden">
          <div className="mb-[8px] text-[20px]">{t('analytics.channels')}</div>
          {sortedIntegrations.map((integration, index) => (
            <div
              key={integration.id}
              onClick={() => {
                if (integration.refreshNeeded) {
                  toaster.show(t('analytics.refreshNeeded'), 'warning');
                  return;
                }
                setRefresh(true);
                setTimeout(() => {
                  setRefresh(false);
                }, 10);
                setCurrent(index);
              }}
              className={clsx(
                'flex items-center gap-[8px]',
                currentIntegration.id !== integration.id &&
                  'cursor-pointer opacity-20 hover:opacity-100',
              )}
            >
              <div
                className={clsx(
                  'relative flex h-[34px] w-[34px] items-center justify-center rounded-full',
                  integration.disabled && 'opacity-50',
                )}
              >
                {(integration.inBetweenSteps || integration.refreshNeeded) && (
                  <div className="absolute left-0 top-0 h-[46px] w-[39px] cursor-pointer">
                    <div className="absolute -top-[5px] left-0 z-[200] flex h-[15px] w-[15px] items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      !
                    </div>
                    <div className="absolute left-0 top-0 z-[199] h-[46px] w-[39px] rounded-full !bg-transparent dark:bg-black/60" />
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
                <Image
                  src={`/icons/platforms/${integration.identifier}.png`}
                  className="border-fifth absolute -bottom-[5px] -right-[5px] z-10 rounded-full border"
                  alt={integration.identifier}
                  width={20}
                  height={20}
                />
              </div>
              <div
                className={clsx(
                  'flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
                  integration.disabled && 'opacity-50',
                )}
              >
                {integration.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      {!!options.length && (
        <div className="flex flex-1 flex-col gap-[14px]">
          <div className="max-w-[200px]">
            {/* <Select
              className="!border-0 bg-[#0A0B14]"
              label=""
              name="date"
              disableForm={true}
              hideErrors={true}
              onChange={(e) => setKey(+e.target.value)}
            >
              {options.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.value}
                </option>
              ))}
            </Select> */}
            <Select
              defaultValue={`${keys}`}
              onValueChange={(duration) => {
                setKey(+duration);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('analytics.selectDuration')} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.key} value={`${option.key}`}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            {!!keys && !!currentIntegration && !refresh && (
              <RenderAnalytics integration={currentIntegration} date={keys} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
