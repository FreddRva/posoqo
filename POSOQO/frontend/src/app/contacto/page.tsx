"use client";
import { Phone, Mail, MapPin, Clock, MessageSquare, Users, Star, Send, CheckCircle } from "lucide-react";

export default function ContactoPage() {
  return (
    <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-8 py-8 sm:py-10 border-b border-amber-400/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Phone className="w-12 h-12 text-white mr-3" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Contacto Directo</h1>
            </div>
            <div className="bg-amber-600/20 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
              <p className="text-2xl font-bold text-amber-100 mb-2">
                🕐 Atención Personalizada 24/7
              </p>
              <p className="text-amber-200 font-medium">
                Estamos aquí para ti en cualquier momento del día
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-10">
          <div className="prose prose-invert max-w-none">
            {/* Atención 24/7 */}
            <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-8 rounded-2xl border-2 border-amber-500/50 text-center mb-10">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-16 h-16 text-amber-400 mr-4" />
                <div>
                  <h2 className="text-3xl font-bold text-amber-300 mb-2">
                    Atención Personalizada 24/7
                  </h2>
                  <p className="text-xl text-amber-200">
                    Nuestro equipo está disponible para ti en cualquier momento
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">24 Horas</h3>
                  <p className="text-amber-200 text-sm">Disponibles todos los días</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Users className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Personalizado</h3>
                  <p className="text-amber-200 text-sm">Atención individualizada</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Star className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Excelencia</h3>
                  <p className="text-amber-200 text-sm">Calidad en cada interacción</p>
                </div>
              </div>
            </div>

            {/* Section 1 - Canales de Contacto */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">1</div>
                <h2 className="text-2xl font-bold text-amber-400">Canales de Contacto</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                    <div className="flex items-center mb-4">
                      <Phone className="w-8 h-8 text-amber-400 mr-3" />
                      <h3 className="text-xl font-semibold text-amber-300">Línea Telefónica</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <p className="text-amber-200 font-medium">📞 Línea Principal</p>
                        <p className="text-amber-100 text-lg font-bold">+51 966 123 456</p>
                        <p className="text-xs text-amber-300">Disponible 24/7</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <p className="text-amber-200 font-medium">📱 WhatsApp</p>
                        <p className="text-amber-100 text-lg font-bold">+51 966 123 456</p>
                        <p className="text-xs text-amber-300">Respuesta inmediata</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <p className="text-amber-200 font-medium">🔔 Emergencias</p>
                        <p className="text-amber-100 text-lg font-bold">+51 966 999 999</p>
                        <p className="text-xs text-amber-300">Solo emergencias</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                    <div className="flex items-center mb-4">
                      <Mail className="w-8 h-8 text-amber-400 mr-3" />
                      <h3 className="text-xl font-semibold text-amber-300">Comunicación Digital</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <p className="text-amber-200 font-medium">📧 Email General</p>
                        <p className="text-amber-100 text-lg font-bold">info@posoqo.com</p>
                        <p className="text-xs text-amber-300">Respuesta en 2-4 horas</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <p className="text-amber-200 font-medium">💬 Chat en Vivo</p>
                        <p className="text-amber-100 text-lg font-bold">Disponible en web</p>
                        <p className="text-xs text-amber-300">Soporte técnico</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <p className="text-amber-200 font-medium">📱 Redes Sociales</p>
                        <p className="text-amber-100 text-lg font-bold">@posoqo</p>
                        <p className="text-xs text-amber-300">Instagram, Facebook</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 - Ubicación y Horarios */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">2</div>
                <h2 className="text-2xl font-bold text-amber-400">Ubicación y Horarios</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                    <div className="flex items-center mb-4">
                      <MapPin className="w-8 h-8 text-amber-400 mr-3" />
                      <h3 className="text-xl font-semibold text-amber-300">Nuestra Ubicación</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-800/20 p-4 rounded-lg">
                        <p className="text-amber-200 font-medium mb-2">📍 Dirección Principal</p>
                        <p className="text-amber-100 text-sm leading-relaxed">
                          Plaza de Armas, Portal Independencia Nº65<br />
                          Jr. Argentina Mz. Y Lt. 05<br />
                          Ayacucho 05001, Perú
                        </p>
                      </div>
                      <div className="bg-amber-800/20 p-4 rounded-lg">
                        <p className="text-amber-200 font-medium mb-2">🚗 Cómo Llegar</p>
                        <ul className="text-amber-100 text-sm space-y-1">
                          <li>• Desde Plaza de Armas: 2 minutos caminando</li>
                          <li>• Desde Terminal: 15 minutos en taxi</li>
                          <li>• Desde Aeropuerto: 25 minutos en taxi</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                    <div className="flex items-center mb-4">
                      <Clock className="w-8 h-8 text-amber-400 mr-3" />
                      <h3 className="text-xl font-semibold text-amber-300">Horarios de Atención</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-800/20 p-4 rounded-lg">
                        <p className="text-amber-200 font-medium mb-2">🏪 Taproom Principal</p>
                        <p className="text-amber-100 text-sm">
                          <strong>Lunes a Domingo:</strong><br />
                          11:00 AM - 11:00 PM
                        </p>
                      </div>
                      <div className="bg-amber-800/20 p-4 rounded-lg">
                        <p className="text-amber-200 font-medium mb-2">📞 Servicio al Cliente</p>
                        <p className="text-amber-100 text-sm">
                          <strong>24/7:</strong><br />
                          Disponible todos los días
                        </p>
                      </div>
                      <div className="bg-amber-800/20 p-4 rounded-lg">
                        <p className="text-amber-200 font-medium mb-2">🚚 Delivery</p>
                        <p className="text-amber-100 text-sm">
                          <strong>Lunes a Domingo:</strong><br />
                          9:00 AM - 10:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 - Formulario de Contacto */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">3</div>
                <h2 className="text-2xl font-bold text-amber-400">Formulario de Contacto</h2>
              </div>
              <div className="pl-14">
                <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-amber-300 font-semibold mb-2">Nombre Completo *</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div>
                        <label className="block text-amber-300 font-semibold mb-2">Email *</label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-amber-300 font-semibold mb-2">Teléfono</label>
                        <input 
                          type="tel" 
                          className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="+51 966 123 456"
                        />
                      </div>
                      <div>
                        <label className="block text-amber-300 font-semibold mb-2">Tipo de Consulta *</label>
                        <select className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                          <option value="">Selecciona una opción</option>
                          <option value="productos">Consulta sobre Productos</option>
                          <option value="servicios">Información de Servicios</option>
                          <option value="reservas">Reservas y Eventos</option>
                          <option value="delivery">Delivery y Envíos</option>
                          <option value="reclamos">Reclamos y Sugerencias</option>
                          <option value="general">Consulta General</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-amber-300 font-semibold mb-2">Asunto *</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Resumen de tu consulta"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-300 font-semibold mb-2">Mensaje *</label>
                      <textarea 
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        placeholder="Describe tu consulta o solicitud detalladamente..."
                      ></textarea>
                    </div>

                    <div className="flex items-center space-x-4">
                      <input 
                        type="checkbox" 
                        id="contacto" 
                        className="w-4 h-4 text-amber-600 bg-gray-700 border-amber-600 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="contacto" className="text-amber-300 text-sm">
                        Autorizo que me contacten por teléfono o email
                      </label>
                    </div>

                    <div className="text-center">
                      <button 
                        type="submit"
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <Send className="inline w-5 h-5 mr-2" />
                        Enviar Mensaje
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            {/* Section 4 - Servicios de Atención */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">4</div>
                <h2 className="text-2xl font-bold text-amber-400">Servicios de Atención</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Atención Inmediata</h4>
                    <p className="text-xs text-gray-300">Respuesta en tiempo real</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Personal Especializado</h4>
                    <p className="text-xs text-gray-300">Equipo capacitado</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Calidad Premium</h4>
                    <p className="text-xs text-gray-300">Servicio excepcional</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-6 rounded-xl border border-amber-700 text-center">
                  <h3 className="text-xl font-bold text-amber-300 mb-3">
                    🎯 Compromiso de Excelencia
                  </h3>
                  <p className="text-gray-300 mb-4">
                    En POSOQO, cada interacción es una oportunidad para demostrar nuestro compromiso 
                    con la excelencia y la satisfacción total del cliente.
                  </p>
                  <div className="bg-amber-800/20 p-4 rounded-lg inline-block">
                    <p className="text-2xl font-bold text-amber-400">
                      "Tu Satisfacción es Nuestra Prioridad"
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 - FAQ Rápido */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">5</div>
                <h2 className="text-2xl font-bold text-amber-400">Preguntas Frecuentes</h2>
              </div>
              <div className="pl-14">
                <div className="space-y-4">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-lg font-semibold text-amber-300 mb-2">¿Cuál es el horario de atención?</h3>
                    <p className="text-gray-300">Nuestro servicio al cliente está disponible 24/7, mientras que nuestros taprooms abren de 11:00 AM a 11:00 PM todos los días.</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-lg font-semibold text-amber-300 mb-2">¿En qué horarios hacen delivery?</h3>
                    <p className="text-gray-300">Nuestro servicio de delivery está disponible de 9:00 AM a 10:00 PM, de lunes a domingo, cubriendo toda Ayacucho y provincias.</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-lg font-semibold text-amber-300 mb-2">¿Cuánto tiempo tardan en responder?</h3>
                    <p className="text-gray-300">Nos comprometemos a responder en máximo 2-4 horas por email y de forma inmediata por teléfono y WhatsApp.</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-lg font-semibold text-amber-300 mb-2">¿Puedo hacer reservas por teléfono?</h3>
                    <p className="text-gray-300">¡Por supuesto! Puedes hacer reservas llamando a nuestra línea principal o enviando un mensaje por WhatsApp.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 p-8 rounded-xl border border-amber-700 text-center">
              <h3 className="text-2xl font-bold text-amber-300 mb-4">
                ¿Necesitas Ayuda Inmediata?
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                Nuestro equipo está disponible 24/7 para brindarte la atención personalizada que mereces.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Phone className="w-5 h-5" />
                    <span className="font-semibold">Llamar Ahora</span>
                  </div>
                  <p className="text-amber-200 font-medium">+51 966 123 456</p>
                  <p className="text-xs text-amber-300">Línea principal 24/7</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-semibold">WhatsApp</span>
                  </div>
                  <p className="text-amber-200 font-medium">+51 966 123 456</p>
                  <p className="text-xs text-amber-300">Respuesta inmediata</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Mail className="w-5 h-5" />
                    <span className="font-semibold">Email</span>
                  </div>
                  <p className="text-amber-200 font-medium">info@posoqo.com</p>
                  <p className="text-xs text-amber-300">Respuesta en 2-4h</p>
                </div>
              </div>
            </div>

            {/* Final Note */}
            <div className="bg-gray-700/50 p-6 rounded-xl border-2 border-amber-500/50 text-center">
              <p className="text-lg font-bold text-amber-400 mb-2">
                🕐 Atención Personalizada 24/7 - Siempre a tu Servicio
              </p>
              <p className="text-gray-300">
                En POSOQO, creemos que la excelencia en el servicio al cliente es fundamental. 
                Por eso mantenemos nuestros canales de comunicación abiertos las 24 horas del día, 
                los 7 días de la semana, para brindarte la atención personalizada que mereces en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
