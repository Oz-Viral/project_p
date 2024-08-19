'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@kursor/react/form/button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { CreateOrgUserDto } from '@kursor/nestjs-libraries/dtos/auth/create.org.user.dto';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingComponent } from '@kursor/frontend/components/layout/loading';
import interClass from '@kursor/react/helpers/inter.font';
import clsx from 'clsx';
import { GoogleProvider } from '@kursor/frontend/components/auth/providers/google.provider';
import { useFireEvents } from '@kursor/helpers/utils/use.fire.events';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kursor/react/components/ui/form';
import { Input } from '@kursor/react/components/ui/input';

type Inputs = {
  email: string;
  password: string;
  company: string;
  providerToken: string;
  provider: string;
};

export function Register() {
  const getQuery = useSearchParams();
  const fetch = useFetch();
  const [provider] = useState(getQuery?.get('provider')?.toUpperCase());
  const [code, setCode] = useState(getQuery?.get('code') || '');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (provider && code) {
      load();
    }
  }, []);

  const load = useCallback(async () => {
    const { token } = await (
      await fetch(`/auth/oauth/${provider?.toUpperCase() || 'LOCAL'}/exists`, {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
    ).json();

    if (token) {
      setCode(token);
      setShow(true);
    }
  }, [provider, code]);

  if (!code && !provider) {
    return <RegisterAfter token="" provider="LOCAL" />;
  }

  if (!show) {
    return <LoadingComponent />;
  }

  return (
    <RegisterAfter token={code} provider={provider?.toUpperCase() || 'LOCAL'} />
  );
}

export function RegisterAfter({
  token,
  provider,
}: {
  token: string;
  provider: string;
}) {
  const [loading, setLoading] = useState(false);
  const getQuery = useSearchParams();
  const router = useRouter();
  const fireEvents = useFireEvents();
  const t = useTranslations('auth');

  const isAfterProvider = useMemo(() => {
    return !!token && !!provider;
  }, [token, provider]);

  const resolver = useMemo(() => {
    return classValidatorResolver(CreateOrgUserDto);
  }, []);

  const form = useForm<Inputs>({
    resolver,
    defaultValues: {
      providerToken: token,
      provider: provider,
    },
  });

  const fetchData = useFetch();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const register = await fetchData('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data }),
    });
    if (register.status === 400) {
      form.setError('email', {
        message: 'Email already exists',
      });

      setLoading(false);
    }

    fireEvents('register');

    if (register.headers.get('activate')) {
      router.push('/auth/activate');
    }
  };

  const rootDomain = useMemo(() => {
    const url = new URL(process.env.frontendUrl!);
    const hostname = url.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return url.protocol + '//' + url.hostname?.replace(/^[^.]+\./, '');
    }

    return process.env.frontendUrl;
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h1 className="mb-4 cursor-pointer text-left text-3xl font-bold dark:text-white">
            {t('signUp')}
          </h1>
        </div>
        {!isAfterProvider && <GoogleProvider />}
        {!isAfterProvider && (
          <div className="w-full">
            <div className="my-6 flex items-center gap-3">
              <div className="bg-gray h-px w-full" />
              <p className="text-gray text-base"> OR </p>
              <div className="bg-gray h-px w-full" />
            </div>
          </div>
        )}
        <div>
          {!isAfterProvider && (
            <>
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
              <FormField
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>{t('password')}</FormLabel>
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
            </>
          )}
          <FormField
            name="company"
            render={({ field }) => (
              <FormItem className="mb-4">
                {/* className="text-gray-500 dark:text-gray-200" */}
                <FormLabel>{t('company')}</FormLabel>
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
        <div className={clsx('text-[12px]', interClass)}>
          {t('agreeCommentPrefix')}
          <a href={`${rootDomain}/terms`} className="underline hover:font-bold">
            {t('termsOfService')}
          </a>
          <span className="px-1">{t('and')}</span>
          <a
            href={`${rootDomain}/privacy`}
            className="underline hover:font-bold"
          >
            {t('privacyPolicy')}
          </a>
          {t('agreeCommentSuffix')}
        </div>
        <div className="mt-6 text-center">
          <div className="flex w-full">
            <Button type="submit" className="flex-1" loading={loading}>
              {t('createAccount')}
            </Button>
          </div>
          <p className="mt-4 text-sm">
            {t('haveAccount')}
            <Link href="/auth/login" className="ml-2 cursor-pointer underline">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
