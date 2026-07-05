import {
  House,
  Users,
  SquaresFour,
  Flag,
  Trophy,
  Receipt,
  CreditCard,
  Tag,
  type Icon,
} from '@phosphor-icons/react';

export interface NavItem {
  key: string;
  path: string;
  icon: Icon;
}

export interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    labelKey: 'nav.sectionMain',
    items: [
      { key: 'overview', path: '/', icon: House },
      { key: 'users', path: '/users', icon: Users },
      { key: 'content', path: '/content', icon: SquaresFour },
      { key: 'reports', path: '/reports', icon: Flag },
      { key: 'cup', path: '/cup', icon: Trophy },
    ],
  },
  {
    labelKey: 'nav.sectionRevenue',
    items: [
      { key: 'payments', path: '/payments', icon: Receipt },
      { key: 'plans', path: '/plans', icon: CreditCard },
    ],
  },
  {
    labelKey: 'nav.sectionConfig',
    items: [{ key: 'categories', path: '/categories', icon: Tag }],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
