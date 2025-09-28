import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UtensilsCrossed, Calendar, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ProductModal from "./ProductModal";

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  image?: string;
  category?: string;
  style?: string;
  abv?: string;
  ibu?: string;
  color?: string;
  image_url?: string;
}

export default function FeaturedFoods() {
  const [foods, setFoods] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

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
            
            <div className="relative z-10 text-center">
              {/* Imagen flotante profesional */}
              <div className="relative w-full h-80 mb-6 group">
                {/* Efecto de resplandor sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/10 rounded-3xl blur-xl scale-110 group-hover:scale-125 transition-all duration-500"></div>
                
                {/* Imagen flotante con sombra elegante */}
                <div className="relative h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <img
              src={food.image_url && !food.image_url.startsWith('http') ? `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com'}${food.image_url}` : (food.image_url || "/file.svg")}
              alt={food.name}
                    className="max-w-full max-h-full object-cover rounded-3xl drop-shadow-2xl filter brightness-105 contrast-105 saturate-110"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-8xl">🍽️</span></div>';
                      }
                    }}
                  />
                </div>
                
              </div>
              
              {/* Información de la comida */}
              <div className="space-y-4">
                {/* Título principal */}
                <h3 className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors duration-300 mb-4">
                  {food.name}
                </h3>
                
                {/* Descripción si existe */}
                {food.description && (
                  <p className="text-gray-300 leading-relaxed mb-6 text-sm line-clamp-3">
                    {food.description}
                  </p>
                )}
                
                {/* Botón de acción elegante */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openProductModal(food)}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 group-hover:from-[#FFD700] group-hover:to-[#D4AF37]"
                >
                  Ver Detalles
                </motion.button>
              </div>
          </div>
            
            {/* Efecto de resplandor en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Botones de navegación premium debajo de las tarjetas */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <motion.a
          href="/products?filter=comidas"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center justify-center px-10 py-4 rounded-full gold-gradient text-black font-bold text-lg shadow-2xl gold-glow transition-all duration-300 premium-hover overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            <UtensilsCrossed className="w-5 h-5" />
            ¡Quiero comer!
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-gold-accent to-gold-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.a>
        
        <motion.a
          href="/reservas"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center justify-center px-10 py-4 rounded-full border-2 border-[#D4AF37] text-[#D4AF37] font-bold text-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300 shadow-xl premium-hover overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Calendar className="w-5 h-5" />
            Reservar Mesa
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.a>
      </motion.div>

      {/* Modal de producto */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={closeProductModal}
        productType="comida"
      />
    </section>
  );
} 