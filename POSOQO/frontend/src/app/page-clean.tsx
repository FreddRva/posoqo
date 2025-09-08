"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Montserrat, Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import { Beer, Mountain, Wheat, MapPin, Mail, Phone, Star, ArrowRight, UtensilsCrossed, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductModal from "@/components/ProductModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";

// Fonts
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  category?: string;
  style?: string;
  abv?: string;
  ibu?: string;
  color?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  is_active?: boolean;
}

// Main Component
export default function HomePage() {
  // Refs
  const productosRef = useRef<HTMLDivElement>(null);
  const taproomsRef = useRef<HTMLDivElement>(null);
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredCervezas, setFeaturedCervezas] = useState<Product[]>([]);
  const [featuredComidas, setFeaturedComidas] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  // Functions
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/products");
      const data = await response.json();
      
      setProducts(data.data);
      
      // Filtrar productos destacados
      const cervezasDestacadas = data.data.filter((p: any) => 
        p.is_featured && p.subcategory_id === '762eec2b-0753-41cc-af8a-9763d82a43db'
      ).slice(0, 4);
      setFeaturedCervezas(cervezasDestacadas);
      
      const comidasDestacadas = data.data.filter((p: any) => 
        p.is_featured && p.category_id === 'e5692d7c-565a-47a6-8dbe-aabf11f8eac7'
      ).slice(0, 4);
      setFeaturedComidas(comidasDestacadas);
      
      // Cargar servicios
      await loadServices();
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/services");
      const data = await response.json();
      
      if (data.success && data.data) {
        setServices(data.data);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Data
  const features = [
    {
      icon: <Beer className="w-10 h-10 text-yellow-400" />,
      title: "Tradición y dedicación",
      text: "La espuma no es solo un símbolo de fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico en cada receta.",
    },
    {
      icon: <Wheat className="w-10 h-10 text-yellow-400" />,
      title: "Orgullo ayacuchano",
      text: "Cada una de nuestras cervezas artesanales nace de esta filosofía: honrar nuestras raíces con sabores únicos, elaborados con esmero y con el orgullo de ser ayacuchanos.",
    },
    {
      icon: <Mountain className="w-10 h-10 text-yellow-400" />,
      title: "Espuma que une",
      text: "Para nosotros, la espuma no es solo un símbolo de calidad y fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico.",
    }
  ];

  const taprooms = [
    {
      image: "/taproom-centro.jpg",
      title: "Taproom Histórico",
      location: "Portal Independencia n65 – interior B",
      features: [
        "Música en vivo con artistas ayacuchanos",
        "Cata de cervezas artesanales",
        "Fast food, platos a la carta, comida oriental, café y más",
        "Lanzamiento de cervezas estacionales",
        "Ambiente colonial con arte local"
      ]
    },
    {
      image: "/taproom-moderno.jpg",
      title: "Taproom Rockero",
      location: "Jr. Asamblea n310",
      features: [
        "Música en vivo: Rock peruano, rock inglés, Punk y más",
        "Tributos musicales y bandas en vivo",
        "Fast food y snacks para acompañar",
        "Lanzamiento de cervezas estacionales",
        "Ambiente de alma rockera y underground"
      ]
    },
    {
      image: "/taproom-planta.jpg",
      title: "Taproom Planta",
      location: "Sector Publico Mz Y lote",
      features: [
        "Tour por nuestra cervecería artesanal",
        "Eventos y talleres cerveceros",
        "Degustación de cervezas frescas",
        "Experiencias educativas cerveceras",
        "Vista directa al proceso de elaboración"
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-premium text-white ${montserrat.className} pt-4 lg:pt-8 relative overflow-hidden`}>
      {/* Fondo con efectos */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(212,175,55,0.05)_50%,transparent_75%)] bg-[length:20px_20px]" />
      
      {/* Partículas doradas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-sparkle"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      <Navbar scrolled={isScrolled} />
      
      {/* Hero Section */}
      <section className="hero-premium min-h-screen flex items-center justify-center pt-20 lg:pt-32">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-60"
            style={{
              backgroundImage: "url('/FondoPo.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.8) contrast(1.1)"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
        </div>
        
        <motion.div 
          className="relative z-10 max-w-7xl w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Contenido de texto */}
          <motion.div 
            className="flex-1 text-center lg:text-left order-1"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="mb-8">
              <Image 
                src="/Imagen2.png" 
                alt="POSOQO" 
                width={500} 
                height={200} 
                className="mx-auto lg:mx-0 w-auto h-auto max-w-full"
                priority
              />
            </div>
            
            <h2 className={`text-4xl md:text-6xl lg:text-7xl mb-8 text-gold ${cormorant.className} italic font-extralight leading-tight text-glow`}>
              Cerveza Ayacuchana
            </h2>
            
            <p className={`text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl leading-relaxed ${inter.className} font-extralight text-white drop-shadow-md`}>
              Posoqo viene del quechua <span className="font-light text-gold">pusuqu</span>, que significa <span className="font-light text-gold">espuma</span>.<br/>
              Para nosotros, la espuma no es solo un símbolo de calidad y fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection(productosRef)}
              >
                Nuestras Cervezas
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => scrollToSection(taproomsRef)}
              >
                Visítanos
              </Button>
            </div>
          </motion.div>
          
          {/* Imagen principal */}
          <motion.div 
            className="flex-1 flex justify-center items-center relative order-2 lg:order-2 mt-8 lg:mt-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative w-[28rem] h-[40rem] lg:w-[32rem] lg:h-[44rem] animate-float">
              <Image 
                src="/FondoS.png" 
                alt="Botella POSOQO" 
                width={512}
                height={704}
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Raíces Ayacuchanas */}
      <section className="py-16 bg-premium relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          <SectionHeader
            title="Tradición en cada sorbo"
            subtitle="RAÍCES AYACUCHANAS"
            icon={<Mountain className="w-5 h-5 text-yellow-400" />}
          />
          
          <p className={`text-lg md:text-xl mt-8 max-w-4xl mx-auto text-gray-300 leading-relaxed ${inter.className} font-light`}>
            Posoqo viene del quechua <span className="font-light text-gold">pusuqu</span>, que significa <span className="font-light text-gold">espuma</span>. Para nosotros, la espuma es símbolo de calidad, unión y celebración auténtica.
          </p>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="text-center">
                  <div className="w-20 h-20 bg-gold rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-gold">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-6 text-gold text-center group-hover:scale-105 transition-all duration-300 text-glow">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed text-center font-light">
                    {feature.text}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sección de productos */}
      <section ref={productosRef} className="py-20 bg-premium relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            title="Cervezas"
            subtitle="LAS MÁS PEDIDAS"
            icon={<Beer className="w-6 h-6 text-yellow-400" />}
          />
          
          <motion.div 
            className="w-full flex flex-col items-center justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-full max-w-7xl flex flex-col items-center justify-center gap-8">
              {featuredCervezas && featuredCervezas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-6xl mx-auto">
                  {featuredCervezas.slice(0, 4).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ y: 50, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18, delay: index * 0.1 }}
                      className="w-full"
                    >
                      <ProductCard 
                        product={product} 
                        onClick={openProductModal}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg">Cargando productos...</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-12">
              <Button
                variant="primary"
                size="lg"
                href="/products?filter=cerveza"
              >
                <Beer className="w-5 h-5" />
                ¡Quiero chela!
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gastronomía */}
      <section id="gastronomia" className="py-20 bg-premium relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader
            title="Gastronomía"
            subtitle="SABORES TRADICIONALES"
            icon={<UtensilsCrossed className="w-7 h-7 text-orange-400" />}
          />
          
          <p className={`text-lg md:text-xl mt-8 max-w-3xl mx-auto text-gray-300 leading-relaxed ${inter.className} font-light`}>
            Descubre los sabores auténticos de Ayacucho, donde cada plato cuenta una historia de tradición y pasión culinaria.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <Button
              variant="primary"
              size="lg"
              href="/products?filter=comidas"
            >
              <UtensilsCrossed className="w-5 h-5" />
              ¡Quiero comer!
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              href="/reservas"
            >
              <Calendar className="w-5 h-5" />
              Reservar Mesa
            </Button>
          </div>
        </div>

        {/* Productos de comidas destacados */}
        {featuredComidas && featuredComidas.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredComidas.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group">
                    <div className="relative mb-4">
                      <div className="w-full h-48 bg-gradient-to-br from-orange-700/20 to-orange-800/20 rounded-xl overflow-hidden border border-orange-400/20">
                        <img
                          src={product.image_url?.startsWith('http') ? product.image_url : `http://localhost:4000${product.image_url}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        🍽️ Comida
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-orange-300 group-hover:text-orange-200 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-orange-400 font-bold text-lg">
                          S/ {product.price?.toFixed(2) || '0.00'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProductModal(product)}
                        >
                          Ver más
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Taprooms */}
      <section ref={taproomsRef} id="taprooms" className="py-20 bg-premium relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader
            title="Nuestros espacios"
            subtitle="ENCUENTRA POSOQO"
            icon={<MapPin className="w-6 h-6 text-blue-400" />}
          />
          
          <p className={`text-lg md:text-xl mt-8 max-w-3xl mx-auto text-gray-300 leading-relaxed ${inter.className} font-light`}>
            Descubre nuestros espacios únicos donde la tradición se encuentra con la innovación cervecera.
          </p>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {taprooms.map((taproom, index) => (
              <motion.div 
                key={index}
                className="group relative rounded-3xl overflow-hidden h-96 md:h-[600px] shadow-2xl hover:shadow-gold-hover transition-all duration-500"
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
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/98 via-stone-900/70 to-stone-900/20" />
                <div className="absolute left-0 right-0 p-6 md:p-8 bottom-0">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-gold group-hover:text-yellow-300 transition-colors duration-300 text-glow">
                    {taproom.title}
                  </h3>
                  <p className="text-base md:text-lg lg:text-xl mb-4 md:mb-6 text-white font-medium">
                    {taproom.location}
                  </p>
                  <div className="space-y-3 md:space-y-4">
                    {taproom.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 md:gap-4 group-hover:translate-x-2 transition-transform duration-300">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        </div>
                        <span className="text-sm md:text-base lg:text-lg text-gray-200 font-medium leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 bg-premium relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader
            title="Experiencias POSOQO"
            subtitle="NUESTROS SERVICIOS"
            icon={<Star className="w-6 h-6 text-emerald-400" />}
          />
          
          <p className={`text-lg md:text-xl mt-8 max-w-3xl mx-auto text-gray-300 leading-relaxed ${inter.className} font-light`}>
            Llevamos la experiencia POSOQO a tu evento con servicios personalizados y profesionales.
          </p>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services && services.map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="group">
                  <div className="relative w-full h-40 md:h-48 rounded-2xl overflow-hidden mb-6 md:mb-8 group-hover:scale-105 transition-transform duration-500">
                    {service.image_url ? (
                      <Image 
                        src={service.image_url.startsWith('http') ? service.image_url : `http://127.0.0.1:4000${service.image_url}`} 
                        alt={service.name} 
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400/20 to-slate-700/50 flex items-center justify-center">
                        <span className="text-4xl md:text-6xl">🍺</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gold group-hover:text-yellow-300 transition-colors duration-300">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6 md:mb-8 font-light text-sm md:text-base">
                    {service.description}
                  </p>
                  
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="md"
                    >
                      Contáctanos
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Club de miembros */}
      <section id="club-posoqo" className="py-20 bg-premium relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div 
            className="inline-block glass-gold border-gold rounded-full px-6 py-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              <span className="text-gold font-bold">CLUB POSOQO</span>
            </div>
          </motion.div>
          
          <motion.h2 
            className={`text-3xl md:text-5xl mb-6 ${playfair.className} text-gold text-glow`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Únete a nuestra comunidad
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Conviértete en miembro del Club POSOQO y accede a lanzamientos exclusivos, descuentos especiales y eventos privados.
          </motion.p>
          
          <motion.div 
            className="max-w-md mx-auto glass-gold p-6 md:p-8 rounded-xl border-gold"
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
                    <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gold">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              variant="primary"
              size="lg"
              className="mt-8 w-full"
            >
              Unirme al club
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-20 relative">
        <div className="absolute inset-0 bg-[url('/contact-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div>
              <span className="text-gold font-bold tracking-widest">CONTÁCTANOS</span>
              <h2 className={`text-3xl md:text-5xl mt-4 mb-8 ${playfair.className} text-gold text-glow`}>
                Hablemos de cerveza
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <MapPin className="w-6 h-6 text-gold" />,
                    title: "Visítanos",
                    details: ["Jr. 28 de Julio 148, Ayacucho, Perú", "Av. Cervecera 245, Ayacucho, Perú"]
                  },
                  {
                    icon: <Mail className="w-6 h-6 text-gold" />,
                    title: "Escríbenos",
                    details: ["hola@posoqo.com", "ventas@posoqo.com"]
                  },
                  {
                    icon: <Phone className="w-6 h-6 text-gold" />,
                    title: "Llámamos",
                    details: ["+51 966 123 456", "Lun-Vie: 9am - 6pm"]
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gold">{item.title}</h3>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-gray-300">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="glass-gold p-6 md:p-8 rounded-xl border-gold"
            >
              <h3 className="text-2xl font-bold mb-6 text-gold">Envíanos un mensaje</h3>
              <form className="space-y-4">
                {[
                  { id: "name", label: "Nombre", type: "text", placeholder: "Tu nombre" },
                  { id: "email", label: "Correo electrónico", type: "email", placeholder: "tu@email.com" },
                  { id: "subject", label: "Asunto", type: "text", placeholder: "¿En qué podemos ayudarte?" }
                ].map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium mb-1 text-gold">{field.label}</label>
                    <input 
                      type={field.type} 
                      id={field.id}
                      className="w-full px-4 py-3 rounded bg-black/50 border border-yellow-400/30 focus:border-yellow-400 focus:ring-yellow-400/40 outline-none transition-all text-white placeholder-gray-400" 
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1 text-gold">Mensaje</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full px-4 py-3 rounded bg-black/50 border border-yellow-400/30 focus:border-yellow-400 focus:ring-yellow-400/40 outline-none transition-all text-white placeholder-gray-400" 
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Enviar mensaje
                </Button>
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

      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
