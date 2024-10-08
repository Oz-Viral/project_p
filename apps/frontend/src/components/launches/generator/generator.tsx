import React, {
  ChangeEventHandler,
  FC,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useUser } from '@kursor/frontend/components/layout/user.context';
import { useRouter } from 'next/navigation';
import { deleteDialog } from '@kursor/react/helpers/delete.dialog';
import {
  Step,
  StepSpace,
} from '@kursor/frontend/components/onboarding/onboarding';
import { useModals } from '@mantine/modals';
import { Select } from '@kursor/react/form/select';
import { Input } from '@kursor/react/form/input';
import dayjs from 'dayjs';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { GeneratorDto } from '@kursor/nestjs-libraries/dtos/generator/generator.dto';
import { Button } from '@kursor/react/form/button';
import { PostSelector } from '@kursor/frontend/components/post-url-selector/post.url.selector';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import clsx from 'clsx';
import useConfirmationStore from '@kursor/react/store/dialog/confirmationStore';

const ThirdStep: FC<{ week: number; year: number }> = (props) => {
  const { week, year } = props;

  const gotToPosts = useCallback(() => {
    window.location.href = `/launches?week=${week}&year=${year}`;
  }, [week, year]);
  return (
    <div>
      <div className="mb-[20px] mt-[20px] flex flex-col items-center justify-center gap-[20px] text-center text-[20px]">
        <img src="/success.svg" alt="success" />
        Your posts have been scheduled as drafts.
        <br />
        <Button onClick={gotToPosts}>Click here to see them</Button>
      </div>
    </div>
  );
};

