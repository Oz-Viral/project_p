import { useModals } from '@mantine/modals';
import React, { FC, Ref, useCallback, useEffect, useMemo } from 'react';
import { Input } from '@kursor/react/form/input';
import { Button } from '@kursor/react/form/button';
import { Textarea } from '@kursor/react/form/textarea';
import { FormProvider, useForm } from 'react-hook-form';
import { showMediaBox } from '@kursor/frontend/components/media/media.component';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { UserDetailDto } from '@kursor/nestjs-libraries/dtos/users/user.details.dto';
import { useToaster } from '@kursor/react/toaster/toaster';
import { useSWRConfig } from 'swr';
import clsx from 'clsx';
import { TeamsComponent } from '@kursor/frontend/components/settings/teams.component';
import { isGeneral } from '@kursor/react/helpers/is.general';
import { useUser } from '@kursor/frontend/components/layout/user.context';
import { LogoutComponent } from '@kursor/frontend/components/layout/logout.component';
import { useSearchParams } from 'next/navigation';
import { IoSettingsOutline } from 'react-icons/io5';

export const SettingsPopup: FC<{ getRef?: Ref<any> }> = (props) => {
  const { getRef } = props;
  const fetch = useFetch();
  const toast = useToaster();
  const swr = useSWRConfig();
  const user = useUser();

  const resolver = useMemo(() => {
    return classValidatorResolver(UserDetailDto);
  }, []);
  const form = useForm({ resolver });
  const picture = form.watch('picture');
  const modal = useModals();
  const close = useCallback(() => {
    return modal.closeAll();
  }, []);

  const url = useSearchParams();
  const showLogout = !url.get('onboarding');

  const loadProfile = useCallback(async () => {
    const personal = await (await fetch('/user/personal')).json();
    form.setValue('fullname', personal.name || '');
    form.setValue('bio', personal.bio || '');
    form.setValue('picture', personal.picture);
  }, []);

  const openMedia = useCallback(() => {
    showMediaBox((values) => {
      form.setValue('picture', values);
    });
  }, []);

  const remove = useCallback(() => {
    form.setValue('picture', null);
  }, []);

  const submit = useCallback(async (val: any) => {
    await fetch('/user/personal', {
      method: 'POST',
      body: JSON.stringify(val),
    });

    if (getRef) {
      return;
    }

    toast.show('Profile updated');
    swr.mutate('/marketplace/account');
    close();
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        {!!getRef && (
          <button type="submit" className="hidden" ref={getRef}></button>
        )}
        <div
          className={clsx(
            'relative mx-auto flex w-full max-w-[920px] flex-col gap-[24px] bg-[#0B101B]',
            !getRef && 'rounded-[4px] border border-[#172034] p-[32px]',
          )}
        >
          {!getRef && (
            <button
              onClick={close}
              className="mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-tableBorder mantine-Modal-close mantine-1dcetaa absolute right-[20px] top-[20px] cursor-pointer outline-none"
              type="button"
            >
              <svg
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          )}
          {!getRef && (
            <div className="text-[24px] font-[600]">Profile Settings</div>
          )}
          <div className="flex flex-col gap-[4px]">
            <div className="text-[20px] font-[500]">Profile</div>
            <div className="text-[14px] font-[400] text-[#AAA]">
              Add profile information
            </div>
          </div>
          <div className="flex flex-col rounded-[4px] border border-[#172034] p-[24px]">
            <div className="flex items-center justify-between">
              <div className="w-[455px]">
                <Input label="Full Name" name="fullname" />
              </div>
              <div className="mb-[10px] flex gap-[8px]">
                <div className="h-[48px] w-[48px] rounded-full bg-[#D9D9D9]">
                  {!!picture?.path && (
                    <img
                      src={picture?.path}
                      alt="profile"
                      className="h-full w-full rounded-full"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-[2px]">
                  <div className="text-[14px]">Profile Picture</div>
                  <div className="flex gap-[8px]">
                    <button
                      className="flex h-[24px] w-[120px] cursor-pointer items-center justify-center gap-[4px] rounded-[4px] bg-[#612AD5]"
                      type="button"
                    >
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M12.25 8.3126V11.3751C12.25 11.6072 12.1578 11.8297 11.9937 11.9938C11.8296 12.1579 11.6071 12.2501 11.375 12.2501H2.625C2.39294 12.2501 2.17038 12.1579 2.00628 11.9938C1.84219 11.8297 1.75 11.6072 1.75 11.3751V8.3126C1.75 8.19657 1.79609 8.08529 1.87814 8.00324C1.96019 7.92119 2.07147 7.8751 2.1875 7.8751C2.30353 7.8751 2.41481 7.92119 2.49686 8.00324C2.57891 8.08529 2.625 8.19657 2.625 8.3126V11.3751H11.375V8.3126C11.375 8.19657 11.4211 8.08529 11.5031 8.00324C11.5852 7.92119 11.6965 7.8751 11.8125 7.8751C11.9285 7.8751 12.0398 7.92119 12.1219 8.00324C12.2039 8.08529 12.25 8.19657 12.25 8.3126ZM5.12203 4.68463L6.5625 3.24362V8.3126C6.5625 8.42863 6.60859 8.53991 6.69064 8.62196C6.77269 8.70401 6.88397 8.7501 7 8.7501C7.11603 8.7501 7.22731 8.70401 7.30936 8.62196C7.39141 8.53991 7.4375 8.42863 7.4375 8.3126V3.24362L8.87797 4.68463C8.96006 4.76672 9.0714 4.81284 9.1875 4.81284C9.3036 4.81284 9.41494 4.76672 9.49703 4.68463C9.57912 4.60254 9.62524 4.4912 9.62524 4.3751C9.62524 4.259 9.57912 4.14766 9.49703 4.06557L7.30953 1.87807C7.2689 1.83739 7.22065 1.80512 7.16754 1.78311C7.11442 1.76109 7.05749 1.74976 7 1.74976C6.94251 1.74976 6.88558 1.76109 6.83246 1.78311C6.77935 1.80512 6.7311 1.83739 6.69047 1.87807L4.50297 4.06557C4.42088 4.14766 4.37476 4.259 4.37476 4.3751C4.37476 4.4912 4.42088 4.60254 4.50297 4.68463C4.58506 4.76672 4.6964 4.81284 4.8125 4.81284C4.9286 4.81284 5.03994 4.76672 5.12203 4.68463Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <div className="text-[12px]" onClick={openMedia}>
                        Upload image
                      </div>
                    </button>
                    <button
                      className="flex h-[24px] w-[88px] items-center justify-center gap-[4px] rounded-[4px] border-2 border-[#506490]"
                      type="button"
                    >
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M11.8125 2.625H9.625V2.1875C9.625 1.8394 9.48672 1.50556 9.24058 1.25942C8.99444 1.01328 8.6606 0.875 8.3125 0.875H5.6875C5.3394 0.875 5.00556 1.01328 4.75942 1.25942C4.51328 1.50556 4.375 1.8394 4.375 2.1875V2.625H2.1875C2.07147 2.625 1.96019 2.67109 1.87814 2.75314C1.79609 2.83519 1.75 2.94647 1.75 3.0625C1.75 3.17853 1.79609 3.28981 1.87814 3.37186C1.96019 3.45391 2.07147 3.5 2.1875 3.5H2.625V11.375C2.625 11.6071 2.71719 11.8296 2.88128 11.9937C3.04538 12.1578 3.26794 12.25 3.5 12.25H10.5C10.7321 12.25 10.9546 12.1578 11.1187 11.9937C11.2828 11.8296 11.375 11.6071 11.375 11.375V3.5H11.8125C11.9285 3.5 12.0398 3.45391 12.1219 3.37186C12.2039 3.28981 12.25 3.17853 12.25 3.0625C12.25 2.94647 12.2039 2.83519 12.1219 2.75314C12.0398 2.67109 11.9285 2.625 11.8125 2.625ZM5.25 2.1875C5.25 2.07147 5.29609 1.96019 5.37814 1.87814C5.46019 1.79609 5.57147 1.75 5.6875 1.75H8.3125C8.42853 1.75 8.53981 1.79609 8.62186 1.87814C8.70391 1.96019 8.75 2.07147 8.75 2.1875V2.625H5.25V2.1875ZM10.5 11.375H3.5V3.5H10.5V11.375ZM6.125 5.6875V9.1875C6.125 9.30353 6.07891 9.41481 5.99686 9.49686C5.91481 9.57891 5.80353 9.625 5.6875 9.625C5.57147 9.625 5.46019 9.57891 5.37814 9.49686C5.29609 9.41481 5.25 9.30353 5.25 9.1875V5.6875C5.25 5.57147 5.29609 5.46019 5.37814 5.37814C5.46019 5.29609 5.57147 5.25 5.6875 5.25C5.80353 5.25 5.91481 5.29609 5.99686 5.37814C6.07891 5.46019 6.125 5.57147 6.125 5.6875ZM8.75 5.6875V9.1875C8.75 9.30353 8.70391 9.41481 8.62186 9.49686C8.53981 9.57891 8.42853 9.625 8.3125 9.625C8.19647 9.625 8.08519 9.57891 8.00314 9.49686C7.92109 9.41481 7.875 9.30353 7.875 9.1875V5.6875C7.875 5.57147 7.92109 5.46019 8.00314 5.37814C8.08519 5.29609 8.19647 5.25 8.3125 5.25C8.42853 5.25 8.53981 5.29609 8.62186 5.37814C8.70391 5.46019 8.75 5.57147 8.75 5.6875Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <div className="text-[12px]" onClick={remove}>
                        Remove
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Textarea label="Bio" name="bio" className="resize-none" />
            </div>
          </div>
          {!getRef && (
            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          )}
          {!!user?.tier?.team_members && isGeneral() && <TeamsComponent />}
          {showLogout && <LogoutComponent />}
        </div>
      </form>
    </FormProvider>
  );
};

export const SettingsComponent = () => {
  const settings = useModals();
  const openModal = useCallback(() => {
    settings.openModal({
      children: <SettingsPopup />,
      classNames: {
        modal: 'bg-transparent text-white',
      },
      withCloseButton: false,
      size: '100%',
    });
  }, []);

  return (
    <IoSettingsOutline className="h-6 w-6 cursor-pointer" onClick={openModal} />
  );
};
