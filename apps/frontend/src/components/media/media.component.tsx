'use client';

import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import { Media } from '@prisma/client';
import { useMediaDirectory } from '@kursor/react/helpers/use.media.directory';
import { useSettings } from '@kursor/frontend/components/launches/helpers/use.values';
import EventEmitter from 'events';
import { TopTitle } from '@kursor/frontend/components/launches/helpers/top.title.component';
import clsx from 'clsx';
import { VideoFrame } from '@kursor/react/helpers/video.frame';
import { useToaster } from '@kursor/react/toaster/toaster';
import { LoadingComponent } from '@kursor/frontend/components/layout/loading';
import { MultipartFileUploader } from '@kursor/frontend/components/media/new.uploader';
import dynamic from 'next/dynamic';
import { useUser } from '@kursor/frontend/components/layout/user.context';
import { useTranslations } from 'next-intl';

import { PiImages } from 'react-icons/pi';
import { Button } from '@kursor/react/components/ui/button';

const Polonto = dynamic(
  () => import('@kursor/frontend/components/launches/polonto'),
);
const showModalEmitter = new EventEmitter();

export const ShowMediaBoxModal: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [callBack, setCallBack] =
    useState<(params: { id: string; path: string }) => void | undefined>();

  const closeModal = useCallback(() => {
    setShowModal(false);
    setCallBack(undefined);
  }, []);

  useEffect(() => {
    showModalEmitter.on('show-modal', (cCallback) => {
      setShowModal(true);
      setCallBack(() => cCallback);
    });
    return () => {
      showModalEmitter.removeAllListeners('show-modal');
    };
  }, []);
  if (!showModal) return null;

  return (
    <div>
      <MediaBox setMedia={callBack!} closeModal={closeModal} />
    </div>
  );
};

export const showMediaBox = (
  callback: (params: { id: string; path: string }) => void,
) => {
  showModalEmitter.emit('show-modal', callback);
};

const CHUNK_SIZE = 1024 * 1024;

