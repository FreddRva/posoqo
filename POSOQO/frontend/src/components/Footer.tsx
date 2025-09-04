"use client";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Store,
  Calendar,
  Users,
  Truck,
  RotateCcw,
  FileText,
  PhoneCall,
  HelpCircle,
  Send,
  Shield,
  FileCheck,
  Award,
  Leaf,
  Heart,
  CreditCard,
  Accessibility,
  Smartphone
} from "lucide-react";

export default function Footer() {
  const router = useRouter();
  
  return (
    <footer className="w-full py-16 bg-posoqo-black text-posoqo-white border-t border-posoqo-gray-dark relative" style={{ zIndex: 10 }}>
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6" style={{ pointerEvents: 'auto' }}>
        
        {/* Marca y descripción */}
        <div className="lg:col-span-1">
          <h4 className="font-bold text-posoqo-gold mb-6 text-2xl tracking-wider">POSOQO</h4>
          <p className="text-sm mb-6 leading-relaxed text-posoqo-white">
            Cerveza artesanal ayacuchana, elaborada con pasión y tradición andina. 
            Descubre sabores únicos que combinan ingredientes locales con técnicas 
            cerveceras tradicionales.
          </p>
          
          {/* Información de contacto */}
          <div className="mb-6">
            <h5 className="font-semibold text-posoqo-gold-light mb-4 text-sm uppercase tracking-wider">Contacto</h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-posoqo-gold" />
                <span>Plaza de Armas, Portal Independencia Nº65, Jr. Argentina Mz. Y Lt. 05, Ayacucho 05001</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-posoqo-gold" />
                <span>+51 966 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-posoqo-gold" />
                <span>caposoqo@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-posoqo-gold" />
                <span>Lun-Vie: 9:00 - 18:00</span>
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="mb-6">
            <h5 className="font-semibold text-posoqo-gold-light mb-4 text-sm uppercase tracking-wider">Síguenos</h5>
                         <div className="flex space-x-4" style={{ pointerEvents: 'auto' }}>
               <a href="https://facebook.com/posoqo" target="_blank" rel="noopener noreferrer" className="text-posoqo-gray-light hover:text-posoqo-gold transition-colors duration-300 p-2 rounded-full hover:bg-posoqo-gold/10">
                 <Facebook className="w-5 h-5" />
                 <span className="sr-only">Facebook</span>
               </a>
               <a href="https://instagram.com/posoqo" target="_blank" rel="noopener noreferrer" className="text-posoqo-gray-light hover:text-posoqo-gold transition-colors duration-300 p-2 rounded-full hover:bg-posoqo-gold/10">
                 <Instagram className="w-5 h-5" />
                 <span className="sr-only">Instagram</span>
               </a>
               <a href="https://wa.me/51966123456" target="_blank" rel="noopener noreferrer" className="text-posoqo-gray-light hover:text-posoqo-gold transition-colors duration-300 p-2 rounded-full hover:bg-posoqo-gold/10">
                 <MessageCircle className="w-5 h-5" />
                 <span className="sr-only">WhatsApp</span>
               </a>
            </div>
          </div>

          <div className="space-y-2 text-xs text-posoqo-gray-light">
            <p>© {new Date().getFullYear()} POSOQO Cervecería Artesanal. Todos los derechos reservados.</p>
            <p>El consumo de bebidas alcohólicas en exceso es perjudicial para la salud. Prohibida su venta a menores de 18 años.</p>
          </div>
        </div>

        {/* Productos y Servicios */}
        <div>
          <h4 className="font-bold text-posoqo-gold mb-6 text-lg">Productos & Servicios</h4>
          <ul className="space-y-4">
            <li>
              <a 
                href="/#cervezas" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === "/") {
                    const el = document.getElementById("cervezas");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#cervezas");
                  }
                }}
              >
                <Store className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Nuestras cervezas</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Descubre nuestra colección de cervezas artesanales</p>
                </div>
              </a>
            </li>
            <li>
              <a 
                href="/#taprooms" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === "/") {
                    const el = document.getElementById("taprooms");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#taprooms");
                  }
                }}
              >
                <MapPin className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Taprooms</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Visita nuestros locales y disfruta en vivo</p>
                </div>
              </a>
            </li>
            <li>
              <a 
                href="/#servicios" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === "/") {
                    const el = document.getElementById("servicios");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#servicios");
                  }
                }}
              >
                <Calendar className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Eventos</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Cerveza artesanal para tus celebraciones</p>
                </div>
              </a>
            </li>
            <li>
              <a 
                href="/#club-posoqo" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === "/") {
                    const el = document.getElementById("club-posoqo");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#club-posoqo");
                  }
                }}
              >
                <Users className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Club POSOQO</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Únete a nuestra comunidad cervecera</p>
                </div>
              </a>
            </li>
            <li>
              <a 
                href="/#gastronomia" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === "/") {
                    const el = document.getElementById("gastronomia");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#gastronomia");
                  }
                }}
              >
                <Leaf className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Nuestra gastronomía</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Sabores únicos que complementan nuestras cervezas</p>
                </div>
              </a>
            </li>

          </ul>
        </div>

        {/* Soporte y Atención */}
        <div>
          <h4 className="font-bold text-posoqo-gold mb-6 text-lg">Soporte & Atención</h4>
          <ul className="space-y-4">
            <li>
              <a 
                href="/envios" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/envios");
                }}
              >
                <Truck className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Política de envíos</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Envíos a todo Ayacucho y provincias</p>
                </div>
              </a>
            </li>
            <li>
              <a 
                href="/devoluciones" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/devoluciones");
                }}
              >
                <RotateCcw className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Devoluciones</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Garantía de satisfacción del 100%</p>
                </div>
              </a>
            </li>
            <li>
              <a 
                href="/reclamos" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/reclamos");
                }}
              >
                <FileText className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Libro de reclamaciones</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Tu opinión es importante para nosotros</p>
                </div>
              </a>
            </li>
            <li>
              <a 
                href="/#contact" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === "/") {
                    const el = document.getElementById("contact");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#contact");
                  }
                }}
              >
                <PhoneCall className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Contacto directo</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Atención personalizada 24/7</p>
                </div>
              </a>
            </li>
            <li>
              <a 
                href="/sobre-nosotros" 
                className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-3 group hover:bg-posoqo-black-light/50 p-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/sobre-nosotros");
                }}
              >
                <HelpCircle className="w-4 h-4 text-posoqo-gold group-hover:scale-110 transition-transform duration-300" />
                <div>
                  <span className="text-sm font-medium">Sobre nosotros</span>
                  <p className="text-xs text-posoqo-gray-light mt-1">Conoce nuestra historia y filosofía</p>
                </div>
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter y Legal */}
        <div>
          <h4 className="font-bold text-posoqo-gold mb-6 text-lg">Mantente Conectado</h4>
          
          {/* Newsletter */}
          <div className="mb-8">
            <p className="text-sm mb-4 text-posoqo-white">Suscríbete para recibir noticias y promociones exclusivas.</p>
            <form className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-posoqo-gray-light" />
                <input
                  type="email"
                  placeholder="Tu email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-posoqo-black-light border border-posoqo-gray-dark text-sm focus:outline-none focus:ring-2 focus:ring-posoqo-gold focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-posoqo-gold text-posoqo-black font-bold px-4 py-3 rounded-lg hover:bg-posoqo-gold-light transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Suscribirse</span>
              </button>
            </form>
          </div>

          {/* Enlaces legales */}
          <div className="mb-6">
            <h5 className="font-semibold text-posoqo-gold-light mb-4 text-sm uppercase tracking-wider">Información Legal</h5>
                         <ul className="space-y-2 text-xs" style={{ pointerEvents: 'auto' }}>
               <li>
                                <a href="/terminos" className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-2 hover:underline" style={{ cursor: 'pointer' }}>
                  <FileCheck className="w-3 h-3" />
                  <span>Términos y condiciones</span>
                </a>
              </li>
              <li>
                <a href="/privacidad" className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-2 hover:underline" style={{ cursor: 'pointer' }}>
                  <Shield className="w-3 h-3" />
                  <span>Política de privacidad</span>
                </a>
              </li>
              <li>
                <a href="/sobre-nosotros" className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-2 hover:underline" style={{ cursor: 'pointer' }}>
                  <Shield className="w-3 h-3" />
                  <span>Nuestra empresa</span>
                </a>
              </li>
              <li>
                <a href="/#servicios" className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-2 hover:underline" style={{ cursor: 'pointer' }}>
                  <Award className="w-3 h-3" />
                  <span>Nuestros servicios</span>
                </a>
               </li>
             </ul>
          </div>

          {/* Certificaciones */}
          <div>
            <h5 className="font-semibold text-posoqo-gold-light mb-4 text-sm uppercase tracking-wider">Certificaciones</h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs bg-green-800/20 text-green-200 px-3 py-2 rounded-lg border border-green-700/30">
                <Award className="w-3 h-3" />
                <span>Calidad Premium</span>
              </div>
              <div className="flex items-center space-x-2 text-xs bg-blue-800/20 text-blue-200 px-3 py-2 rounded-lg border border-blue-700/30">
                <Leaf className="w-3 h-3" />
                <span>100% Natural</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-posoqo-gray-dark">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-posoqo-gray-light space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span>Hecho con amor en Ayacucho</span>
            </div>
            <span>•</span>
                         <div className="flex items-center space-x-2">
               <Shield className="w-4 h-4 text-green-400" />
               <span>Pago seguro con Stripe</span>
             </div>
            <span>•</span>
                         <div className="flex items-center space-x-2">
               <Truck className="w-4 h-4 text-blue-400" />
               <span>Envío garantizado</span>
             </div>
          </div>
                     <div className="flex space-x-6" style={{ pointerEvents: 'auto' }}>
                             <a 
               href="/sobre-nosotros" 
               className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-1 cursor-pointer"
               onClick={(e) => {
                 e.preventDefault();
                 router.push("/sobre-nosotros");
               }}
             >
               <FileText className="w-3 h-3" />
               <span>Sobre nosotros</span>
             </a>
             <a 
               href="/#servicios" 
               className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-1 cursor-pointer"
               onClick={(e) => {
                 e.preventDefault();
                 if (window.location.pathname === "/") {
                   const el = document.getElementById("servicios");
                   if (el) el.scrollIntoView({ behavior: "smooth" });
                 } else {
                   router.push("/#servicios");
                 }
               }}
             >
               <Accessibility className="w-3 h-3" />
               <span>Servicios</span>
             </a>
             <a 
               href="/#taprooms" 
               className="hover:text-posoqo-gold transition-colors duration-300 flex items-center space-x-1 cursor-pointer"
               onClick={(e) => {
                 e.preventDefault();
                 if (window.location.pathname === "/") {
                   const el = document.getElementById("taprooms");
                   if (el) el.scrollIntoView({ behavior: "smooth" });
                 } else {
                   router.push("/#taprooms");
                 }
               }}
             >
               <Smartphone className="w-3 h-3" />
               <span>Nuestros espacios</span>
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 