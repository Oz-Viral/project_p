'use client';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@kursor/react/form/button';
import { Input } from '@kursor/react/form/input';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LoginUserDto } from '@kursor/nestjs-libraries/dtos/auth/login.user.dto';
import { GithubProvider } from '@kursor/frontend/components/auth/providers/github.provider';
import interClass from '@kursor/react/helpers/inter.font';
import { isGeneral } from '@kursor/react/helpers/is.general';
import { GoogleProvider } from '@kursor/frontend/components/auth/providers/google.provider';

type Inputs = {
  email: string;
  password: string;
  providerToken: '';
  provider: 'LOCAL';
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const resolver = useMemo(() => {
    return classValidatorResolver(LoginUserDto);
  }, []);

  const form = useForm<Inputs>({
    resolver,
    defaultValues: {
      providerToken: '',
      provider: 'LOCAL',
    },
  });

  const fetchData = useFetch();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const login = await fetchData('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...data, provider: 'LOCAL' }),
    });

    if (login.status === 400) {
      form.setError('email', {
        message: await login.text(),
      });

      setLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h1 className="text-3xl font-bold text-left mb-4 cursor-pointer">
            Sign In
          </h1>
        </div>

        {!isGeneral() ? <GithubProvider /> : <GoogleProvider />}
        <div className="h-[20px] mb-[24px] mt-[24px] relative">
          <div className="absolute w-full h-[1px] bg-[#28344F] top-[50%] -translate-y-[50%]" />
          <div
            className={`absolute z-[1] ${interClass} justify-center items-center w-full left-0 top-0 flex`}
          >
            <div className="bg-[#0a0a0a] px-[16px]">OR</div>
          </div>
        </div>

        <div className="text-white">
          <Input
            label="Email"
            {...form.register('email')}
            type="email"
            placeholder="Email Address"
          />
          <Input
            label="Password"
            {...form.register('password')}
            autoComplete="off"
            type="password"
            placeholder="Password"
          />
        </div>
        <div className="text-center mt-6">
          <div className="w-full flex">
            <Button type="submit" className="flex-1" loading={loading}>
              Sign in
            </Button>
          </div>
          <p className="mt-4 text-sm">
            Don{"'"}t Have An Account?{' '}
            <Link href="/auth" className="underline cursor-pointer">
              {' '}
              Sign Up
            </Link>
          </p>
          <p className="mt-4 text-sm text-red-600">
            <Link href="/auth/forgot" className="underline cursor-pointer">
              Forgot password
            </Link>
          </p>
        </div>
      </form>
    </FormProvider>
  );
}
