'use client';

import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import { Button } from '@kursor/react/components/ui/button';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kursor/react/components/ui/dialog';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback } from 'react';
import useSWR from 'swr';

export const AddProviderButton = () => {
  const t = useTranslations('launches');

  const fetch = useFetch();

  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);

  const { isLoading, data } = useSWR('/integrations', load);

  const getSocialLink = useCallback(
    (identifier: string) => async () => {
      const { url } = await (
        await fetch('/integrations/social/' + identifier)
      ).json();
      window.location.href = url;
    },
    [],
  );

  if (isLoading) return <></>;

  const { social }: { social: { identifier: string; name: string }[] } = data;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t('addChannel')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addChannel')}</DialogTitle>
          <DialogDescription> </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 justify-center justify-items-center gap-[10px]">
          {social.map((item) => (
            <div
              key={item.identifier}
              onClick={getSocialLink(item.identifier)}
              className={
                'flex h-[100px] w-[120px] cursor-pointer flex-col items-center justify-center gap-[10px] rounded-lg bg-zinc-200 hover:bg-zinc-300'
              }
            >
              <div>
                {item.identifier === 'youtube' ? (
                  <Image
                    alt="Youtube"
                    src={`/icons/platforms/youtube.svg`}
                    width={45}
                    height={32}
                  />
                ) : (
                  <Image
                    width={32}
                    height={32}
                    alt={item.identifier}
                    className="h-[32px] w-[32px] rounded-full"
                    src={`/icons/platforms/${item.identifier}.png`}
                  />
                )}
              </div>
              <div className="text-sm">{item.name}</div>
            </div>
          ))}
        </div>
        {/* <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};
