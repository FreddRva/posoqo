// types/navbar.ts
export type NavItem = {
  label: string;
  href?: string;
  dropdown?: boolean;
  highlight?: boolean;
  subitems?: {
    label: string;
    href: string;
    description?: string;
  }[];
};

export type UserWithRole = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

