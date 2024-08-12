'use client';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@kursor/react/form/button';
import { Input } from '@kursor/react/form/input';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ForgotPasswordDto } from '@kursor/nestjs-libraries/dtos/auth/forgot.password.dto';

type Inputs = {
  email: string;
};

export function Forgot() {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(false);

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
            Forgot Password
          </h1>
        </div>
        {!state ? (
          <>
            <div className="space-y-4">
              <Input
                label="Email"
                {...form.register('email')}
                type="email"
                placeholder="Email Address"
              />
            </div>
            <div className="mt-6 text-center">
              <div className="flex w-full">
                <Button type="submit" className="flex-1" loading={loading}>
                  Send Password Reset Email
                </Button>
              </div>
              <p className="mt-4 text-sm">
                <Link href="/auth/login" className="cursor-pointer underline">
                  {' '}
                  Go back to login
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 text-left">
              We have send you an email with a link to reset your password.
            </div>
            <p className="mt-4 text-sm">
              <Link href="/auth/login" className="cursor-pointer underline">
                {' '}
                Go back to login
              </Link>
            </p>
          </>
        )}
      </form>
    </FormProvider>
  );
}
