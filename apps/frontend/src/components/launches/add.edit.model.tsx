'use client';

import React, {
  FC,
  Fragment,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dayjs from 'dayjs';
import { Integrations } from '@kursor/frontend/components/launches/calendar.context';
import clsx from 'clsx';
import { commands } from '@uiw/react-md-editor';
import { usePreventWindowUnload } from '@kursor/react/helpers/use.prevent.window.unload';
import { deleteDialog } from '@kursor/react/helpers/delete.dialog';
import { useModals } from '@mantine/modals';
import { useHideTopEditor } from '@kursor/frontend/components/launches/helpers/use.hide.top.editor';
// @ts-ignore
import useKeypress from 'react-use-keypress';
import {
  getValues,
  resetValues,
} from '@kursor/frontend/components/launches/helpers/use.values';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import { useMoveToIntegration } from '@kursor/frontend/components/launches/helpers/use.move.to.integration';
import { useExistingData } from '@kursor/frontend/components/launches/helpers/use.existing.data';
import { newImage } from '@kursor/frontend/components/launches/helpers/new.image.component';
import { MultiMediaComponent } from '@kursor/frontend/components/media/media.component';
import { useExpend } from '@kursor/frontend/components/launches/helpers/use.expend';
import { TopTitle } from '@kursor/frontend/components/launches/helpers/top.title.component';
import { PickPlatforms } from '@kursor/frontend/components/launches/helpers/pick.platform.component';
import { ProvidersOptions } from '@kursor/frontend/components/launches/providers.options';
import { v4 as uuidv4 } from 'uuid';
import useSWR, { useSWRConfig } from 'swr';
import { useToaster } from '@kursor/react/toaster/toaster';
import { postSelector } from '@kursor/frontend/components/post-url-selector/post.url.selector';
import { UpDownArrow } from '@kursor/frontend/components/launches/up.down.arrow';
import { DatePicker } from '@kursor/frontend/components/launches/helpers/date.picker';
import { arrayMoveImmutable } from 'array-move';
import {
  Information,
  PostToOrganization,
} from '@kursor/frontend/components/launches/post.to.organization';
import { Submitted } from '@kursor/frontend/components/launches/submitted';
import { supportEmitter } from '@kursor/frontend/components/layout/support';
import { Editor } from '@kursor/frontend/components/launches/editor';
import { AddPostButton } from '@kursor/frontend/components/launches/add.post.button';
import { useStateCallback } from '@kursor/react/helpers/use.state.callback';
import { CopilotPopup } from '@copilotkit/react-ui';
import { useUser } from '@kursor/frontend/components/layout/user.context';
import { Button } from '@kursor/react/components/ui/button';
import { FaRegTrashCan } from 'react-icons/fa6';

import useConfirmationStore from '@kursor/react/store/dialog/confirmationStore';

export const AddEditModal: FC<{
  date: dayjs.Dayjs;
  integrations: Integrations[];
  reopenModal: () => void;
}> = (props) => {
  const { date, integrations, reopenModal } = props;
  const [dateState, setDateState] = useState(date);
  const { mutate } = useSWRConfig();

  const { openConfirmation } = useConfirmationStore();

  // hook to open a new modal
  const modal = useModals();

  // selected integrations to allow edit
  const [selectedIntegrations, setSelectedIntegrations] = useStateCallback<
    Integrations[]
  >([]);

  // value of each editor
  const [value, setValue] = useState<
    Array<{
      content: string;
      id?: string;
      image?: Array<{ id: string; path: string }>;
    }>
  >([{ content: '' }]);

  const fetch = useFetch();

  const user = useUser();

  const updateOrder = useCallback(() => {
    modal.closeAll();
    reopenModal();
  }, [reopenModal, modal]);

  // prevent the window exit by mistake
  usePreventWindowUnload(true);

  // hook to move the settings in the right place to fix missing fields
  const moveToIntegration = useMoveToIntegration();

  // hook to test if the top editor should be hidden
  const showHide = useHideTopEditor();

  const [showError, setShowError] = useState(false);

  // are we in edit mode?
  const existingData = useExistingData();

  // Post for
  const [postFor, setPostFor] = useState<Information | undefined>();

  const expend = useExpend();

  const toaster = useToaster();

  // if it's edit just set the current integration
  useEffect(() => {
    if (existingData.integration) {
      setSelectedIntegrations([
        integrations.find((p) => p.id === existingData.integration)!,
      ]);
    }
  }, [existingData.integration]);

  // if the user exit the popup we reset the global variable with all the values
  useEffect(() => {
    supportEmitter.emit('change', false);

    return () => {
      supportEmitter.emit('change', true);
      resetValues();
    };
  }, []);

  // Change the value of the global editor
  const changeValue = useCallback(
    (index: number) => (newValue: string) => {
      return setValue((prev) => {
        prev[index].content = newValue;
        return [...prev];
      });
    },
    [value],
  );

  const changeImage = useCallback(
    (index: number) =>
      (newValue: {
        target: { name: string; value?: Array<{ id: string; path: string }> };
      }) => {
        return setValue((prev) => {
          return prev.map((p, i) => {
            if (i === index) {
              return { ...p, image: newValue.target.value };
            }
            return p;
          });
        });
      },
    [],
  );

  // Add another editor
  const addValue = useCallback(
    (index: number) => () => {
      setValue((prev) => {
        return prev.reduce(
          (acc, p, i) => {
            acc.push(p);
            if (i === index) {
              acc.push({ content: '' });
            }

            return acc;
          },
          [] as Array<{ content: string }>,
        );
      });
    },
    [],
  );

  const changePosition = useCallback(
    (index: number) => (type: 'up' | 'down') => {
      if (type === 'up' && index !== 0) {
        setValue((prev) => {
          return arrayMoveImmutable(prev, index, index - 1);
        });
      } else if (type === 'down') {
        setValue((prev) => {
          return arrayMoveImmutable(prev, index, index + 1);
        });
      }
    },
    [],
  );

  // Delete post
  const deletePost = useCallback(
    (index: number) => async () => {
      if (
        !(await deleteDialog(
          'Are you sure you want to delete this post?',
          'Yes, delete it!',
        ))
      ) {
        return;
      }
      setValue((prev) => {
        prev.splice(index, 1);
        return [...prev];
      });
    },
    [value],
  );

  // override the close modal to ask the user if he is sure to close
  const askClose = useCallback(async () => {
    // if (
    //   await deleteDialog(
    //     'Are you sure you want to close this modal? (all data will be lost)',
    //     'Yes, close it!',
    //   )
    // ) {
    //   modal.closeAll();
    // }

    openConfirmation({
      title: 'Close Confirmation',
      description:
        'Are you sure you want to close this modal? (all data will be lost)',
      // cancelLabel: 'Cancel',
      // actionLabel: 'Close',
      onAction: () => {
        modal.closeAll();
      },
      onCancel: () => {
        reopenModal();
      },
    });
  }, []);

  // sometimes it's easier to click escape to close
  useKeypress('Escape', askClose);

  const postNow = useCallback(
    ((e) => {
      e.stopPropagation();
      e.preventDefault();

      return schedule('now')();
    }) as MouseEventHandler<HTMLDivElement>,
    [],
  );

  // function to send to the server and save
  const schedule = useCallback(
    (type: 'draft' | 'now' | 'schedule' | 'delete') => async () => {
      if (type === 'delete') {
        if (
          !(await deleteDialog(
            'Are you sure you want to delete this post?',
            'Yes, delete it!',
          ))
        ) {
          return;
        }
        await fetch(`/posts/${existingData.group}`, {
          method: 'DELETE',
        });
        mutate('/posts');
        modal.closeAll();
        return;
      }

      const values = getValues();

      const allKeys = Object.keys(values).map((v) => ({
        integration: integrations.find((p) => p.id === v),
        value: values[v].posts,
        valid: values[v].isValid,
        group: existingData?.group,
        trigger: values[v].trigger,
        settings: values[v].settings(),
        checkValidity: values[v].checkValidity,
        maximumCharacters: values[v].maximumCharacters,
      }));

      for (const key of allKeys) {
        if (key.checkValidity) {
          const check = await key.checkValidity(
            key?.value.map((p: any) => p.image || []),
          );
          if (typeof check === 'string') {
            toaster.show(check, 'warning');
            return;
          }
        }

        if (
          key.value.some(
            (p) => p.content.length > (key.maximumCharacters || 1000000),
          )
        ) {
          if (
            !(await deleteDialog(
              `${key?.integration?.name} post is too long, it will be cropped, do you want to continue?`,
              'Yes, continue',
            ))
          ) {
            await key.trigger();
            moveToIntegration({
              identifier: key?.integration?.id!,
              toPreview: true,
            });
            return;
          }
        }

        if (key.value.some((p) => !p.content || p.content.length < 6)) {
          setShowError(true);
          return;
        }

        if (!key.valid) {
          await key.trigger();
          moveToIntegration({ identifier: key?.integration?.id! });
          return;
        }
      }

      await fetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          ...(postFor ? { order: postFor.id } : {}),
          type,
          date: dateState.utc().format('YYYY-MM-DDTHH:mm:ss'),
          posts: allKeys.map((p) => ({
            ...p,
            value: p.value.map((a) => ({
              ...a,
              content: a.content.slice(0, p.maximumCharacters || 1000000),
            })),
          })),
        }),
      });

      existingData.group = uuidv4();

      mutate('/posts');
      toaster.show(
        !existingData.integration
          ? 'Added successfully'
          : 'Updated successfully',
      );
      modal.closeAll();
    },
    [
      postFor,
      dateState,
      value,
      integrations,
      existingData,
      selectedIntegrations,
    ],
  );

  const getPostsMarketplace = useCallback(async () => {
    return (
      await fetch(`/posts/marketplace/${existingData?.posts?.[0]?.id}`)
    ).json();
  }, []);

  const { data } = useSWR(
    `/posts/marketplace/${existingData?.posts?.[0]?.id}`,
    getPostsMarketplace,
  );

  const canSendForPublication = useMemo(() => {
    if (!postFor) {
      return true;
    }

    return selectedIntegrations.every((integration) => {
      const find = postFor.missing.find(
        (p) => p.integration.integration.id === integration.id,
      );

      if (!find) {
        return false;
      }

      return find.missing !== 0;
    });
  }, [data, postFor, selectedIntegrations]);

  // content를 받아서 해시태그를 생성하는 함수
  const generateHashTags = useCallback(
    (content: string, index: number) => async () => {
      const res = await fetch(`/posts/generate-hashtags`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      // console.log('');
      // const res = '#asdasdas #asd #asss';

      const { hashtags } = await res.json();

      console.log(hashtags);

      setValue((prev) => {
        prev[index].content = `${content}\n\n ${hashtags}`;
        return [...prev];
      });
    },
    [],
  );

  return (
    <>
      {user?.tier?.ai && (
        <CopilotPopup
          hitEscapeToClose={false}
          clickOutsideToClose={true}
          labels={{
            title: 'AI Content Assistant',
          }}
          className="!z-[499]"
          instructions="You are an assistant that help the user to schedule their social media posts, everytime somebody write something, try to use a function call, if not prompt the user that the request is invalid and you are here to assists with social media posts"
        />
      )}
      <div className={clsx('flex gap-[20px]')}>
        <div
          className={clsx(
            'flex flex-col gap-[16px] whitespace-nowrap transition-all duration-700',
            !expend.expend
              ? 'animate-overflow w-1 flex-1'
              : 'w-0 overflow-hidden',
          )}
        >
          <div className="relative flex flex-1 flex-col gap-[20px] rounded-[4px] border border-[#172034] p-[16px] pt-0">
            <TopTitle title={existingData?.group ? 'Edit Post' : 'Create Post'}>
              <div className="flex items-center">
                <PostToOrganization
                  selected={existingData?.posts?.[0]?.submittedForOrderId!}
                  information={data}
                  onChange={setPostFor}
                />
                <DatePicker onChange={setDateState} date={dateState} />
              </div>
            </TopTitle>

            {!existingData.integration && (
              <PickPlatforms
                integrations={integrations.filter((f) => !f.disabled)}
                selectedIntegrations={[]}
                singleSelect={false}
                onChange={setSelectedIntegrations}
                isMain={true}
              />
            )}
            <div
              id="renderEditor"
              className={clsx(!showHide.hideTopEditor && 'hidden')}
            />
            {!existingData.integration && !showHide.hideTopEditor ? (
              <>
                <div>You are in global editing mode</div>
                {value.map((p, index) => (
                  <Fragment key={`edit_${index}`}>
                    <div>
                      <div className="flex gap-[4px]">
                        <div className="editor flex-1">
                          <Editor
                            order={index}
                            height={value.length > 1 ? 150 : 250}
                            commands={
                              [
                                // ...commands
                                //   .getCommands()
                                //   .filter((f) => f.name === 'image'),
                                // newImage,
                                // postSelector(dateState),
                              ]
                            }
                            value={p.content}
                            preview="edit"
                            // @ts-ignore
                            onChange={changeValue(index)}
                          />

                          {showError &&
                            (!p.content || p.content.length < 6) && (
                              <div className="my-[5px] text-[12px] font-[500] text-[#F97066]">
                                The post should be at least 6 characters long
                              </div>
                            )}
                          <div className="flex justify-between">
                            <div className="flex flex-1">
                              <MultiMediaComponent
                                label="Attachments"
                                description=""
                                value={p.image}
                                name="image"
                                onChange={changeImage(index)}
                              />
                              <div className="flex flex-1 gap-[8px] rounded-br-[8px] pl-2">
                                <Button
                                  className="flex gap-[4px] rounded-[3px] text-[12px] font-[500]"
                                  onClick={generateHashTags(p.content, index)}
                                >
                                  해시태그 생성 (TEST)
                                </Button>
                              </div>
                            </div>
                            <div className="flex rounded-br-[8px] text-[#F97066]">
                              {value.length > 1 && (
                                <Button
                                  onClick={deletePost(index)}
                                  className="flex gap-1 rounded-sm text-[12px] font-semibold"
                                  variant="outline"
                                >
                                  <FaRegTrashCan className="h-4 w-4" />
                                  <div>Delete Post</div>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <UpDownArrow
                            isUp={index !== 0}
                            isDown={
                              value.length !== 0 && value.length !== index + 1
                            }
                            onChange={changePosition(index)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <AddPostButton num={index} onClick={addValue(index)} />
                    </div>
                  </Fragment>
                ))}
              </>
            ) : null}
          </div>
          <div className="relative flex h-[68px] flex-col rounded-[4px] border border-[#172034]">
            <div className="relative flex flex-1 gap-[10px]">
              <div className="absolute right-[16px] flex h-full w-full items-center justify-end gap-[10px]">
                <Button
                  className="text-inputText bg-transparent"
                  onClick={askClose}
                >
                  Cancel
                </Button>
                <Submitted
                  updateOrder={updateOrder}
                  postId={existingData?.posts?.[0]?.id}
                  status={existingData?.posts?.[0]?.approvedSubmitForOrder}
                >
                  {!!existingData.integration && (
                    <Button
                      onClick={schedule('delete')}
                      className="rounded-[4px] border-red-400 text-red-400"
                      variant="secondary"
                    >
                      Delete Post
                    </Button>
                  )}
                  <Button
                    onClick={schedule('draft')}
                    className="rounded-[4px] border-2 border-[#506490]"
                    variant="secondary"
                    disabled={selectedIntegrations.length === 0}
                  >
                    Save as draft
                  </Button>

                  <Button
                    onClick={schedule('schedule')}
                    className="group relative rounded-[4px]"
                    disabled={
                      selectedIntegrations.length === 0 ||
                      !canSendForPublication
                    }
                  >
                    <div className="flex h-full items-center justify-center gap-[5px]">
                      <div className="flex h-full items-center">
                        {!canSendForPublication
                          ? 'Not matching order'
                          : postFor
                            ? 'Submit for order'
                            : !existingData.integration
                              ? 'Add to calendar'
                              : 'Update'}
                      </div>
                      {!postFor && (
                        <div className="flex h-full items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M15.0233 7.14804L9.39828 12.773C9.34604 12.8253 9.284 12.8668 9.21572 12.8951C9.14743 12.9234 9.07423 12.938 9.00031 12.938C8.92639 12.938 8.8532 12.9234 8.78491 12.8951C8.71662 12.8668 8.65458 12.8253 8.60234 12.773L2.97734 7.14804C2.8718 7.04249 2.8125 6.89934 2.8125 6.75007C2.8125 6.6008 2.8718 6.45765 2.97734 6.3521C3.08289 6.24655 3.22605 6.18726 3.37531 6.18726C3.52458 6.18726 3.66773 6.24655 3.77328 6.3521L9.00031 11.5798L14.2273 6.3521C14.2796 6.29984 14.3417 6.25838 14.4099 6.2301C14.4782 6.20181 14.5514 6.18726 14.6253 6.18726C14.6992 6.18726 14.7724 6.20181 14.8407 6.2301C14.909 6.25838 14.971 6.29984 15.0233 6.3521C15.0755 6.40436 15.117 6.46641 15.1453 6.53469C15.1736 6.60297 15.1881 6.67616 15.1881 6.75007C15.1881 6.82398 15.1736 6.89716 15.1453 6.96545C15.117 7.03373 15.0755 7.09578 15.0233 7.14804Z"
                              fill="white"
                            />
                          </svg>
                          <div
                            onClick={postNow}
                            className="border-tableBorder absolute left-0 top-[100%] hidden h-[40px] w-full flex-col justify-center border bg-[#B91C1C] hover:flex group-hover:flex"
                          >
                            Post now
                          </div>
                        </div>
                      )}
                    </div>
                  </Button>
                </Submitted>
              </div>
            </div>
          </div>
        </div>
        <div
          className={clsx(
            'flex flex-1 flex-col gap-[20px] rounded-[4px] border-[#172034] transition-all duration-700',
            !selectedIntegrations.length
              ? 'flex-grow-0 overflow-hidden'
              : 'flex-grow-1 animate-overflow border',
          )}
        >
          <div className="mx-[16px]">
            <TopTitle
              title=""
              expend={expend.show}
              collapse={expend.hide}
              shouldExpend={expend.expend}
            />
          </div>
          {!!selectedIntegrations.length && (
            <div className="flex flex-1 flex-col p-[16px] pt-0">
              <ProvidersOptions
                integrations={selectedIntegrations}
                editorValue={value}
                date={dateState}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
