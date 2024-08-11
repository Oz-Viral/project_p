'use client';

import { Slider } from '@kursor/react/form/slider';
import { Button } from '@kursor/react/form/button';
import { tagsList } from '@kursor/nestjs-libraries/database/prisma/marketplace/tags.list';
import { Options } from '@kursor/frontend/components/marketplace/buyer';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { Input } from '@kursor/react/form/input';
import { useDebouncedCallback } from 'use-debounce';
import { OrderList } from '@kursor/frontend/components/marketplace/order.list';
import { useModals } from '@mantine/modals';
import { Select } from '@kursor/react/form/select';
import { countries } from '@kursor/nestjs-libraries/services/stripe.country.list';

export const AddAccount: FC<{ openBankAccount: (country: string) => void }> = (
  props
) => {
  const { openBankAccount } = props;
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <div className="bg-sixth p-[32px] text-[20px] w-full max-w-[600px] mx-auto flex flex-col gap-[24px] rounded-[4px] border border-[#172034] relative">
      Please select your country where your business is.
      <br />
      <Select
        label="Country"
        name="country"
        disableForm={true}
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="">--SELECT COUNTRY--</option>
        {countries.map((country) => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
        ))}
      </Select>
      <Button
        className="w-full"
        disabled={!country}
        loading={loading}
        type="button"
        onClick={() => {
          openBankAccount(country);
          setLoading(true);
        }}
      >
        Connect Bank Account
      </Button>
    </div>
  );
};

export const Seller = () => {
  const fetch = useFetch();
  const [loading, setLoading] = useState<boolean>(true);
  const [keys, setKeys] = useState<
    Array<{ key: string; id: string; user: string }>
  >([]);
  const [connectedLoading, setConnectedLoading] = useState(false);
  const [state, setState] = useState(true);
  const [audience, setAudience] = useState<number>(0);
  const modals = useModals();

  const accountInformation = useCallback(async () => {
    const account = await (
      await fetch('/marketplace/account', {
        method: 'GET',
      })
    ).json();

    setState(account.marketplace);
    setAudience(account.audience);
    return account;
  }, []);

  const onChange = useCallback((key: string, state: boolean) => {
    fetch('/marketplace/item', {
      method: 'POST',
      body: JSON.stringify({
        key,
        state,
      }),
    });
  }, []);

  const connectBankAccountLink = useCallback(async (country: string) => {
    setConnectedLoading(true);
    const { url } = await (
      await fetch(`/marketplace/bank?country=${country}`, {
        method: 'GET',
      })
    ).json();

    window.location.href = url;
  }, []);

  const loadItems = useCallback(async () => {
    const data = await (
      await fetch('/marketplace/item', {
        method: 'GET',
      })
    ).json();

    setKeys(data);
    setLoading(false);
  }, []);

  const changeAudienceBackend = useDebouncedCallback(
    useCallback(async (aud: number) => {
      fetch('/marketplace/audience', {
        method: 'POST',
        body: JSON.stringify({
          audience: aud,
        }),
      });
    }, []),
    500
  );

  const changeAudience = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const num = String(+e.target.value.replace(/\D/g, '') || 0).slice(0, 8);
    setAudience(+num);
    changeAudienceBackend(+num);
  }, []);

  const changeMarketplace = useCallback(
    async (value: string) => {
      await fetch('/marketplace/active', {
        method: 'POST',
        body: JSON.stringify({
          active: value === 'on',
        }),
      });
      setState(!state);
    },
    [state]
  );

  const { data } = useSWR('/marketplace/account', accountInformation);

  const connectBankAccount = useCallback(async () => {
    if (!data?.connectedAccount) {
      modals.openModal({
        size: '100%',
        classNames: {
          modal: 'bg-transparent text-white',
        },
        withCloseButton: false,
        children: <AddAccount openBankAccount={connectBankAccountLink} />,
      });
      return;
    }

    connectBankAccountLink('');
  }, [data, connectBankAccountLink]);

  useEffect(() => {
    loadItems();
  }, []);

  if (loading) {
    return <></>;
  }

  return (
    <>
      <OrderList type="seller" />
      <div className="flex mt-[29px] w-full gap-[26px]">
        <div className="w-[328px] flex flex-col gap-[16px]">
          <h2 className="text-[20px]">Seller Mode</h2>
          <div className="flex p-[24px] bg-sixth rounded-[4px] border border-[#172034] flex-col items-center gap-[16px]">
            <div className="w-[64px] h-[64px] bg-[#D9D9D9] rounded-full">
              {!!data?.picture?.path && (
                <img
                  className="w-full h-full rounded-full"
                  src={data?.picture?.path || ''}
                  alt="avatar"
                />
              )}
            </div>
            <div className="text-[24px]">{data?.fullname || ''}</div>
            {data?.connectedAccount && (
              <div className="flex gap-[16px] items-center pb-[8px]">
                <Slider
                  fill={true}
                  value={state ? 'on' : 'off'}
                  onChange={changeMarketplace}
                />
                <div className="text-[18px]">Active</div>
              </div>
            )}
            <div className="border-t border-t-[#425379] w-full" />
            <div className="w-full">
              <Button
                className="w-full"
                onClick={connectBankAccount}
                loading={connectedLoading}
              >
                {!data?.connectedAccount
                  ? 'Connect Bank Account'
                  : 'Update Bank Account'}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex gap-[16px] flex-col">
          <h2 className="text-[20px]">Details</h2>
          <div className="bg-sixth rounded-[4px] border border-[#172034]">
            {tagsList.map((tag) => (
              <Options
                rows={3}
                key={tag.key}
                onChange={onChange}
                preSelected={keys.map((key) => key.key)}
                search={false}
                options={tag.options}
                title={tag.name}
              />
            ))}
            <div className="h-[56px] text-[20px] font-[600] flex items-center px-[24px] bg-[#0F1524]">
              Audience Size
            </div>
            <div className="bg-[#0b0f1c] flex px-[32px] py-[24px]">
              <div className="flex-1">
                <Input
                  label="Audience size on all platforms"
                  name="audience"
                  type="text"
                  pattern="\d*"
                  max={8}
                  disableForm={true}
                  value={audience}
                  onChange={changeAudience}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
