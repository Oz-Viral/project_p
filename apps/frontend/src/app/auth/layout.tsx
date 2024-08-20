import { isGeneral } from '@kursor/react/helpers/is.general';

export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="bg-loginBg absolute left-0 top-0 z-[0] h-[100vh] w-[100vw] overflow-hidden bg-contain bg-left-top bg-no-repeat" />
      <div className="relative z-[1] flex h-[100vh] w-[100vw] items-center justify-end overflow-hidden pr-[100px]">
        <div className="bg-loginBox flex h-[614px] w-[557px] bg-contain">
          <div className="relative w-full">
            <div className="custom:fixed custom:text-left custom:left-[20px] custom:justify-start custom:top-[20px] absolute -top-[100px] flex w-full items-center justify-center gap-[10px]">
              <Image
                src={isGeneral() ? '/postiz.svg' : '/logo.svg'}
                width={55}
                height={53}
                alt="Logo"
              />
              <div
                className={clsx(!isGeneral() ? 'mt-[12px]' : 'min-w-[80px]')}
              >
                <div className="text-[40px]">Kursor</div>
              </div>
            </div>
          </div>
          <div className="absolute h-[614px] w-[557px] p-[32px]">
            {children}
          </div>
          {/* <div className="flex flex-1 flex-col">
            <div className="flex flex-1 justify-end">
              <div className="absolute top-0 h-full w-[1px] translate-x-[22px] bg-gradient-to-t from-[#354258]" />
            </div>
            <div>
              <div className="absolute right-0 h-[1px] w-full translate-y-[22px] bg-gradient-to-l from-[#354258]" />
            </div>
          </div>
          <div className="absolute top-0 h-full w-[1px] -translate-x-[22px] bg-gradient-to-t from-[#354258]" />
          <div className="absolute right-0 h-[1px] w-full -translate-y-[22px] bg-gradient-to-l from-[#354258]" /> */}
        </div>
      </div>
    </>
  );
}
