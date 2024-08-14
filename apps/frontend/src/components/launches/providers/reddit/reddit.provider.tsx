import { FC, useCallback } from 'react';
import { withProvider } from '@kursor/frontend/components/launches/providers/high.order.provider';
import { useIntegration } from '@kursor/frontend/components/launches/helpers/use.integration';
import { useFormatting } from '@kursor/frontend/components/launches/helpers/use.formatting';
import { Subreddit } from '@kursor/frontend/components/launches/providers/reddit/subreddit';
import { useSettings } from '@kursor/frontend/components/launches/helpers/use.values';
import { useFieldArray, useWatch } from 'react-hook-form';
import { Button } from '@kursor/react/form/button';
import {
  RedditSettingsDto,
  RedditSettingsValueDto,
} from '@kursor/nestjs-libraries/dtos/posts/providers-settings/reddit.dto';
import clsx from 'clsx';
import { useMediaDirectory } from '@kursor/react/helpers/use.media.directory';
import { deleteDialog } from '@kursor/react/helpers/delete.dialog';
import MDEditor from '@uiw/react-md-editor';
import interClass from '@kursor/react/helpers/inter.font';
import Image from 'next/image';

const RenderRedditComponent: FC<{
  type: string;
  images?: Array<{ id: string; path: string }>;
}> = (props) => {
  const { value: topValue } = useIntegration();
  const showMedia = useMediaDirectory();

  const { type, images } = props;

  const [firstPost] = topValue;

  switch (type) {
    case 'self':
      return (
        <MDEditor.Markdown
          style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}
          skipHtml={true}
          disallowedElements={['img']}
          source={firstPost?.content}
        />
      );
    case 'link':
      return (
        <div className="flex h-[375px] items-center justify-center rounded-[16px]">
          Link
        </div>
      );
    case 'media':
      return (
        <div className="flex h-[375px] items-center justify-center rounded-[16px]">
          {!!images?.length &&
            images.map((image, index) => (
              <a
                key={`image_${index}`}
                href={showMedia.set(image.path)}
                className="h-full flex-1"
                target="_blank"
              >
                <img
                  className="h-full w-full object-cover"
                  src={showMedia.set(image.path)}
                />
              </a>
            ))}
        </div>
      );
  }

  return <></>;
};

const RedditPreview: FC = (props) => {
  const { value: topValue, integration } = useIntegration();
  const settings = useWatch({
    name: 'subreddit',
  }) as Array<RedditSettingsValueDto>;

  const [, ...restOfPosts] = useFormatting(topValue, {
    removeMarkdown: true,
    saveBreaklines: true,
    specialFunc: (text: string) => {
      return text.slice(0, 280);
    },
  });

  if (!settings || !settings.length) {
    return <>Please add at least one Subreddit from the settings</>;
  }

  return (
    <div className="flex w-full flex-col gap-[40px]">
      {settings
        .filter(({ value }) => value?.subreddit)
        .map(({ value }, index) => (
          <div
            key={index}
            className={clsx(
              `flex w-full flex-col bg-[#0B1416] p-[10px] ${interClass} border-tableBorder border`,
            )}
          >
            <div className="flex flex-col">
              <div className="flex flex-row gap-[8px]">
                <div className="h-[40px] w-[40px] rounded-full bg-white" />
                <div className="flex flex-col">
                  <div className="text-[12px] font-[700]">
                    {value.subreddit}
                  </div>
                  <div className="text-[12px]">{integration?.name}</div>
                </div>
              </div>
              <div className="mb-[16px] text-[24px] font-[600]">
                {value.title}
              </div>
              <RenderRedditComponent type={value.type} images={value.media} />
              <div
                className={clsx(
                  restOfPosts.length && 'mt-[40px] flex flex-col gap-[20px]',
                )}
              >
                {restOfPosts.map((p, index) => (
                  <div className="flex gap-[8px]" key={index}>
                    <div className="relative h-[32px] w-[32px]">
                      <Image
                        width={48}
                        height={48}
                        src={integration?.picture!}
                        alt="x"
                        className="relative z-[2] h-full w-full rounded-full"
                      />
                      <Image
                        width={24}
                        height={24}
                        src={`/icons/platforms/${integration?.identifier!}.png`}
                        alt="x"
                        className="absolute -bottom-[5px] -right-[5px] z-[2] rounded-full"
                      />
                    </div>
                    <div className="flex w-full flex-1 flex-col rounded-[8px] pb-[8px] pr-[64px] leading-[16px]">
                      <div className="text-[14px] font-[600]">
                        {integration?.name}
                      </div>
                      <MDEditor.Markdown
                        style={{ whiteSpace: 'pre-wrap' }}
                        skipHtml={true}
                        source={p.text}
                        disallowedElements={['img']}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

const RedditSettings: FC = () => {
  const { register, control } = useSettings();
  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'subreddit', // unique name for your Field Array
  });

  const addField = useCallback(() => {
    append({});
  }, [fields, append]);

  const deleteField = useCallback(
    (index: number) => async () => {
      if (
        !(await deleteDialog('Are you sure you want to delete this Subreddit?'))
      )
        return;
      remove(index);
    },
    [fields, remove],
  );

  return (
    <>
      <div className="mb-[20px] flex flex-col gap-[20px]">
        {fields.map((field, index) => (
          <div key={field.id} className="relative flex flex-col">
            <div
              onClick={deleteField(index)}
              className="absolute -left-[10px] -top-[10px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-red-600 text-white"
            >
              x
            </div>
            <Subreddit {...register(`subreddit.${index}.value`)} />
          </div>
        ))}
      </div>
      <Button onClick={addField}>Add Subreddit</Button>
      {fields.length === 0 && (
        <div className="mt-[10px] text-[12px] text-red-500">
          Please add at least one Subreddit
        </div>
      )}
    </>
  );
};

export default withProvider(
  RedditSettings,
  RedditPreview,
  RedditSettingsDto,
  undefined,
  10000,
);