const SecondStep: FC<{
  posts: Array<Array<{ post: string }>>;
  url: string;
  postId?: string;
  nextStep: (params: { week: number; year: number }) => void;
}> = (props) => {
  const { posts, nextStep, url, postId } = props;
  const fetch = useFetch();
  const [selected, setSelected] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    values: {
      date: dayjs().week() + '_' + dayjs().year(),
    },
  });

  const addPost = useCallback(
    (index: string) => () => {
      if (selected.includes(index)) {
        setSelected(selected.filter((i) => i !== index));
        return;
      }
      setSelected([...selected, index]);
    },
    [selected],
  );

  const list = useMemo(() => {
    const currentDate = dayjs();
    return [...new Array(52)].map((_, i) => {
      const week = currentDate.add(i, 'week');
      return {
        value: week.week() + '_' + week.year(),
        label: `Week #${week.week()} (${week
          .startOf('isoWeek')
          .format('YYYY-MM-DD')} - ${week
          .endOf('isoWeek')
          .format('YYYY-MM-DD')})`,
      };
    });
  }, []);

  const createPosts: SubmitHandler<{
    date: any;
  }> = useCallback(
    async (values) => {
      setLoading(true);
      await fetch('/posts/generator/draft', {
        method: 'POST',
        body: JSON.stringify({
          posts: posts
            .filter((_, index) => selected.includes(String(index)))
            .map((po) => ({ list: po })),
          url,
          postId: postId ? `(post:${postId})` : undefined,
          year: values.date.year,
          week: values.date.week,
        }),
      });
      setLoading(false);
      nextStep({
        week: values.date.week,
        year: values.date.year,
      });
    },
    [selected, postId, url],
  );

  return (
    <form onSubmit={form.handleSubmit(createPosts)}>
      <FormProvider {...form}>
        <div className={loading ? 'opacity-75' : ''}>
          <Select
            label="Select a week"
            name="date"
            extraForm={{
              setValueAs: (value) => {
                const [week, year] = value.split('_');
                return { week: +week, year: +year };
              },
            }}
          >
            {list.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <div className="mb-[20px] text-[20px]">
            Click on the posts you would like to schedule.
            <br />
            They will be saved as drafts and you can edit them later.
          </div>
          <div className="grid cursor-pointer select-none grid-cols-3 gap-[25px]">
            {posts.map((post, index) => (
              <div
                onClick={addPost(String(index))}
                className={clsx(
                  'group relative flex h-[200px] flex-col rounded-[4px] border hover:border-white',
                  selected.includes(String(index))
                    ? 'border-white'
                    : 'border-fifth',
                )}
                key={post[0].post}
              >
                {post.length > 1 && (
                  <div className="absolute -left-[15px] -top-[15px] z-[100] rounded-[10px] bg-[#612AD5] p-[3px]">
                    a thread
                  </div>
                )}
                <div
                  className={clsx(
                    'relative h-full w-full flex-1 group-hover:bg-black',
                    selected.includes(String(index)) && 'bg-black',
                  )}
                >
                  <div className="absolute left-0 top-0 h-full w-full p-[16px]">
                    <div className="h-full w-full resize-none overflow-hidden text-ellipsis outline-none group-hover:bg-black">
                      {post[0].post.split('\n\n')[0]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-[20px] flex justify-end">
            <Button type="submit" disabled={!selected.length} loading={loading}>
              Create posts
            </Button>
          </div>
        </div>
      </FormProvider>
    </form>
  );
};

const FirstStep: FC<{
  nextStep: (
    posts: Array<Array<{ post: string }>>,
    url: string,
    postId?: string,
  ) => void;
}> = (props) => {
  const { nextStep } = props;
  const fetch = useFetch();
  const [loading, setLoading] = useState(false);
  const resolver = useMemo(() => {
    return classValidatorResolver(GeneratorDto);
  }, []);

  const form = useForm({
    mode: 'all',
    resolver,
    values: {
      url: '',
      post: undefined as undefined | string,
    },
  });

  const [url, post] = form.watch(['url', 'post']);

  const makeSelect = useCallback(
    (post?: string) => {
      form.setValue('post', post?.split?.(':')[1]?.split(')')?.[0]);

      if (!post && !url) {
        form.setError('url', {
          message: 'You need to select a post or a URL',
        });
        return;
      }

      if (post && url) {
        form.setError('url', {
          message: 'You can only have a URL or a post',
        });
        return;
      }

      form.setError('url', {
        message: '',
      });
    },
    [post, url],
  );

  const onSubmit: SubmitHandler<{
    url: string;
    post: string | undefined;
  }> = useCallback(async (value) => {
    setLoading(true);
    const data = await (
      await fetch('/posts/generator', {
        method: 'POST',
        body: JSON.stringify(value),
      })
    ).json();
    nextStep(data.list, value.url, value.post);
    setLoading(false);
  }, []);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={loading ? 'pointer-events-none select-none opacity-75' : ''}
    >
      <FormProvider {...form}>
        <div className="flex flex-col">
          <div className="border-fifth rounded-[4px] border p-[20px]">
            <div className="flex">
              <div className="flex-1">
                <Input label="URL" {...form.register('url')} />
              </div>
            </div>
            <div className="flex flex-col-reverse">
              <div className="bg-input border-fifth min-h-[500px] rounded-[4px] border p-[16px] empty:hidden">
                <PostSelector
                  noModal={true}
                  onClose={() => null}
                  onSelect={makeSelect}
                  date={dayjs().add(1, 'year')}
                  only="article"
                />
              </div>
              <div className="existing-empty pb-[10px]">
                Or select from exising posts
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[20px] flex justify-end">
          <Button type="submit" disabled={!!(url && post)} loading={loading}>
            {url && post ? "You can't have both URL and a POST" : 'Next'}
          </Button>
        </div>
      </FormProvider>
    </form>
  );
};
export const GeneratorPopup = () => {
  const [step, setStep] = useState(1);
  const modals = useModals();
  const [posts, setPosts] = useState<
    | {
        posts: Array<Array<{ post: string }>>;
        url: string;
        postId?: string;
      }
    | undefined
  >(undefined);

  const [yearAndWeek, setYearAndWeek] = useState<{
    year: number;
    week: number;
  } | null>(null);

  const closeAll = useCallback(() => {
    modals.closeAll();
  }, []);

  return (
    <div className="bg-sixth relative mx-auto flex w-full max-w-[920px] flex-col gap-[24px] rounded-[4px] border border-[#172034] p-[32px]">
      <button
        onClick={closeAll}
        className="mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-tableBorder mantine-Modal-close mantine-1dcetaa absolute right-[20px] top-[15px] cursor-pointer outline-none"
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
      <h1 className="text-[24px]">Generate Posts</h1>
      <div className="flex">
        <Step title="Generate posts" step={1} currentStep={step} lastStep={3} />
        <StepSpace />
        <Step title="Confirm posts" step={2} currentStep={step} lastStep={3} />
        <StepSpace />
        <Step title="Done" step={3} currentStep={step} lastStep={3} />
      </div>
      {step === 1 && (
        <FirstStep
          nextStep={(posts, url: string, postId?: string) => {
            setPosts({
              posts,
              url,
              postId,
            });
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <SecondStep
          {...posts!}
          nextStep={(e) => {
            setYearAndWeek(e);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <ThirdStep week={yearAndWeek?.week!} year={yearAndWeek?.year!} />
      )}
    </div>
  );
};
export const GeneratorComponent = () => {
  const user = useUser();
  const router = useRouter();
  const modal = useModals();

  const { openConfirmation } = useConfirmationStore();

  const generate = useCallback(async () => {
    if (!user?.tier?.ai) {
      if (
        // await deleteDialog(
        //   'You need to upgrade to use this feature',
        //   'Move to billing',
        //   'Payment Required',
        // )
        await openConfirmation({
          title: 'Confirmation',
          description: 'You need to upgrade to use this feature',
          actionLabel: 'Move to billing',
          cancelLabel: 'Payment Required',
          onAction: () => {
            return true;
          },
          onCancel: () => {
            return false;
          },
        })
      ) {
        router.push('/billing');
      }
      return;
    }

    modal.openModal({
      title: '',
      withCloseButton: false,
      classNames: {
        modal: 'bg-transparent text-white',
      },
      size: '100%',
      children: <GeneratorPopup />,
    });
  }, [user]);

  return (
    <button
      className="flex items-center justify-center gap-[5px] rounded-md bg-red-700 p-[8px] text-white outline-none"
      onClick={generate}
    >
      <svg
        width="25"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.0614 9.67972L16.4756 11.0939L17.8787 9.69083L16.4645 8.27662L15.0614 9.67972ZM16.4645 6.1553L20 9.69083L8.6863 21.0045L5.15076 17.469L16.4645 6.1553Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.364 5.06066L9.59619 6.82843L8.53553 5.76777L10.3033 4L11.364 5.06066ZM6.76778 6.82842L5 5.06067L6.06066 4L7.82843 5.76776L6.76778 6.82842ZM10.3033 10.364L8.53553 8.5962L9.59619 7.53554L11.364 9.3033L10.3033 10.364ZM7.82843 8.5962L6.06066 10.364L5 9.3033L6.76777 7.53554L7.82843 8.5962Z"
          fill="currentColor"
        />
      </svg>
      Generate Posts
    </button>
  );
};
