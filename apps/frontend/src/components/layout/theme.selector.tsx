'use client';

import * as React from 'react';
import { RxMoon as MoonIcon, RxSun as SunIcon } from 'react-icons/rx';
import { useTheme } from 'next-themes';
import { Button } from '@kursor/react/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@kursor/react/components/ui/dropdown-menu';

export const ThemeSelector = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6">
          <SunIcon className="absolute h-6 w-6 dark:hidden" />
          <MoonIcon className="h-6 w-6 dark:absolute" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[99999]" align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setTheme('light')}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
