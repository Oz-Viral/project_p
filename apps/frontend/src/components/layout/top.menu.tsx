'use client';

import { FC } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { useUser } from '@kursor/frontend/components/layout/user.context';
import { useTranslations } from 'next-intl';

export const menuItems = [
  {
    name: 'Calendar',
    icon: 'launches',
    path: '/launches',
  },
  {
    name: 'Dashboard',
    icon: 'analytics',
    path: '/analytics',
  },
  {
    name: 'Settings',
    icon: 'settings',
    path: '/settings',
    role: ['ADMIN', 'SUPERADMIN'],
  },
  // {
  //   name: 'Marketplace',
  //   icon: 'marketplace',
  //   path: '/marketplace',
  // },
  {
    name: 'Messages',
    icon: 'messages',
    path: '/messages',
  },
  {
    name: 'Billing',
    icon: 'billing',
    path: '/billing',
    role: ['ADMIN', 'SUPERADMIN'],
    requireBilling: true,
  },
];

export const TopMenu: FC = () => {
  const path = usePathname();
  const user = useUser();
  const t = useTranslations('topMenu');

  return (
    <div className="animate-normalFadeDown flex h-full flex-col">
      <ul className="flex flex-1 items-center gap-5 text-[18px]">
        {menuItems
          .filter((f) => {
            if (f.requireBilling && process.env.isBillingEnabled === 'false') {
              return false;
            }
            if (f.role) {
              return f.role.includes(user?.role!);
            }
            return true;
          })
          .map((item, index) => (
            <li key={item.name}>
              <Link
                prefetch={true}
                href={item.path}
                className={clsx(
                  'box flex items-center gap-2',
                  menuItems
                    .filter((f) => {
                      if (f.role) {
                        return f.role.includes(user?.role!);
                      }
                      return true;
                    })
                    .map((p) => (path.indexOf(p.path) > -1 ? index : -1))
                    .indexOf(index) === index
                    ? 'text-primary showbox'
                    : 'text-gray',
                )}
              >
                <span>{t(item.name)}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};
