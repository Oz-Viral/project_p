'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LoginUserDto } from '@kursor/nestjs-libraries/dtos/auth/login.user.dto';
import { GithubProvider } from '@kursor/frontend/components/auth/providers/github.provider';
import interClass from '@kursor/react/helpers/inter.font';
import { isGeneral } from '@kursor/react/helpers/is.general';
import { GoogleProvider } from '@kursor/frontend/components/auth/providers/google.provider';
import useDictionary from '../../hooks/stores/useDictionary';
import { Input } from '@kursor/react/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kursor/react/components/ui/form';
import { Button } from '@kursor/react/components/ui/button';

type Inputs = {
  email: string;
  password: string;
  providerToken: '';
  provider: 'LOCAL';
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const { dictionary } = useDictionary();

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <h1 className="mb-4 cursor-pointer text-left text-3xl font-bold">
            {dictionary.auth.signIn}
          </h1>
        </div>

        <GoogleProvider />
        {/* <div className="relative mb-[24px] mt-[24px] h-[20px]">
          <div className="absolute top-[50%] h-[1px] w-full -translate-y-[50%] bg-[#28344F]" />
          <div
            className={`absolute z-[1] ${interClass} left-0 top-0 flex w-full items-center justify-center`}
          >
            <div className="px-[16px]">OR</div>
          </div>
        </div> */}
        <div className="w-full">
          <div className="my-6 flex items-center gap-3">
            <div className="bg-gray h-px w-full" />
            <p className="text-gray text-base"> OR </p>
            <div className="bg-gray h-px w-full" />
          </div>
        </div>

        <div>
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem className="mb-4">
                {/* className="text-gray-500 dark:text-gray-200" */}
                <FormLabel>{dictionary.auth.email}</FormLabel>
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
                <FormLabel>{dictionary.auth.password}</FormLabel>
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
              {dictionary.auth.signIn}
            </Button>
          </div>
          <p className="mt-4 text-sm">
            {dictionary.auth.dontHaveAccount}
            <Link href="/auth" className="ml-2 cursor-pointer underline">
              {dictionary.auth.signUp}
            </Link>
          </p>
          <p className="mt-4 text-sm text-red-600">
            <Link href="/auth/forgot" className="cursor-pointer underline">
              {dictionary.auth.forgotPassword}
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
