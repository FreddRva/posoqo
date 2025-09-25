import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category_id?: string;
  description?: string;
}

export default function FeaturedFoods() {
  const [foods, setFoods] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFoods() {
      try {
        const categoriesResponse = await apiFetch<any>("/categories");
        const categories = categoriesResponse.data || categoriesResponse;
        
        // Buscar categoría "Comidas" (con diferentes variaciones)
        const comidasCategory = categories.find((c: any) => 
          c.name.toLowerCase() === "comidas" || 
          c.name.toLowerCase() === "comida" ||
          c.name.toLowerCase() === "food" ||
          c.name.toLowerCase() === "gastronomía"
        );
        
        const res = await apiFetch<{ success: boolean; data: Product[] }>("/products");
        
        let comidasDestacadas = [];
        
        if (comidasCategory) {
          // Si encontramos categoría "Comidas", filtrar por esa categoría
          comidasDestacadas = res.data.filter((p: any) => {
            const isComida = p.category_id === comidasCategory.id || p.subcategory === comidasCategory.id;
            const isFeatured = p.is_featured;
            return isComida && isFeatured;
          }).slice(0, 6);
        } else {
          // Fallback: usar la lógica anterior (productos destacados que NO sean cervezas)
          const cervezaCategory = categories.find((c: any) => c.name === "Cervezas");
          comidasDestacadas = res.data.filter((p: any) => {
            const isCervezaByCategory = p.category_id === cervezaCategory?.id;
            const isCervezaBySubcategory = p.subcategory === cervezaCategory?.id;
            const isCerveza = isCervezaByCategory || isCervezaBySubcategory;
            return !isCerveza && p.is_featured;
          }).slice(0, 6);
        }
        
        setFoods(comidasDestacadas);
      } catch (error) {
        setFoods([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFoods();
  }, []);

  if (loading) return null;
  if (!foods.length) return null;

  return (
    <section className="my-16 max-w-7xl mx-auto px-6">
      {/* Título de la sección */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-black text-[#D4AF37] mb-4 tracking-wider">
          Comidas destacadas
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] mx-auto rounded-full"></div>
      </motion.div>

      {/* Grid de comidas con diseño profesional */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {foods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-3xl p-6 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:-translate-y-2 overflow-hidden"
          >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
              {/* Imagen flotante con diseño para comida */}
              <div className="flex-shrink-0 w-full lg:w-48">
                <div className="relative h-72 group">
                  {/* Efecto de resplandor para comida */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 rounded-3xl blur-2xl scale-110 group-hover:scale-125 transition-all duration-500"></div>
                  
                  {/* Imagen flotante con sombra pronunciada */}
                  <div className="relative h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={food.image_url && !food.image_url.startsWith('http') ? `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com'}${food.image_url}` : (food.image_url || "/file.svg")}
                      alt={food.name}
                      className="max-w-full max-h-full object-cover rounded-2xl drop-shadow-2xl filter brightness-110 contrast-110"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-7xl">🍽️</span></div>';
                        }
                      }}
                    />
                  </div>
                  
                  {/* Borde dorado en hover */}
                  <div className="absolute inset-0 border-2 border-[#D4AF37]/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
              
              {/* Información de la comida al costado */}
              <div className="flex-1 text-center lg:text-left">
                {/* Título principal */}
                <h3 className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors duration-300 mb-4">
                  {food.name}
                </h3>
                
                {/* Descripción si existe */}
                {food.description && (
                  <p className="text-gray-300 leading-relaxed mb-4 text-sm">
                    {food.description}
                  </p>
                )}
                
                {/* Precio destacado */}
                <div className="text-3xl font-bold text-[#D4AF37] mb-6">
                  S/ {food.price.toFixed(2)}
                </div>
                
                {/* Botón de acción */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href={`/products/${food.id}`} 
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 group-hover:from-[#FFD700] group-hover:to-[#D4AF37] inline-block text-center"
                  >
                    Ver Detalles
                  </Link>
                </motion.div>
              </div>
            </div>
            
            {/* Efecto de resplandor en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
} 