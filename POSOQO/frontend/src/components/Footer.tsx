"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Footer() {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  
  return (
    <footer className="w-full bg-black text-white">
      {/* Dropdown Más información */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-center">
          <button
            onClick={() => setShowMoreInfo(!showMoreInfo)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Más información
            <ChevronDown className={`w-4 h-4 transition-transform ${showMoreInfo ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showMoreInfo && (
          <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-lg shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* Acerca de */}
              <div>
                <h4 className="font-bold text-yellow-400 mb-4 text-sm">Acerca de</h4>
                <ul className="space-y-2">
                  <li><a href="/historia" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Nuestra historia</a></li>
                  <li><a href="/proceso" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Proceso artesanal</a></li>
                  <li><a href="/sustentabilidad" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Sustentabilidad</a></li>
                  <li><a href="/blog" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Blog</a></li>
                </ul>
              </div>

              {/* Productos */}
              <div>
                <h4 className="font-bold text-yellow-400 mb-4 text-sm">Productos</h4>
                <ul className="space-y-2">
                  <li><a href="/products?filter=cerveza" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Cervezas</a></li>
                  <li><a href="/products?filter=comidas" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Gastronomía</a></li>
                  <li><a href="/products?filter=refrescos" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Refrescos</a></li>
                  <li><a href="/promociones" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Promociones</a></li>
                </ul>
              </div>

              {/* Ayuda */}
              <div>
                <h4 className="font-bold text-yellow-400 mb-4 text-sm">Ayuda</h4>
                <ul className="space-y-2">
                  <li><a href="/contacto" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Contacto</a></li>
                  <li><a href="/como-comprar" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Cómo comprar</a></li>
                  <li><a href="/envios" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Envíos</a></li>
                  <li><a href="/devoluciones" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Devoluciones</a></li>
                  <li><a href="/reclamos" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors font-semibold">📋 Libro de Reclamaciones</a></li>
                </ul>
              </div>

              {/* Redes sociales */}
              <div>
                <h4 className="font-bold text-yellow-400 mb-4 text-sm">Redes sociales</h4>
                <ul className="space-y-2">
                  <li><a href="https://facebook.com/posoqo" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Facebook</a></li>
                  <li><a href="https://instagram.com/posoqo" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Instagram</a></li>
                  <li><a href="https://wa.me/51956099690" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">WhatsApp</a></li>
                </ul>
              </div>

              {/* Mi cuenta */}
              <div>
                <h4 className="font-bold text-yellow-400 mb-4 text-sm">Mi cuenta</h4>
                <ul className="space-y-2">
                  <li><a href="/profile" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Mi perfil</a></li>
                  <li><a href="/favorites" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Favoritos</a></li>
                  <li><a href="/orders" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Mis pedidos</a></li>
                  <li><a href="/reservas" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Reservas</a></li>
                </ul>
              </div>

              {/* Eventos */}
              <div>
                <h4 className="font-bold text-yellow-400 mb-4 text-sm">Eventos</h4>
                <ul className="space-y-2">
                  <li><a href="/eventos" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Próximos eventos</a></li>
                  <li><a href="/taprooms" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Taprooms</a></li>
                  <li><a href="/degustaciones" className="text-sm text-gray-400 hover:text-yellow-400 transition-colors">Degustaciones</a></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Enlaces legales */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-t border-white/10">
        <div className="flex flex-wrap justify-center items-center space-x-6 text-xs text-gray-400 mb-4">
          <a href="/terminos" className="hover:text-yellow-400 transition-colors">Términos y condiciones</a>
          <a href="/privacidad" className="hover:text-yellow-400 transition-colors">Política de privacidad</a>
          <a href="/accesibilidad" className="hover:text-yellow-400 transition-colors">Accesibilidad</a>
          <a href="/ayuda" className="hover:text-yellow-400 transition-colors">Ayuda</a>
          <a href="/reclamos" className="hover:text-yellow-400 transition-colors font-semibold">📋 Reclamos</a>
        </div>
      </div>

      {/* Copyright y dirección */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="text-center text-xs text-gray-400">
          <p>Copyright © 2024-{new Date().getFullYear()} POSOQO Cervecería Artesanal. Todos los derechos reservados.</p>
          <p className="mt-1">Portal Independencia Nº65, Plaza de Armas, Ayacucho, Perú.</p>
          <p className="mt-1">El consumo de bebidas alcohólicas en exceso es perjudicial para la salud. Prohibida su venta a menores de 18 años.</p>
        </div>
      </div>
    </footer>
  );
}