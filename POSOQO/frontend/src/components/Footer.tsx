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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Marca y descripción */}
          <div>
            <h4 className="font-bold text-[#D4AF37] mb-4 text-xl">POSOQO</h4>
            <p className="text-sm mb-4 text-gray-300">
              Cerveza artesanal ayacuchana, elaborada con pasión y tradición andina. 
              Descubre sabores únicos que combinan ingredientes locales con técnicas 
              cerveceras tradicionales.
            </p>
            
            {/* Redes sociales */}
            <div className="mb-4">
              <h5 className="font-semibold text-[#D4AF37] mb-3 text-sm">Síguenos</h5>
              <div className="flex space-x-3">
                <a href="https://facebook.com/posoqo" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/posoqo" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://wa.me/51966123456" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-bold text-[#D4AF37] mb-4 text-lg">Contacto</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span>Plaza de Armas, Portal Independencia Nº65, Ayacucho</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>+51 966 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>caposoqo@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Lun-Vie: 9:00 - 18:00</span>
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

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-[#D4AF37] mb-4 text-lg">Newsletter</h4>
            <p className="text-sm mb-4 text-gray-300">Suscríbete para recibir noticias y promociones exclusivas.</p>
            <form className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Tu email"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-[#D4AF37]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-gray-200 placeholder-gray-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold px-4 py-2 rounded-lg hover:from-[#FFD700] hover:to-[#D4AF37] flex items-center justify-center space-x-2 transition-all duration-300"
              >
                <Send className="w-4 h-4" />
                <span>Suscribirse</span>
              </button>
            </form>
          </div>

          {/* Horarios y Ubicaciones */}
          <div>
            <h4 className="font-bold text-[#D4AF37] mb-4 text-lg">Horarios & Ubicaciones</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-[#D4AF37] mb-2 text-sm">Taproom Histórico</h5>
                <p className="text-xs text-gray-400 mb-1">Portal Independencia Nº65</p>
                <p className="text-xs text-gray-400">Lun-Dom: 12:00 - 23:00</p>
              </div>
              <div>
                <h5 className="font-semibold text-[#D4AF37] mb-2 text-sm">Taproom Rockero</h5>
                <p className="text-xs text-gray-400 mb-1">Jr. Asamblea Nº310</p>
                <p className="text-xs text-gray-400">Lun-Dom: 18:00 - 02:00</p>
              </div>
              <div>
                <h5 className="font-semibold text-[#D4AF37] mb-2 text-sm">Taproom Planta</h5>
                <p className="text-xs text-gray-400 mb-1">Sector Público Mz Y</p>
                <p className="text-xs text-gray-400">Lun-Vie: 9:00 - 17:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlaces legales */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-t border-gray-800">
        <div className="flex flex-wrap justify-center items-center space-x-6 text-sm text-gray-400 mb-4">
          <a href="/terminos" className="hover:text-[#D4AF37] transition-colors">Términos y condiciones</a>
          <a href="/privacidad" className="hover:text-[#D4AF37] transition-colors">Política de privacidad</a>
          <a href="/sobre-nosotros" className="hover:text-[#D4AF37] transition-colors">Sobre nosotros</a>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="max-w-7xl mx-auto px-6 pt-4 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start space-x-6">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span>Hecho con amor en Ayacucho</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Pago seguro</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Envío garantizado</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-300">© {new Date().getFullYear()} POSOQO Cervecería Artesanal. Todos los derechos reservados.</p>
            <p className="mt-2 text-xs text-gray-500">El consumo de bebidas alcohólicas en exceso es perjudicial para la salud. Prohibida su venta a menores de 18 años.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}