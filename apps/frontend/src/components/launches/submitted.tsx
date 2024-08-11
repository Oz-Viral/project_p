import React, { FC, ReactNode, useCallback } from 'react';
import { Button } from '@kursor/react/form/button';
import { useFetch } from '@kursor/helpers/utils/custom.fetch';
import { deleteDialog } from '@kursor/react/helpers/delete.dialog';

export const Submitted: FC<{
  children: ReactNode;
  postId: string;
  status: 'YES' | 'NO' | 'WAITING_CONFIRMATION';
  updateOrder: () => void;
}> = (props) => {
  const { postId, updateOrder, status, children } = props;
  const fetch = useFetch();

  const cancel = useCallback(async () => {
    if (!await deleteDialog('Are you sure you want to cancel this publication?', 'Yes')) {
      return ;
    }
    await fetch(`/marketplace/posts/${postId}/cancel`, {
      method: 'POST'
    });

    updateOrder();
  }, [postId]);

  if (!status || status === 'NO') {
    return <>{children}</>;
  }

  return (
    <Button
      className="rounded-[4px] border-2 border-red-400 text-red-400"
      secondary={true}
      onClick={cancel}
    >
      Cancel publication
    </Button>
  );
};
