'use client';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ForgotPasswordDto } from '@kursor/nestjs-libraries/dtos/auth/forgot.password.dto';
import { useTranslations } from 'next-intl';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kursor/react/components/ui/form';
import { Input } from '@kursor/react/components/ui/input';
import { Button } from '@kursor/react/components/ui/button';

type Inputs = {
  email: string;
};

export function Forgot() {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(false);

  const t = useTranslations('auth');

  const resolver = useMemo(() => {
    return classValidatorResolver(ForgotPasswordDto);
  }, []);

  const form = useForm<Inputs>({
    resolver,
  });

  const fetchData = useFetch();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    await fetchData('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ ...data, provider: 'LOCAL' }),
    });

    setState(true);
    setLoading(false);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h1 className="mb-4 cursor-pointer text-left text-3xl font-bold">
            {t('passwordReset')}
          </h1>
        </div>
        {!state ? (
          <>
            <div className="space-y-4">
              <FormField
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    {/* className="text-gray-500 dark:text-gray-200" */}
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        className="dark:placeholder-zinc-400"
                        // placeholder="Your email address"
                        type="text"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            form.handleSubmit(onSubmit);
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6 text-center">
              <div className="flex w-full">
                <Button type="submit" className="flex-1" loading={loading}>
                  {t('sendPasswordResetEmail')}
                </Button>
              </div>
              <p className="mt-4 text-sm">
                <Link href="/auth/login" className="cursor-pointer underline">
                  {t('goBackToLogin')}
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 text-left">{t('afterSendNotification')}</div>
            <p className="mt-4 text-sm">
              <Link href="/auth/login" className="cursor-pointer underline">
                {t('goBackToLogin')}
              </Link>
            </p>
          </>
        )}
      </form>
    </FormProvider>
  );
}
