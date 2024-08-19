import useSWR from 'swr';
import { Select } from '@kursor/react/form/select';
import { pricing } from '@kursor/nestjs-libraries/database/prisma/subscriptions/pricing';
import { deleteDialog } from '@kursor/react/helpers/delete.dialog';
import { Input } from '@kursor/react/form/input';
import { ChangeEventHandler, useCallback, useMemo, useState } from 'react';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import { useUser } from '@kursor/frontend/components/layout/user.context';

export const Subscription = () => {
  const fetch = useFetch();
  const addSubscription: ChangeEventHandler<HTMLSelectElement> = useCallback(
    async (e) => {
      const value = e.target.value;
      if (
        await deleteDialog(
          'Are you sure you want to add a user subscription?',
          'Add',
        )
      ) {
        await fetch('/billing/add-subscription', {
          method: 'POST',
          body: JSON.stringify({ subscription: value }),
        });

        window.location.reload();
      }
    },
    [],
  );

  return (
    <Select
      onChange={addSubscription}
      hideErrors={true}
      disableForm={true}
      name="sub"
      label=""
      value=""
      className="text-black"
    >
      <option>-- ADD FREE SUBSCRIPTION --</option>
      {Object.keys(pricing)
        .filter((f) => !f.includes('FREE'))
        .map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
    </Select>
  );
};
export const Impersonate = () => {
  const fetch = useFetch();
  const [name, setName] = useState('');
  const user = useUser();

  const load = useCallback(async () => {
    if (!name) {
      return [];
    }

    const value = await (await fetch(`/user/impersonate?name=${name}`)).json();
    return value;
  }, [name]);

  const stopImpersonating = useCallback(async () => {
    await fetch(`/user/impersonate`, {
      method: 'POST',
      body: JSON.stringify({ id: '' }),
    });

    window.location.reload();
  }, []);

  const setUser = useCallback(
    (userId: string) => async () => {
      await fetch(`/user/impersonate`, {
        method: 'POST',
        body: JSON.stringify({ id: userId }),
      });

      window.location.reload();
    },
    [],
  );

  const { data } = useSWR(`/impersonate-${name}`, load, {
    refreshWhenHidden: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
    refreshWhenOffline: false,
    revalidateIfStale: false,
    refreshInterval: 0,
  });

  const mapData = useMemo(() => {
    return data?.map(
      (curr: any) => ({
        id: curr.id,
        name: curr.user.name,
        email: curr.user.email,
      }),
      [],
    );
  }, [data]);

  return (
    <div className="px-[23px]">
      <div className="bg-forth border-input flex h-[52px] items-center justify-center rounded-[8px] border">
        <div className="relative flex w-[600px] flex-col">
          <div className="relative z-[999]">
            {user?.impersonate ? (
              <div className="flex items-center justify-center gap-[20px] text-center">
                <div>Currently Impersonating</div>
                <div>
                  <div
                    className="cursor-pointer rounded-[4px] bg-red-500 px-[10px] text-white"
                    onClick={stopImpersonating}
                  >
                    X
                  </div>
                </div>
                {user?.tier?.current === 'FREE' && <Subscription />}
              </div>
            ) : (
              <Input
                autoComplete="off"
                placeholder="Write the user details"
                name="impersonate"
                disableForm={true}
                label=""
                removeError={true}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
          </div>
          {!!data?.length && (
            <>
              <div
                className="fixed left-0 top-0 z-[998] h-full w-full bg-black/80"
                onClick={() => setName('')}
              />
              <div className="bg-sixth absolute left-0 top-[100%] z-[999] w-full border border-[#172034] text-white">
                {mapData?.map((user: any) => (
                  <div
                    onClick={setUser(user.id)}
                    key={user.id}
                    className="hover:bg-tableBorder cursor-pointer border-b border-[#172034] p-[10px]"
                  >
                    user: {user.id.split('-').at(-1)} - {user.name} -{' '}
                    {user.email}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
