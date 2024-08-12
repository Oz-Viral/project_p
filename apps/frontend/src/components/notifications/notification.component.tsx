'use client';

import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { FC, useCallback, useState } from 'react';
import clsx from 'clsx';
import { useClickAway } from '@uidotdev/usehooks';
import interClass from '@kursor/react/helpers/inter.font';
import ReactLoading from 'react-loading';
import { IoNotificationsOutline } from 'react-icons/io5';

function replaceLinks(text: string) {
  const urlRegex =
    /(\bhttps?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  return text.replace(
    urlRegex,
    '<a class="cursor-pointer underline font-bold" target="_blank" href="$1">$1</a>',
  );
}

export const ShowNotification: FC<{
  notification: { createdAt: string; content: string };
  lastReadNotification: string;
}> = (props) => {
  const { notification } = props;
  const [newNotification] = useState(
    new Date(notification.createdAt) > new Date(props.lastReadNotification),
  );

  return (
    <div
      className={clsx(
        `border-tableBorder border-b px-[16px] py-[10px] transition-colors last:border-b-0 ${interClass} overflow-hidden text-ellipsis`,
        newNotification && 'animate-newMessages bg-[#7236f1] font-bold',
      )}
      dangerouslySetInnerHTML={{ __html: replaceLinks(notification.content) }}
    />
  );
};
export const NotificationOpenComponent = () => {
  const fetch = useFetch();
  const loadNotifications = useCallback(async () => {
    return await (await fetch('/notifications/list')).json();
  }, []);

  const { data, isLoading } = useSWR('notifications', loadNotifications);

  return (
    <div className="animate-normalFadeDown border-tableBorder absolute right-0 top-[100%] mt-[10px] flex min-h-[200px] w-[420px] flex-col rounded-[16px] border opacity-0">
      <div
        className={`border-tableBorder border-b p-[16px] ${interClass} font-bold`}
      >
        Notifications
      </div>

      <div className="flex flex-col">
        {isLoading && (
          <div className="flex flex-1 justify-center pt-12">
            <ReactLoading type="spin" color="#fff" width={36} height={36} />
          </div>
        )}
        {!isLoading && !data.notifications.length && (
          <div className="mt-[20px] flex flex-1 items-center justify-center p-[16px] text-center">
            No notifications
          </div>
        )}
        {!isLoading &&
          data.notifications.map(
            (
              notification: { createdAt: string; content: string },
              index: number,
            ) => (
              <ShowNotification
                notification={notification}
                lastReadNotification={data.lastReadNotifications}
                key={`notifications_${index}`}
              />
            ),
          )}
      </div>
    </div>
  );
};

const NotificationComponent = () => {
  const fetch = useFetch();
  const [show, setShow] = useState(false);

  const loadNotifications = useCallback(async () => {
    return await (await fetch('/notifications')).json();
  }, []);

  const { data, mutate } = useSWR('notifications-list', loadNotifications);

  const changeShow = useCallback(() => {
    mutate(
      { ...data, total: 0 },
      {
        revalidate: false,
      },
    );
    setShow(!show);
  }, [show, data]);

  const ref = useClickAway<HTMLDivElement>(() => setShow(false));

  return (
    <div className="relative cursor-pointer select-none" ref={ref}>
      <div onClick={changeShow}>
        {data && data.total > 0 && (
          <div className="absolute -left-[2px] -top-[2px] flex h-[13px] w-[13px] items-center justify-center rounded-full bg-red-500 text-center text-[10px]">
            {data.total}
          </div>
        )}
        <IoNotificationsOutline className="h-6 w-6" />
      </div>
      {show && <NotificationOpenComponent />}
    </div>
  );
};

export default NotificationComponent;
