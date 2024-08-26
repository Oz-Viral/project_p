import React, { FC } from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { LuPlusCircle } from 'react-icons/lu';
import { Button } from '@kursor/react/components/ui/button';

export const AddPostButton: FC<{ onClick: () => void; num: number }> = (
  props,
) => {
  const { onClick, num } = props;

  useCopilotAction({
    name: 'addPost_' + num,
    description: 'Add a post after the post number ' + (num + 1),
    handler: () => {
      onClick();
    },
  });

  return (
    <Button
      onClick={onClick}
      className="flex gap-1 rounded-sm text-[12px] font-semibold"
      variant="secondary"
    >
      <LuPlusCircle className="h-4 w-4" />
      <div>Add comment</div>
    </Button>
  );
};
