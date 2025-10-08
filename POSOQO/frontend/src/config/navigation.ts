// config/navigation.ts
import { NavItem } from '@/types/navbar';

export const navItems: NavItem[] = [
  { label: "Nosotros", href: "/sobre-nosotros" },
  { 
    label: "Productos", 
    dropdown: true, 
    subitems: [
      { 
        label: "Cervezas", 
        href: "/products?filter=cerveza",
        description: "Nuestra colección de cervezas únicas"
      },
      { 
        label: "Comidas", 
        href: "/products?filter=comidas",
        description: "Platos que complementan nuestras cervezas"
      },
      { 
        label: "Refrescos", 
        href: "/products?filter=refrescos",
        description: "Bebidas refrescantes artesanales"
      },
      { 
        label: "Todos los productos", 
        href: "/products",
        description: "Explora todo nuestro catálogo"
      }
    ]
  },
  { label: "Taprooms", href: "/eventos" },
  { 
    label: "Comunidad",
    dropdown: true,
    subitems: [
      {
        label: "Club POSOQO",
        href: "/club",
        description: "Únete a nuestra comunidad exclusiva"
      },
      {
        label: "Reservas",
        href: "/reservas",
        description: "Reserva tu mesa"
      },
      {
        label: "Eventos",
        href: "/eventos",
        description: "Próximos eventos y actividades"
      }
    ]
  },
  { label: "Contacto", href: "/contacto" }
];

export const userMenuItems = [
  { label: "Mi perfil", href: "/profile", icon: "User" },
  { label: "Mis pedidos", href: "/orders", icon: "Package" },
  { label: "Favoritos", href: "/favorites", icon: "Heart" },
  { label: "Mis pagos", href: "/profile/payments", icon: "CreditCard" },
];

export const adminMenuItems = [
  { label: "Dashboard", href: "/dashboard", icon: "Crown" },
];

