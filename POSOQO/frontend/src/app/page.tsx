"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Montserrat, Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import { Beer, Mountain, Wheat, MapPin, Mail, Phone, Star, ArrowRight, UtensilsCrossed, Calendar, Flame, TestTube, Sparkles } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getImageUrl } from "@/lib/api";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductModal from "@/components/ProductModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";
import FeaturedFoods from "@/components/FeaturedFoods";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

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

interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  is_active?: boolean;
}

export default function HomePage() {
  const productosRef = useRef<HTMLDivElement>(null);
  const taproomsRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const controls = useAnimation();

  // Scroll suave a secciones
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [featuredCervezas, setFeaturedCervezas] = useState<Product[]>([]);
  const [featuredComidas, setFeaturedComidas] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState("cervezas");
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    // Cargar productos
  useEffect(() => {
    // Una sola llamada a la API para cargar todos los productos
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://posoqo-backend.onrender.com";
    const productsUrl = apiUrl.endsWith('/api') ? `${apiUrl}/products` : `${apiUrl}/api/products`;
    fetch(productsUrl)
      .then(res => res.json())
      .then(res => {
        // Cargar todos los productos para el fallback
        setProducts(res.data);
        
        // Buscar la categoría "Cervezas" por nombre
        const categoriesUrl = apiUrl.endsWith('/api') ? `${apiUrl}/categories` : `${apiUrl}/api/categories`;
        fetch(categoriesUrl)
          .then(catRes => catRes.json())
          .then(catData => {
            const cervezaCategory = catData.data?.find((c: any) => c.name === "Cervezas");
            
            if (cervezaCategory) {
              // Productos destacados de la categoría Cervezas
            const cervezasDestacadas = res.data.filter((p: any) => {
              const isCervezaByCategory = p.category_id === cervezaCategory.id;
              const isCervezaBySubcategory = p.subcategory === cervezaCategory.id;
              const isCerveza = isCervezaByCategory || isCervezaBySubcategory;
              return isCerveza && p.is_featured;
            }).slice(0, 4);
        setFeaturedCervezas(cervezasDestacadas);
            } else {
              setFeaturedCervezas(res.data.filter((p: any) => p.is_featured).slice(0, 4));
            }
            
            // Para comidas, buscar otras categorías destacadas (Vinos, Cocteles, Licores)
            const comidasDestacadas = res.data.filter((p: any) => {
              const isCervezaByCategory = p.category_id === cervezaCategory?.id;
              const isCervezaBySubcategory = p.subcategory === cervezaCategory?.id;
              const isCerveza = isCervezaByCategory || isCervezaBySubcategory;
              const isNotCerveza = !isCerveza;
              const isFeatured = p.is_featured;
              return isNotCerveza && isFeatured;
            }).slice(0, 4);
        setFeaturedComidas(comidasDestacadas);
          })
          .catch(catError => {
            console.error('Error cargando categorías:', catError);
            // Fallback: mostrar todos los productos destacados
            setFeaturedCervezas(res.data.filter((p: any) => p.is_featured).slice(0, 4));
            setFeaturedComidas([]);
          });
        
        // Cargar servicios reales desde la API
        const servicesUrl = apiUrl.endsWith('/api') ? `${apiUrl}/services` : `${apiUrl}/api/services`;
        fetch(servicesUrl)
          .then(servicesRes => servicesRes.json())
          .then(servicesData => {
            if (servicesData.success && servicesData.data) {
              setServices(servicesData.data);
            } else {
              // Fallback: usar productos no destacados como servicios
              const serviciosTemporales = res.data.filter((p: any) => !p.is_featured).slice(0, 4);
              setServices(serviciosTemporales);
            }
          })
          .catch(servicesError => {
            console.error('Error cargando servicios:', servicesError);
            // Fallback: usar productos no destacados como servicios
            const serviciosTemporales = res.data.filter((p: any) => !p.is_featured).slice(0, 4);
            setServices(serviciosTemporales);
          });
      })
      .catch((error) => {
        setFeaturedCervezas([]);
        setFeaturedComidas([]);
        setServices([]);
        setProducts([]);
      });
  }, []);


  // Scroll a hash en la URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
      }
    };
    
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  // Animaciones cuando los elementos entran en el viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            controls.start("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll("section");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [controls]);

  // Debug: mostrar qué productos se están cargando
  
  
  // Renderizado condicional para mobile/desktop - ProductCard mejorado
  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      className="group relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm p-6 rounded-3xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:-translate-y-2 w-full h-auto min-h-[380px] cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => openProductModal(product)}
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center h-full">
        {/* Imagen mejorada con efectos premium */}
        <div className="relative w-28 h-36 flex-shrink-0 mb-6 group">
          {/* Efecto de resplandor premium */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 rounded-2xl blur-lg scale-110 group-hover:scale-125 transition-all duration-500"></div>
          
          {/* Contenedor de imagen con gradiente */}
          <div className="relative bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-2xl p-3 group-hover:scale-105 transition-transform duration-500">
            <img
              src={getImageUrl(product.image_url)}
              alt={product.name}
              className="object-contain w-full h-full rounded-lg"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg></div>';
                }
              }}
            />
          </div>
          
          {/* Efecto de resplandor en la imagen */}
          <div className="absolute inset-0 border-2 border-[#D4AF37]/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Información del producto mejorada */}
        <div className="flex flex-col items-center text-center w-full space-y-4 flex-grow">
          {/* Nombre del producto */}
          <h2 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-2">
            {product.name}
          </h2>
          
          {/* Descripción */}
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
            {product.description}
          </p>
          
          {/* Especificaciones técnicas mejoradas */}
          <div className="flex flex-wrap gap-2 justify-center">
            {product.abv && (
              <div className="bg-[#D4AF37]/20 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-[#D4AF37]">ABV {product.abv}</span>
              </div>
            )}
            {product.ibu && (
              <div className="bg-[#D4AF37]/20 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-[#D4AF37]">IBU {product.ibu}</span>
              </div>
            )}
            {product.color && (
              <div className="bg-[#D4AF37]/20 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-[#D4AF37]">{product.color}</span>
              </div>
            )}
          </div>

          {/* Precio */}
          {product.price && (
            <div className="text-2xl font-bold text-[#D4AF37] mt-2">
              S/ {product.price.toFixed(2)}
            </div>
          )}
        </div>

        {/* Botón de acción mejorado */}
        <div className="mt-4 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 group-hover:from-[#FFD700] group-hover:to-[#D4AF37]"
          >
            Ver Detalles
          </motion.button>
        </div>
      </div>

      {/* Efecto de resplandor premium en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
      
      {/* Indicador de click premium */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="w-8 h-8 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-xl">
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </div>
    </motion.div>
  );

  // Funciones para manejar el modal
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className={`min-h-screen premium-gradient text-white ${montserrat.className} pt-4 lg:pt-8 relative overflow-hidden`}>
      {/* Fondo simple sin efectos */}
      
      
      {/* Hero Section - Fondo con imagen */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 lg:pt-32" style={{backgroundImage: 'url(/FondoPo.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        {/* Overlay más oscuro para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-black/85"></div>
        {/* Gradiente adicional para profundidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        
        <motion.div 
          className="relative z-10 max-w-7xl w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Contenido de texto - Diseño premium mejorado */}
          <motion.div 
            className="flex-1 text-center lg:text-left order-1"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Logo con efecto dorado */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-posoqo-gold/20 to-posoqo-gold-accent/20 rounded-2xl blur-xl scale-110"></div>
              <div className="relative">
                <Image 
                  src="/Imagen2.png" 
                  alt="POSOQO" 
                  width={500} 
                  height={200} 
                  className="mx-auto lg:mx-0 w-auto h-auto max-w-full drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            
            {/* Título principal con efecto premium */}
            <div className="mb-8 relative">
              <h2 className={`text-4xl md:text-6xl lg:text-7xl gold-text ${cormorant.className} italic font-extralight leading-tight premium-text-shadow`}>
                Cerveza Ayacuchana
              </h2>
              {/* Línea decorativa dorada */}
              <div className="w-24 h-1 gold-gradient mx-auto lg:mx-0 mt-4 rounded-full shadow-lg"></div>
            </div>
            
            {/* Descripción elegante */}
            <div className="mb-10 max-w-3xl mx-auto lg:mx-0">
              <p className={`text-lg md:text-xl lg:text-2xl leading-relaxed ${inter.className} font-light text-white drop-shadow-lg`}>
                Posoqo viene del quechua <span className="font-medium gold-text">pusuqu</span>, que significa <span className="font-medium gold-text">espuma</span>.
              </p>
              <p className={`text-base md:text-lg lg:text-xl mt-4 leading-relaxed ${inter.className} font-light text-gray-300 drop-shadow-md`}>
                Para nosotros, la espuma no es solo un símbolo de calidad y fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico.
              </p>
            </div>
            
            {/* Botones de acción mejorados */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-4 rounded-full gold-gradient text-black font-bold text-lg transition-all duration-300 shadow-2xl gold-glow premium-hover overflow-hidden"
                onClick={() => scrollToSection(productosRef)}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Beer className="w-5 h-5" />
                  Nuestras Cervezas
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-accent to-gold-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-4 rounded-full gold-border text-white font-bold text-lg hover:gold-glow transition-all duration-300 shadow-xl premium-hover overflow-hidden"
                onClick={() => scrollToSection(taproomsRef)}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  Visítanos
                </span>
                <div className="absolute inset-0 gold-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </motion.button>
            </div>
          </motion.div>
          
          {/* Imagen principal - Diseño premium mejorado */}
          <motion.div 
            className="flex-1 flex justify-center items-center relative order-2 lg:order-2 mt-8 lg:mt-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative w-[28rem] h-[40rem] lg:w-[32rem] lg:h-[44rem] animate-float flex items-center justify-center">
              {/* Efecto de resplandor dorado */}
              <div className="absolute inset-0 bg-gradient-to-br from-posoqo-gold/30 via-transparent to-posoqo-gold-accent/20 rounded-full blur-3xl scale-110"></div>
              
              {/* Contenedor de la imagen con efectos */}
              <div className="relative z-10 group">
                <Image 
                  src="/FondoS.png" 
                  alt="Botella POSOQO" 
                  width={512}
                  height={704}
                  className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 mx-auto"
                  priority
                />
                
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-posoqo-gold/10 via-transparent to-posoqo-gold/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Partículas doradas flotantes */}
              <div className="absolute top-10 right-10 w-2 h-2 bg-posoqo-gold rounded-full gold-sparkle opacity-60"></div>
              <div className="absolute bottom-20 left-8 w-1.5 h-1.5 bg-posoqo-gold-accent rounded-full gold-sparkle opacity-80" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 right-4 w-1 h-1 bg-posoqo-gold rounded-full gold-sparkle opacity-70" style={{animationDelay: '2s'}}></div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Raíces Ayacuchanas - Fondo negro más oscuro */}
      <section className="py-20" style={{backgroundColor: '#0f0f0f'}}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Badge superior con icono */}
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-[#D4AF37]/20 rounded-full border border-[#D4AF37]/50 shadow-lg">
              <Mountain className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black tracking-[0.3em] text-sm md:text-base uppercase">
                RAÍCES AYACUCHANAS
              </span>
            </div>
            
            {/* Título principal con efecto premium */}
            <div className="relative mb-8">
              <h2 className={`text-5xl md:text-7xl font-black text-[#D4AF37] ${cormorant.className} italic tracking-wider drop-shadow-2xl`}>
                Tradición en cada sorbo
              </h2>
              {/* Línea decorativa dorada */}
              <div className="w-32 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] mx-auto mt-6 rounded-full shadow-lg"></div>
            </div>
            
            {/* Descripción elegante con mejor tipografía */}
            <div className="max-w-4xl mx-auto">
              <p className={`text-lg md:text-xl text-gray-200 leading-relaxed ${inter.className} font-light`}>
                Posoqo viene del quechua <span className="font-medium text-[#D4AF37]">pusuqu</span>, que significa <span className="font-medium text-[#D4AF37]">espuma</span>. 
              </p>
              <p className={`text-base md:text-lg mt-4 text-gray-300 leading-relaxed ${inter.className} font-light`}>
                Para nosotros, la espuma es símbolo de calidad, unión y celebración auténtica que conecta nuestras raíces ayacuchanas con cada sorbo.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Beer className="w-8 h-8 text-black" />,
                title: "Tradición y dedicación",
                text: "La espuma no es solo un símbolo de fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico en cada receta.",
                gradient: "from-[#D4AF37]/20 to-[#FFD700]/20"
              },
              {
                icon: <Wheat className="w-8 h-8 text-black" />,
                title: "Orgullo ayacuchano",
                text: "Cada una de nuestras cervezas artesanales nace de esta filosofía: honrar nuestras raíces con sabores únicos, elaborados con esmero y con el orgullo de ser ayacuchanos.",
                gradient: "from-[#FFD700]/20 to-[#D4AF37]/20"
              },
              {
                icon: <Mountain className="w-8 h-8 text-black" />,
                title: "Espuma que une",
                text: "Para nosotros, la espuma no es solo un símbolo de calidad y fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico.",
                gradient: "from-[#D4AF37]/20 to-[#FFD700]/20"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                {/* Contenido principal */}
                <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl border border-[#D4AF37]/40 hover:border-[#D4AF37]/60 transition-all duration-500 h-full">
                  {/* Icono elegante con fondo dorado */}
                  <div className="w-20 h-20 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    {item.icon}
                  </div>
                  
                  {/* Título */}
                  <h3 className="text-2xl font-bold mb-6 text-[#D4AF37] text-center group-hover:scale-105 transition-all duration-300 drop-shadow-lg">
                    {item.title}
                  </h3>
                  
                  {/* Descripción */}
                  <p className="text-gray-200 leading-relaxed text-center font-light text-sm md:text-base" dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
                
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sección Combinada - Cervezas y Gastronomía */}
      <section ref={productosRef} className="py-20 bg-gray-800">
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Sección de Cervezas */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Badge superior con icono dorado */}
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-gold-primary/20 to-gold-accent/20 rounded-full border-2 border-gold-primary/50 backdrop-blur-sm shadow-lg">
              <Beer className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black tracking-[0.3em] text-sm md:text-base uppercase">
                LAS MÁS PEDIDAS
              </span>
            </div>
            
            {/* Título principal con efecto premium */}
            <div className="relative mb-8">
              <h2 className={`text-5xl md:text-7xl font-black text-[#D4AF37] ${playfair.className} tracking-wider drop-shadow-2xl`}>
                Cervezas
              </h2>
              {/* Línea decorativa dorada */}
              <div className="w-32 h-1.5 gold-gradient mx-auto mt-6 rounded-full shadow-lg"></div>
            </div>
            
            {/* Grid de productos destacados con diseño horizontal profesional */}
            {featuredCervezas.length > 0 && (
              <motion.div 
                className="space-y-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {featuredCervezas.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-3xl p-8 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#D4AF37]/30 overflow-hidden"
                  >
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                      {/* Imagen grande al lado izquierdo */}
                      <div className="flex-shrink-0 w-full lg:w-80">
                        <div className="relative h-80 lg:h-96 group">
                          {/* Efecto de resplandor premium */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 rounded-3xl blur-2xl scale-110 group-hover:scale-125 transition-all duration-500"></div>
                          
                          {/* Contenedor de imagen con gradiente */}
                          <div className="relative bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-3xl p-6 h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                            <img
                              src={product.image_url?.startsWith('http') ? product.image_url : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com'}${product.image_url || ''}`}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-24 h-24 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg></div>';
                                }
                              }}
                            />
                          </div>
                          
                          {/* Efecto de resplandor en la imagen */}
                          <div className="absolute inset-0 border-2 border-[#D4AF37]/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </div>
                      
                      {/* Información del producto al lado derecho */}
                      <div className="flex-1 text-center lg:text-left">
                        {/* Título principal */}
                        <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                          {product.name}
                        </h3>
                        
                        {/* Descripción */}
                        <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                          {product.description}
                        </p>
                        
                        {/* Especificaciones técnicas mejoradas */}
                        <div className="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
                          {product.abv && (
                            <div className="bg-[#D4AF37]/20 px-4 py-2 rounded-full border border-[#D4AF37]/40">
                              <span className="text-sm font-semibold text-[#D4AF37]">ABV {product.abv}</span>
                            </div>
                          )}
                          {product.ibu && (
                            <div className="bg-[#D4AF37]/20 px-4 py-2 rounded-full border border-[#D4AF37]/40">
                              <span className="text-sm font-semibold text-[#D4AF37]">IBU {product.ibu}</span>
                            </div>
                          )}
                          {product.color && (
                            <div className="bg-[#D4AF37]/20 px-4 py-2 rounded-full border border-[#D4AF37]/40">
                              <span className="text-sm font-semibold text-[#D4AF37]">{product.color}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Precio destacado */}
                        <div className="text-4xl font-bold text-[#D4AF37] mb-8">
                          S/ {product.price?.toFixed(2) || '0.00'}
                        </div>
                        
                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 group-hover:from-[#FFD700] group-hover:to-[#D4AF37]"
                          >
                            Ver Detalles
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border-2 border-[#D4AF37] text-[#D4AF37] font-bold py-4 px-8 rounded-xl hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
                          >
                            Agregar al Carrito
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* Botón de acción principal */}
            <motion.div 
              className="mt-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.a
                href="/products?filter=cervezas"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center justify-center px-10 py-4 rounded-full gold-gradient text-black font-bold text-lg shadow-2xl gold-glow transition-all duration-300 premium-hover overflow-hidden mx-auto w-fit"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Beer className="w-5 h-5" />
                  ¡Quiero chela!
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-accent to-gold-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.a>
            </motion.div>
          </motion.div>
          
          {/* Separador decorativo */}
          <div className="flex items-center justify-center mb-20">
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            <div className="mx-4 w-2 h-2 bg-[#D4AF37] rounded-full"></div>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
          </div>

          {/* Sección de Gastronomía */}
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Badge superior con icono dorado */}
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-gold-primary/20 to-gold-accent/20 rounded-full border-2 border-gold-primary/50 backdrop-blur-sm shadow-lg">
              <UtensilsCrossed className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-black tracking-[0.3em] text-sm md:text-base uppercase">
                SABORES TRADICIONALES
              </span>
            </div>
            
            {/* Título principal con efecto premium */}
            <div className="relative mb-8">
              <h2 className={`text-5xl md:text-7xl font-black text-[#D4AF37] ${cormorant.className} italic tracking-wider drop-shadow-2xl`}>
                Gastronomía
              </h2>
              {/* Línea decorativa dorada */}
              <div className="w-32 h-1.5 gold-gradient mx-auto mt-6 rounded-full shadow-lg"></div>
            </div>
            
            {/* Descripción elegante */}
            <div className="max-w-3xl mx-auto mb-8">
              <p className={`text-lg md:text-xl text-gray-300 leading-relaxed ${inter.className} font-light`}>
                Descubre los sabores auténticos de Ayacucho, donde cada plato cuenta una historia de tradición y pasión culinaria.
              </p>
            </div>

            {/* Botones de navegación premium */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
            </div>
          </motion.div>

          {/* Sección de Comidas Destacadas integrada */}
          <div className="mt-16">
            <FeaturedFoods />
          </div>
        </div>
      </section>

      {/* Taprooms y experiencias - Diseño premium con fondo de imagen */}
      <section ref={taproomsRef} id="taprooms" className="py-20 relative overflow-hidden" style={{backgroundImage: 'url(/FondoPoS.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        {/* Overlay más oscuro para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-black/90"></div>
        {/* Gradiente adicional para profundidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Sin efecto de resplandor */}
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 bg-[#D4AF37]/20 rounded-lg border border-[#D4AF37]/30">
                <MapPin className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="text-[#D4AF37] font-black tracking-[0.3em] text-sm md:text-base uppercase relative z-10">
                ENCUENTRA POSOQO
              </span>
            </div>
            <h2 className={`text-5xl md:text-7xl mt-6 font-black text-[#D4AF37] ${cormorant.className} italic relative z-10 tracking-wider drop-shadow-2xl`}>
              Nuestros espacios
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] mx-auto mt-6 rounded-full shadow-lg"></div>
            
            {/* Descripción elegante */}
            <p className={`text-lg md:text-xl mt-8 max-w-3xl mx-auto text-gray-300 leading-relaxed ${inter.className} font-light`}>
              Descubre nuestros espacios únicos donde la tradición se encuentra con la innovación cervecera.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                image: "/file.svg",
                title: "Taproom Histórico",
                location: "Portal Independencia n65 – interior B",
                features: [
                  { icon: <Flame className="w-5 h-5 text-[#D4AF37]" />, text: "Música en vivo con artistas ayacuchanos" },
                  { icon: <TestTube className="w-5 h-5 text-[#D4AF37]" />, text: "Cata de cervezas artesanales" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Fast food, platos a la carta, comida oriental, café y más" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Lanzamiento de cervezas estacionales" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Ambiente colonial con arte local" }
                ]
              },
              {
                image: "/file.svg",
                title: "Taproom Rockero",
                location: "Jr. Asamblea n310",
                features: [
                  { icon: <Flame className="w-5 h-5 text-[#D4AF37]" />, text: "Música en vivo: Rock peruano, rock inglés, Punk y más" },
                  { icon: <TestTube className="w-5 h-5 text-[#D4AF37]" />, text: "Tributos musicales y bandas en vivo" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Fast food y snacks para acompañar" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Lanzamiento de cervezas estacionales" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Ambiente de alma rockera y underground" }
                ]
              },
              {
                image: "/file.svg",
                title: "Taproom Planta",
                location: "Sector Publico Mz Y lote",
                features: [
                  { icon: <Flame className="w-5 h-5 text-[#D4AF37]" />, text: "Tour por nuestra cervecería artesanal" },
                  { icon: <TestTube className="w-5 h-5 text-[#D4AF37]" />, text: "Eventos y talleres cerveceros" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Degustación de cervezas frescas" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Experiencias educativas cerveceras" },
                  { icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, text: "Vista directa al proceso de elaboración" }
                ]
              }
            ].map((taproom, index) => (
              <motion.div 
                key={index}
                className="group relative rounded-3xl overflow-hidden h-96 md:h-[600px] shadow-2xl hover:shadow-[#D4AF37]/25 transition-all duration-500"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Image 
                  src={taproom.image} 
                  alt={taproom.title} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/98 via-stone-900/70 to-stone-900/20"></div>
                <div className={`absolute left-0 right-0 p-6 md:p-8 ${
                  index === 2 ? 'bottom-8' : 'bottom-0'
                }`}>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-[#D4AF37] group-hover:text-[#FFD700] transition-colors duration-300 drop-shadow-lg">
                    {taproom.title}
                  </h3>
                  <p className="text-base md:text-lg lg:text-xl mb-4 md:mb-6 text-stone-100 font-medium drop-shadow-lg">
                    {taproom.location}
                  </p>
                  <div className="space-y-3 md:space-y-4">
                    {taproom.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 md:gap-4 group-hover:translate-x-2 transition-transform duration-300">
                        <div className="flex-shrink-0">
                          {feature.icon}
                        </div>
                        <span className="text-sm md:text-base lg:text-lg text-stone-200 font-medium drop-shadow-lg leading-relaxed">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      

      {/* Servicios - Fondo simple como LAS MÁS PEDIDAS */}
      <section id="servicios" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Sin efecto de resplandor */}
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 bg-[#D4AF37]/20 rounded-lg border border-[#D4AF37]/30">
                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="text-[#D4AF37] font-black tracking-[0.3em] text-sm md:text-base uppercase relative z-10">
                NUESTROS SERVICIOS
              </span>
            </div>
            <h2 className={`text-5xl md:text-7xl mt-6 font-black text-[#D4AF37] ${cormorant.className} italic relative z-10 tracking-wider drop-shadow-2xl`}>
              Experiencias POSOQO
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] mx-auto mt-6 rounded-full shadow-lg"></div>
            
            {/* Descripción elegante */}
            <p className={`text-lg md:text-xl mt-8 max-w-3xl mx-auto text-gray-300 leading-relaxed ${inter.className} font-light`}>
              Llevamos la experiencia POSOQO a tu evento con servicios personalizados y profesionales.
            </p>
          </motion.div>
          
          <motion.div 
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services && services.map((service, index) => (
              <motion.div 
                key={service.id}
                className="group relative bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-3xl p-8 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#D4AF37]/30 overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                  {/* Imagen grande al lado izquierdo */}
                  <div className="flex-shrink-0 w-full lg:w-80">
                    <div className="relative h-80 lg:h-96 group">
                      {/* Efecto de resplandor premium */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 rounded-3xl blur-2xl scale-110 group-hover:scale-125 transition-all duration-500"></div>
                      
                      {/* Contenedor de imagen con gradiente */}
                      <div className="relative bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-3xl p-6 h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        {service.image_url ? (
                          <Image 
                            src={service.image_url.startsWith('http') ? service.image_url : `${process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://posoqo-backend.onrender.com'}${service.image_url}`}
                            alt={service.name} 
                            width={300}
                            height={300}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-8xl">🍺</span></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-8xl">🍺</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Efecto de resplandor en la imagen */}
                      <div className="absolute inset-0 border-2 border-[#D4AF37]/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                  
                  {/* Información del servicio al lado derecho */}
                  <div className="flex-1 text-center lg:text-left">
                    {/* Título principal */}
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-[#D4AF37] transition-colors duration-300">
                      {service.name}
                    </h3>
                    
                    {/* Descripción */}
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    
                    {/* Precio si existe */}
                    {service.price && (
                      <div className="text-4xl font-bold text-[#D4AF37] mb-8">
                        S/ {service.price.toFixed(2)}
                      </div>
                    )}
                    
                    {/* Estado del servicio */}
                    <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
                      <div className={`w-3 h-3 rounded-full ${service.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-300">
                        {service.is_active ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 group-hover:from-[#FFD700] group-hover:to-[#D4AF37]"
                      >
                        Contáctanos
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="border-2 border-[#D4AF37] text-[#D4AF37] font-bold py-4 px-8 rounded-xl hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
                      >
                        Más Información
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                {/* Efecto de resplandor en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Club de miembros - Diseño premium con fondo de imagen */}
      <section id="club-posoqo" className="py-20 relative overflow-hidden" style={{backgroundImage: 'url(/FondoPoC.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        {/* Overlay más oscuro para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-black/80"></div>
        {/* Gradiente adicional para profundidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div 
            className="inline-block bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded-full px-6 py-2 mb-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-bold tracking-wider">CLUB POSOQO</span>
            </div>
          </motion.div>
          
          <motion.h2 
            className={`text-4xl md:text-6xl mb-6 text-[#D4AF37] ${playfair.className} font-bold drop-shadow-2xl`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Únete a nuestra comunidad
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-200 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Conviértete en miembro del Club POSOQO y accede a lanzamientos exclusivos, descuentos especiales y eventos privados.
          </motion.p>
          
          {/* Estadísticas del club */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">500+</div>
              <div className="text-gray-300 text-sm">Miembros activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">50+</div>
              <div className="text-gray-300 text-sm">Eventos exclusivos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">15+</div>
              <div className="text-gray-300 text-sm">Cervezas exclusivas</div>
            </div>
          </motion.div>

          {/* Testimonios de miembros */}
          <motion.div 
            className="mb-12 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-8 text-center">Lo que dicen nuestros miembros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#D4AF37]/30">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                    M
                  </div>
                  <div>
                    <div className="font-bold text-[#D4AF37]">María González</div>
                    <div className="text-gray-400 text-sm">Miembro desde 2023</div>
                  </div>
                </div>
                <p className="text-gray-200 italic">"Las cervezas exclusivas del club son increíbles. El acceso anticipado a nuevos lanzamientos es una experiencia única."</p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#D4AF37]/30">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                    C
                  </div>
                  <div>
                    <div className="font-bold text-[#D4AF37]">Carlos Mendoza</div>
                    <div className="text-gray-400 text-sm">Miembro desde 2022</div>
                  </div>
                </div>
                <p className="text-gray-200 italic">"Los eventos VIP son espectaculares. Conocer al maestro cervecero y probar recetas experimentales es una pasión."</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="max-w-md mx-auto bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 p-6 md:p-8 rounded-2xl border border-[#D4AF37]/50 backdrop-blur-sm shadow-2xl hover:shadow-[#D4AF37]/30 transition-all duration-500"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4 text-left">
              {[
                {
                  title: "Cervezas exclusivas",
                  text: "Acceso a ediciones limitadas solo para miembros"
                },
                {
                  title: "Descuentos especiales",
                  text: "15% de descuento en todas tus compras"
                },
                {
                  title: "Eventos VIP",
                  text: "Invitaciones a catas privadas y encuentros con el maestro cervecero"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#D4AF37] text-lg">{item.title}</h3>
                    <p className="text-gray-200 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold hover:from-[#FFD700] hover:to-[#D4AF37] transition-all w-full shadow-lg hover:shadow-xl hover:shadow-[#D4AF37]/30"
            >
              Unirme al club
            </motion.button>
          </motion.div>

          {/* Beneficios adicionales */}
          <motion.div 
            className="mt-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-8 text-center">Más beneficios exclusivos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-[#D4AF37]/20">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#D4AF37] mb-2">Acceso 24/7</h4>
                <p className="text-gray-300 text-sm">Portal exclusivo siempre disponible</p>
              </div>
              <div className="text-center p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-[#D4AF37]/20">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#D4AF37] mb-2">Garantía</h4>
                <p className="text-gray-300 text-sm">Satisfacción 100% garantizada</p>
              </div>
              <div className="text-center p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-[#D4AF37]/20">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#D4AF37] mb-2">Envío gratis</h4>
                <p className="text-gray-300 text-sm">En compras superiores a S/50</p>
              </div>
              <div className="text-center p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-[#D4AF37]/20">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-[#D4AF37] mb-2">Soporte VIP</h4>
                <p className="text-gray-300 text-sm">Atención personalizada prioritaria</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contacto - Fondo negro igual a RAÍCES AYACUCHANAS */}
      <section id="contacto" className="py-20" style={{backgroundColor: '#0f0f0f'}}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div>
              <span className="text-[#D4AF37] font-bold tracking-widest text-lg">CONTÁCTANOS</span>
              <h2 className={`text-4xl md:text-6xl mt-4 mb-8 text-[#D4AF37] ${playfair.className} font-bold drop-shadow-2xl`}>Hablemos de cerveza</h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <MapPin className="w-6 h-6 text-[#D4AF37]" />,
                    title: "Visítanos",
                    details: ["Jr. 28 de Julio 148, Ayacucho, Perú", "Av. Cervecera 245, Ayacucho, Perú"]
                  },
                  {
                    icon: <Mail className="w-6 h-6 text-[#D4AF37]" />,
                    title: "Escríbenos",
                    details: ["hola@posoqo.com", "ventas@posoqo.com"]
                  },
                  {
                    icon: <Phone className="w-6 h-6 text-[#D4AF37]" />,
                    title: "Llámamos",
                    details: ["+51 966 123 456", "Lun-Vie: 9am - 6pm"]
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 rounded-2xl bg-gray-800/60 backdrop-blur-sm border border-[#D4AF37]/40 hover:border-[#D4AF37]/60 hover:bg-gray-700/60 transition-all duration-300">
                    <div className="mt-1 p-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-xl shadow-lg">{item.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg text-[#D4AF37] mb-3">{item.title}</h3>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-gray-200 mb-2">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 md:mt-12">
                <h3 className="font-bold text-lg mb-4 text-[#D4AF37]">Síguenos</h3>
                <div className="flex gap-4">
                  {["Instagram", "Facebook", "WhatsApp"].map((social, index) => (
                    <a 
                      key={index} 
                      href="#" 
                      className="w-14 h-14 rounded-full bg-gray-800/60 backdrop-blur-sm border border-[#D4AF37]/40 flex items-center justify-center hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#FFD700] hover:border-[#D4AF37] transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/30"
                      aria-label={social}
                    >
                      <svg className="w-6 h-6 text-[#D4AF37] hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d={social === "Instagram" ? "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" : 
                        social === "Facebook" ? "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" : 
                        "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-6.29-3.588c.545 1.422 1.578 2.589 2.96 2.907.401.092.764.117 1.059.099.341-.021.66-.106.93-.236.24-.116.414-.237.558-.365.152-.138.312-.396.222-.644-.105-.29-.717-1.027-1.001-1.364-.1-.12-.198-.18-.347-.297-.149-.117-.366-.198-.52-.149-.223.064-.427.33-.633.545-.213.227-.416.386-.644.386-.173 0-.347-.074-.52-.223-.397-.345-.992-1.032-1.322-1.38-.248-.27-.495-.396-.669-.396-.173 0-.347.074-.446.223-.099.149-.396.744-.396 1.707 0 .962.793 1.988.892 2.085.099.099 1.61 2.456 3.96 3.385.57.223 1.016.322 1.364.322.198 0 .347-.008.446-.016.149-.008.248-.091.347-.091.099 0 .198.074.347.198.149.124.594.545.713.744.116.198.223.314.322.512.099.198.074.314-.025.463-.099.149-.248.314-.446.512a4.19 4.19 0 01-1.213.86c-.347.149-.793.238-1.29.238-.545 0-1.19-.074-1.934-.314a7.19 7.19 0 01-1.677-.76c-.793-.495-1.806-1.539-2.383-2.466-1.29-1.707-1.735-3.2-1.735-4.143 0-.962.248-1.707.694-2.223.248-.281.545-.463.892-.545.248-.057.495-.04.694.033.198.074.396.248.545.694"} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-[#D4AF37]/40 shadow-2xl hover:shadow-[#D4AF37]/30 transition-all duration-500"
            >
              <h3 className="text-2xl font-bold mb-6 text-[#D4AF37]">Envíanos un mensaje</h3>
              {!session && (
                <p className="text-gray-300 text-sm mb-4">
                  ¿Ya tienes cuenta? <Link href="/login" className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">Inicia sesión</Link>
                </p>
              )}
              <form className="space-y-4">
                {[
                  { id: "name", label: "Nombre", type: "text", placeholder: "Tu nombre" },
                  { id: "email", label: "Correo electrónico", type: "email", placeholder: "tu@email.com" },
                  { id: "subject", label: "Asunto", type: "text", placeholder: "¿En qué podemos ayudarte?" }
                ].map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium mb-2 text-[#D4AF37]">{field.label}</label>
                    <input 
                      type={field.type} 
                      id={field.id}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 outline-none transition-all text-gray-200 placeholder-gray-400" 
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-[#D4AF37]">Mensaje</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-[#D4AF37]/40 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 outline-none transition-all text-gray-200 placeholder-gray-400" 
                    placeholder="Escribe tu mensaje aquí..."
                  ></textarea>
                </div>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-3 rounded-full bg-[#D4AF37] text-black font-bold hover:bg-[#FFD700] transition-all"
                >
                  Enviar mensaje
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Modal de producto */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
      />

    </div>
  );
}