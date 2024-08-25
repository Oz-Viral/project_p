'use client';

import { LuLoader2 } from 'react-icons/lu';

export const LoadingComponent = () => {
  return (
    <div className="flex flex-1 justify-center pt-[100px]">
      <LuLoader2 className="h-20 w-20 animate-spin" />
    </div>
  );
};
