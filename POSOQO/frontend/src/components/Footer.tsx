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
    <footer className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Marca y descripción */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-[#D4AF37] mb-4 text-xl">POSOQO</h4>
            <p className="text-sm mb-6 text-gray-300">
              Cerveza artesanal ayacuchana, elaborada con pasión y tradición andina. 
              Descubre sabores únicos que combinan ingredientes locales con técnicas 
              cerveceras tradicionales.
            </p>
            
            {/* Información de contacto */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Plaza de Armas, Portal Independencia Nº65, Ayacucho</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>+51 966 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>caposoqo@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Lun-Vie: 9:00 - 18:00</span>
              </div>
            </div>

            {/* Redes sociales */}
            <div className="mt-6">
              <h5 className="font-semibold text-[#D4AF37] mb-3 text-sm">Síguenos</h5>
              <div className="flex space-x-3">
                <a href="https://facebook.com/posoqo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37]">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/posoqo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37]">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://wa.me/51966123456" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37]">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Productos y Servicios */}
          <div>
            <h4 className="font-bold text-[#D4AF37] mb-4 text-lg">Productos & Servicios</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/#cervezas" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
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
                  Nuestras cervezas
                </a>
              </li>
              <li>
                <a 
                  href="/#taprooms" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
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
                  Taprooms
                </a>
              </li>
              <li>
                <a 
                  href="/#servicios" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
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
                  Eventos
                </a>
              </li>
              <li>
                <a 
                  href="/#club-posoqo" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
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
                  Club POSOQO
                </a>
              </li>
              <li>
                <a 
                  href="/#gastronomia" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
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
                  Nuestra gastronomía
                </a>
              </li>
            </ul>
          </div>

          {/* Soporte y Atención */}
          <div>
            <h4 className="font-bold text-[#D4AF37] mb-4 text-lg">Soporte & Atención</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/envios" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/envios");
                  }}
                >
                  Política de envíos
                </a>
              </li>
              <li>
                <a 
                  href="/devoluciones" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/devoluciones");
                  }}
                >
                  Devoluciones
                </a>
              </li>
              <li>
                <a 
                  href="/reclamos" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/reclamos");
                  }}
                >
                  Libro de reclamaciones
                </a>
              </li>
              <li>
                <a 
                  href="/#contact" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
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
                  Contacto directo
                </a>
              </li>
              <li>
                <a 
                  href="/sobre-nosotros" 
                  className="text-sm text-gray-400 hover:text-[#D4AF37]"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/sobre-nosotros");
                  }}
                >
                  Sobre nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter y Legal */}
          <div>
            <h4 className="font-bold text-[#D4AF37] mb-4 text-lg">Mantente Conectado</h4>
            
            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm mb-3 text-gray-300">Suscríbete para recibir noticias y promociones exclusivas.</p>
              <form className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#D4AF37] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#FFD700] flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Suscribirse</span>
                </button>
              </form>
            </div>

            {/* Enlaces legales */}
            <div className="mb-4">
              <h5 className="font-semibold text-[#D4AF37] mb-3 text-sm">Información Legal</h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="/terminos" className="text-gray-400 hover:text-[#D4AF37]">
                    Términos y condiciones
                  </a>
                </li>
                <li>
                  <a href="/privacidad" className="text-gray-400 hover:text-[#D4AF37]">
                    Política de privacidad
                  </a>
                </li>
                <li>
                  <a href="/sobre-nosotros" className="text-gray-400 hover:text-[#D4AF37]">
                    Nuestra empresa
                  </a>
                </li>
              </ul>
            </div>

            {/* Certificaciones */}
            <div>
              <h5 className="font-semibold text-[#D4AF37] mb-3 text-sm">Certificaciones</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-green-400">
                  <Award className="w-3 h-3" />
                  <span>Calidad Premium</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-blue-400">
                  <Leaf className="w-3 h-3" />
                  <span>100% Natural</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 space-y-4 md:space-y-0">
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
          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} POSOQO Cervecería Artesanal. Todos los derechos reservados.</p>
            <p className="mt-1">El consumo de bebidas alcohólicas en exceso es perjudicial para la salud. Prohibida su venta a menores de 18 años.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}