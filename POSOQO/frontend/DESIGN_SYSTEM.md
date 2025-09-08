# POSOQO Design System

## Paleta de Colores

### Colores Principales
- **Dorado Primario**: `#D4AF37`
- **Dorado Claro**: `#FFD700`
- **Dorado Oscuro**: `#B8860B`
- **Dorado Acento**: `#F4E4BC`

- **Negro Primario**: `#000000`
- **Negro Suave**: `#1A1A1A`
- **Negro Medio**: `#2A2A2A`

- **Blanco Primario**: `#FFFFFF`
- **Blanco Suave**: `#F8F8F8`

## Componentes UI

### Button
```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Texto del botón
</Button>
```

**Variantes:**
- `primary`: Fondo dorado con texto negro
- `secondary`: Borde dorado con fondo transparente
- `outline`: Borde simple dorado

**Tamaños:**
- `sm`: Pequeño
- `md`: Mediano (por defecto)
- `lg`: Grande

### Card
```tsx
<Card hover={true} glow={true} onClick={handleClick}>
  Contenido de la tarjeta
</Card>
```

**Props:**
- `hover`: Efecto de elevación al pasar el mouse
- `glow`: Efecto de resplandor dorado
- `onClick`: Función de click (opcional)

### ProductCard
```tsx
<ProductCard 
  product={product} 
  onClick={handleProductClick}
  className="custom-class"
/>
```

### SectionHeader
```tsx
<SectionHeader
  title="Título de la sección"
  subtitle="SUBTÍTULO"
  icon={<Icon className="w-6 h-6" />}
/>
```

## Clases CSS Utilitarias

### Fondos
- `.bg-premium`: Fondo negro con gradiente
- `.bg-gold`: Fondo dorado con gradiente

### Texto
- `.text-gold`: Texto con gradiente dorado
- `.text-glow`: Texto con efecto de resplandor

### Bordes
- `.border-gold`: Borde dorado con gradiente

### Efectos
- `.glass-gold`: Efecto de vidrio dorado
- `.shadow-gold`: Sombra dorada
- `.hover-lift`: Efecto de elevación en hover
- `.animate-sparkle`: Animación de partículas doradas
- `.animate-float`: Animación de flotación

### Botones
- `.btn-primary`: Botón primario dorado
- `.btn-secondary`: Botón secundario con borde

### Tarjetas
- `.card-premium`: Tarjeta con estilo premium

## Estructura de Archivos

```
src/
├── styles/
│   └── design-system.css      # Sistema de diseño principal
├── components/
│   └── ui/
│       ├── Button.tsx         # Componente de botón
│       ├── Card.tsx           # Componente de tarjeta
│       ├── ProductCard.tsx    # Tarjeta de producto
│       └── SectionHeader.tsx  # Encabezado de sección
└── app/
    ├── globals.css            # Estilos globales
    └── page.tsx              # Página principal
```

## Uso Recomendado

### 1. Importar el sistema de diseño
```tsx
import '@/styles/design-system.css';
```

### 2. Usar componentes UI
```tsx
import { Button, Card, ProductCard } from '@/components/ui';
```

### 3. Aplicar clases utilitarias
```tsx
<div className="bg-premium text-gold glass-gold hover-lift">
  Contenido con estilo premium
</div>
```

## Personalización

### Agregar nuevos colores
1. Actualizar `design-system.css` con las nuevas variables CSS
2. Agregar los colores a `tailwind.config.js`
3. Crear clases utilitarias correspondientes

### Crear nuevos componentes
1. Crear archivo en `src/components/ui/`
2. Seguir el patrón de los componentes existentes
3. Documentar props y uso en este archivo

## Mejores Prácticas

1. **Consistencia**: Usar siempre los componentes UI en lugar de clases CSS directas
2. **Reutilización**: Crear componentes reutilizables para elementos comunes
3. **Mantenibilidad**: Mantener el sistema de diseño actualizado y documentado
4. **Performance**: Usar clases CSS en lugar de estilos inline cuando sea posible
5. **Accesibilidad**: Incluir props de accesibilidad en todos los componentes

## Ejemplos de Uso

### Página de productos
```tsx
<section className="py-20 bg-premium">
  <SectionHeader
    title="Nuestros Productos"
    subtitle="CERVEZAS ARTESANALES"
    icon={<Beer className="w-6 h-6" />}
  />
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {products.map(product => (
      <ProductCard
        key={product.id}
        product={product}
        onClick={handleProductClick}
      />
    ))}
  </div>
</section>
```

### Formulario de contacto
```tsx
<Card className="max-w-md mx-auto">
  <h3 className="text-2xl font-bold text-gold mb-6">Contáctanos</h3>
  <form className="space-y-4">
    <input className="w-full px-4 py-3 rounded bg-black/50 border border-yellow-400/30 text-white" />
    <Button variant="primary" size="lg" className="w-full">
      Enviar mensaje
    </Button>
  </form>
</Card>
```