export const MediaBox: FC<{
  setMedia: (params: { id: string; path: string }) => void;
  type?: 'image' | 'video';
  closeModal: () => void;
}> = (props) => {
  const { setMedia, type, closeModal } = props;
  const [pages, setPages] = useState(0);
  const [mediaList, setListMedia] = useState<Media[]>([]);
  const fetch = useFetch();
  const mediaDirectory = useMediaDirectory();

  const [loading, setLoading] = useState(false);

  const loadMedia = useCallback(async () => {
    return (await fetch('/media')).json();
  }, []);

  const setNewMedia = useCallback(
    (media: Media) => () => {
      setMedia(media);
      closeModal();
    },
    [],
  );

  const { data, mutate } = useSWR('get-media', loadMedia);

  useEffect(() => {
    if (data?.pages) {
      setPages(data.pages);
    }
    if (data?.results && data?.results?.length) {
      setListMedia([...data.results]);
    }
  }, [data]);

  return (
    <div className="animate-fade fixed left-0 top-0 z-[300] min-h-full w-full bg-black/80 p-[60px]">
      <div className="border-tableBorder relative h-full w-full rounded-xl border-2 bg-[#0B101B] px-[20px] pb-[20px]">
        <div className="flex">
          <div className="flex-1">
            <TopTitle title="Media Library" />
          </div>
          <button
            onClick={closeModal}
            className="mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-tableBorder mantine-Modal-close mantine-1dcetaa absolute right-[20px] top-[20px] cursor-pointer bg-black outline-none"
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

          {!!mediaList.length && (
            <button
              className="pointer hover:bg-third focus:text-primary-500 group absolute right-[40px] top-[7px] flex rounded-lg bg-transparent px-2.5 py-2.5 text-sm font-semibold text-gray-800 transition-all hover:bg-gray-100"
              type="button"
            >
              <div className="relative flex items-center justify-center gap-2">
                <MultipartFileUploader
                  onUploadSuccess={mutate}
                  allowedFileTypes={
                    type === 'video'
                      ? 'video/mp4'
                      : type === 'image'
                        ? 'image/*'
                        : 'image/*,video/mp4'
                  }
                />
              </div>
            </button>
          )}
        </div>
        <div
          className={clsx(
            'mt-[35px] flex flex-wrap gap-[10px] pt-[20px]',
            !!mediaList.length && 'items-center justify-center text-white',
          )}
        >
          {!mediaList.length && (
            <div className="flex flex-col text-center">
              <div>You don{"'"}t have any assets yet.</div>
              <div>Click the button below to upload one</div>
              <div className="mt-[10px] flex flex-col-reverse items-center justify-center gap-[10px]">
                <MultipartFileUploader
                  onUploadSuccess={mutate}
                  allowedFileTypes={
                    type === 'video'
                      ? 'video/mp4'
                      : type === 'image'
                        ? 'image/*'
                        : 'image/*,video/mp4'
                  }
                />
              </div>
            </div>
          )}
          {mediaList
            .filter((f) => {
              if (type === 'video') {
                return f.path.indexOf('mp4') > -1;
              } else if (type === 'image') {
                return f.path.indexOf('mp4') === -1;
              }
              return true;
            })
            .map((media) => (
              <div
                key={media.id}
                className="border-tableBorder flex h-[120px] w-[120px] cursor-pointer border-2"
                onClick={setNewMedia(media)}
              >
                {media.path.indexOf('mp4') > -1 ? (
                  <VideoFrame url={mediaDirectory.set(media.path)} />
                ) : (
                  <img
                    className="h-full w-full object-cover"
                    src={mediaDirectory.set(media.path)}
                  />
                )}
              </div>
            ))}
          {loading && (
            <div className="border-tableBorder relative flex h-[200px] w-[200px] cursor-pointer border-2">
              <div className="absolute left-0 top-0 -mt-[50px] flex h-full w-full items-center justify-center">
                <LoadingComponent />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MultiMediaComponent: FC<{
  label: string;
  description: string;
  value?: Array<{ path: string; id: string }>;
  name: string;
  error?: any;
  onChange: (event: {
    target: { name: string; value?: Array<{ id: string; path: string }> };
  }) => void;
}> = (props) => {
  const { name, label, error, description, onChange, value } = props;
  const user = useUser();

  const t = useTranslations('media');

  useEffect(() => {
    if (value) {
      setCurrentMedia(value);
    }
  }, []);

  const [modal, setShowModal] = useState(false);
  const [mediaModal, setMediaModal] = useState(false);

  const [currentMedia, setCurrentMedia] = useState(value);
  const mediaDirectory = useMediaDirectory();

  const changeMedia = useCallback(
    (m: { path: string; id: string }) => {
      const newMedia = [...(currentMedia || []), m];
      setCurrentMedia(newMedia);
      onChange({ target: { name, value: newMedia } });
    },
    [currentMedia],
  );

  const showModal = useCallback(() => {
    setShowModal(!modal);
  }, [modal]);

  const closeDesignModal = useCallback(() => {
    setMediaModal(false);
  }, [modal]);

  const clearMedia = useCallback(
    (topIndex: number) => () => {
      const newMedia = currentMedia?.filter((f, index) => index !== topIndex);
      setCurrentMedia(newMedia);
      onChange({ target: { name, value: newMedia } });
    },
    [currentMedia],
  );

  const designMedia = useCallback(() => {
    setMediaModal(true);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-[8px] rounded-bl-[8px]">
        {modal && <MediaBox setMedia={changeMedia} closeModal={showModal} />}
        {mediaModal && !!user?.tier?.ai && (
          <Polonto setMedia={changeMedia} closeModal={closeDesignModal} />
        )}
        <div className="flex gap-[10px]">
          <div className="flex">
            <Button onClick={showModal} className="w-[127px] rounded-sm">
              <div className="flex items-center gap-1">
                <PiImages />
                <div className="text-[12px] font-[500]">{t('insertMedia')}</div>
              </div>
            </Button>

            <Button
              onClick={designMedia}
              className="ml-[10px] w-[127px] rounded-sm"
            >
              <div className="flex items-center gap-1">
                <PiImages />
                <div className="text-[12px] font-[500]">{t('designMedia')}</div>
              </div>
            </Button>
          </div>

          {!!currentMedia &&
            currentMedia.map((media, index) => (
              <>
                <div
                  key={index}
                  className="border-tableBorder relative flex h-[40px] w-[40px] cursor-pointer border-2"
                >
                  <div
                    onClick={() => window.open(mediaDirectory.set(media.path))}
                  >
                    {media.path.indexOf('mp4') > -1 ? (
                      <VideoFrame url={mediaDirectory.set(media.path)} />
                    ) : (
                      <img
                        className="h-full w-full object-cover"
                        src={mediaDirectory.set(media.path)}
                      />
                    )}
                  </div>
                  <div
                    onClick={clearMedia(index)}
                    className="absolute -right-[4px] -top-[4px] flex h-[15px] w-[15px] items-center justify-center rounded-full bg-red-800 text-white"
                  >
                    x
                  </div>
                </div>
              </>
            ))}
        </div>
      </div>
      <div className="text-[12px] text-red-400">{error}</div>
    </>
  );
};

// 블로그용 컴포넌트
export const MediaComponent: FC<{
  label: string;
  description: string;
  value?: { path: string; id: string };
  name: string;
  onChange: (event: {
    target: { name: string; value?: { id: string; path: string } };
  }) => void;
  type?: 'image' | 'video';
  width?: number;
  height?: number;
}> = (props) => {
  const { name, type, label, description, onChange, value, width, height } =
    props;
  const { getValues } = useSettings();
  const user = useUser();
  useEffect(() => {
    const settings = getValues()[props.name];
    if (settings) {
      setCurrentMedia(settings);
    }
  }, []);
  const [modal, setShowModal] = useState(false);
  const [mediaModal, setMediaModal] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(value);
  const mediaDirectory = useMediaDirectory();

  const closeDesignModal = useCallback(() => {
    setMediaModal(false);
  }, [modal]);

  const showDesignModal = useCallback(() => {
    setMediaModal(true);
  }, [modal]);

  const changeMedia = useCallback((m: { path: string; id: string }) => {
    setCurrentMedia(m);
    onChange({ target: { name, value: m } });
  }, []);

  const showModal = useCallback(() => {
    setShowModal(!modal);
  }, [modal]);

  const clearMedia = useCallback(() => {
    setCurrentMedia(undefined);
    onChange({ target: { name, value: undefined } });
  }, [value]);

  return (
    <div className="flex flex-col gap-[8px]">
      {modal && (
        <MediaBox setMedia={changeMedia} closeModal={showModal} type={type} />
      )}
      {mediaModal && !!user?.tier?.ai && (
        <Polonto
          width={width}
          height={height}
          setMedia={changeMedia}
          closeModal={closeDesignModal}
        />
      )}
      <div className="text-[14px]">{label}</div>
      <div className="text-[12px]">{description}</div>
      {!!currentMedia && (
        <div className="border-tableBorder my-[20px] h-[200px] w-[200px] cursor-pointer border-2">
          <img
            className="h-full w-full object-cover"
            src={mediaDirectory.set(currentMedia.path)}
            onClick={() => window.open(mediaDirectory.set(currentMedia.path))}
          />
        </div>
      )}
      <div className="flex gap-[5px]">
        <Button onClick={showModal}>Select</Button>
        <Button onClick={showDesignModal} className="!bg-[#832AD5]">
          Editor
        </Button>
        <Button onClick={clearMedia}>Clear</Button>
      </div>
    </div>
  );
};
