'use client';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ForgotReturnPasswordDto } from '@kursor/nestjs-libraries/dtos/auth/forgot-return.password.dto';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kursor/react/components/ui/form';
import { useTranslations } from 'next-intl';
import { Input } from '@kursor/react/components/ui/input';
import { Button } from '@kursor/react/components/ui/button';

type Inputs = {
  password: string;
  repeatPassword: string;
  token: string;
};

export function ForgotReturn({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(false);

  const t = useTranslations('auth');

  const resolver = useMemo(() => {
    return classValidatorResolver(ForgotReturnPasswordDto);
  }, []);

  const form = useForm<Inputs>({
    resolver,
    mode: 'onChange',
    defaultValues: {
      token,
    },
  });

  const fetchData = useFetch();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const { reset } = await (
      await fetchData('/auth/forgot-return', {
        method: 'POST',
        body: JSON.stringify({ ...data }),
      })
    ).json();

    setState(true);

    if (!reset) {
      form.setError('password', {
        type: 'manual',
        message: 'Your password reset link has expired. Please try again.',
      });

      return false;
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
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
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>{t('newPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        className="dark:placeholder-zinc-400"
                        // placeholder="Your password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="repeatPassword"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>{t('repeatPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        className="dark:placeholder-zinc-400"
                        // placeholder="Your password"
                        type="password"
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
                  {t('changePassword')}
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
            <div className="mt-6 text-left">
              {t('passwordChangeSuccessNotification')}
            </div>
            <p className="mt-4 text-sm">
              <Link href="/auth/login" className="cursor-pointer underline">
                {t('goBackToLogin')}
              </Link>
            </p>
          </>
        )}
      </form>
    </Form>
  );
}
