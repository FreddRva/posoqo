"use client";
import { MessageSquare, FileText, Send, CheckCircle, AlertCircle, Clock, Phone, Mail, Star } from "lucide-react";

export default function ReclamosPage() {
  return (
    <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-8 py-8 sm:py-10 border-b border-amber-400/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <MessageSquare className="w-12 h-12 text-white mr-3" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Libro de Reclamaciones</h1>
            </div>
            <div className="bg-amber-600/20 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
              <p className="text-2xl font-bold text-amber-100 mb-2">
                💬 Tu Opinión es Importante para Nosotros
              </p>
              <p className="text-amber-200 font-medium">
                Cada comentario nos ayuda a mejorar y brindarte un mejor servicio
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-10">
          <div className="prose prose-invert max-w-none">
            {/* Importancia de la Opinión */}
            <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-8 rounded-2xl border-2 border-amber-500/50 text-center mb-10">
              <div className="flex items-center justify-center mb-4">
                <Star className="w-16 h-16 text-amber-400 mr-4" />
                <div>
                  <h2 className="text-3xl font-bold text-amber-300 mb-2">
                    Valoramos tu Opinión
                  </h2>
                  <p className="text-xl text-amber-200">
                    Cada comentario, sugerencia o reclamación nos ayuda a crecer
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <MessageSquare className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Comunicación Abierta</h3>
                  <p className="text-amber-200 text-sm">Escuchamos todas tus opiniones</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <CheckCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Mejora Continua</h3>
                  <p className="text-amber-200 text-sm">Cada feedback nos hace mejores</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Send className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Respuesta Rápida</h3>
                  <p className="text-amber-200 text-sm">Te respondemos en máximo 24 horas</p>
                </div>
              </div>
            </div>

            {/* Section 1 - Tipos de Comentarios */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">1</div>
                <h2 className="text-2xl font-bold text-amber-400">¿Qué Puedes Reportar?</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                      Sugerencias y Mejoras
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Ideas para nuevos productos</li>
                      <li>• Mejoras en el servicio</li>
                      <li>• Sugerencias de menú</li>
                      <li>• Propuestas de eventos</li>
                      <li>• Comentarios sobre la experiencia</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                      Reclamaciones
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Problemas con productos</li>
                      <li>• Mal servicio o atención</li>
                      <li>• Retrasos en entregas</li>
                      <li>• Problemas de facturación</li>
                      <li>• Cualquier inconveniente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 - Proceso de Reclamación */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">2</div>
                <h2 className="text-2xl font-bold text-amber-400">Proceso de Atención</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Recepción</h4>
                    <p className="text-xs text-gray-300">Recibimos tu comentario</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Análisis</h4>
                    <p className="text-xs text-gray-300">Evaluamos la situación</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Solución</h4>
                    <p className="text-xs text-gray-300">Implementamos mejoras</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">4</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Seguimiento</h4>
                    <p className="text-xs text-gray-300">Verificamos satisfacción</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 - Formulario de Reclamación */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">3</div>
                <h2 className="text-2xl font-bold text-amber-400">Formulario de Reclamación</h2>
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
                        <label className="block text-amber-300 font-semibold mb-2">Tipo de Comentario *</label>
                        <select className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                          <option value="">Selecciona una opción</option>
                          <option value="sugerencia">Sugerencia o Mejora</option>
                          <option value="reclamacion">Reclamación</option>
                          <option value="felicitacion">Felicitación</option>
                          <option value="consulta">Consulta General</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-amber-300 font-semibold mb-2">Asunto *</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Resumen breve de tu comentario"
                      />
                    </div>

                    <div>
                      <label className="block text-amber-300 font-semibold mb-2">Descripción Detallada *</label>
                      <textarea 
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-amber-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        placeholder="Describe detalladamente tu comentario, sugerencia o reclamación. Incluye fechas, nombres de personas involucradas y cualquier detalle que consideres relevante."
                      ></textarea>
                    </div>

                    <div className="flex items-center space-x-4">
                      <input 
                        type="checkbox" 
                        id="contacto" 
                        className="w-4 h-4 text-amber-600 bg-gray-700 border-amber-600 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="contacto" className="text-amber-300 text-sm">
                        Autorizo que me contacten para dar seguimiento a mi comentario
                      </label>
                    </div>

                    <div className="text-center">
                      <button 
                        type="submit"
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <Send className="inline w-5 h-5 mr-2" />
                        Enviar Comentario
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            {/* Section 4 - Compromisos */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">4</div>
                <h2 className="text-2xl font-bold text-amber-400">Nuestros Compromisos</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">Compromiso de Respuesta</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Respuesta en máximo 24 horas</li>
                      <li>• Seguimiento personalizado</li>
                      <li>• Soluciones concretas</li>
                      <li>• Mejoras implementadas</li>
                      <li>• Comunicación transparente</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">Compromiso de Mejora</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Análisis de cada comentario</li>
                      <li>• Implementación de mejoras</li>
                      <li>• Capacitación del personal</li>
                      <li>• Revisión de procesos</li>
                      <li>• Medición de satisfacción</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-6 rounded-xl border border-amber-700 text-center">
                  <h3 className="text-xl font-bold text-amber-300 mb-3">
                    🎯 Tu Opinión Transforma POSOQO
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Cada comentario que recibimos es una oportunidad para mejorar y brindarte 
                    una experiencia excepcional. Tu voz es fundamental en nuestro crecimiento.
                  </p>
                  <div className="bg-amber-800/20 p-4 rounded-lg inline-block">
                    <p className="text-2xl font-bold text-amber-400">
                      "Juntos Construimos la Excelencia"
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 - Canales de Contacto */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">5</div>
                <h2 className="text-2xl font-bold text-amber-400">Canales de Contacto</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <Phone className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-amber-300 mb-2">Línea Directa</h4>
                    <p className="text-amber-200 font-medium mb-1">+51 966 123 456</p>
                    <p className="text-xs text-amber-300">Lun-Dom 9:00 AM - 8:00 PM</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <Mail className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-amber-300 mb-2">Email</h4>
                    <p className="text-amber-200 font-medium mb-1">reclamos@posoqo.com</p>
                    <p className="text-xs text-amber-300">Respuesta en 2-4 horas</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <MessageSquare className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-amber-300 mb-2">WhatsApp</h4>
                    <p className="text-amber-200 font-medium mb-1">+51 966 123 456</p>
                    <p className="text-xs text-amber-300">Respuesta inmediata</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 - Seguimiento */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">6</div>
                <h2 className="text-2xl font-bold text-amber-400">Seguimiento y Resolución</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">Proceso de Seguimiento</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Confirmación de recepción</li>
                      <li>• Asignación de responsable</li>
                      <li>• Análisis y evaluación</li>
                      <li>• Implementación de solución</li>
                      <li>• Verificación de satisfacción</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">Tiempos de Resolución</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Consultas simples: 2-4 horas</li>
                      <li>• Sugerencias: 24-48 horas</li>
                      <li>• Reclamaciones: 48-72 horas</li>
                      <li>• Casos complejos: 5-7 días</li>
                      <li>• Seguimiento continuo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 p-8 rounded-xl border border-amber-700 text-center">
              <h3 className="text-2xl font-bold text-amber-300 mb-4">
                ¿Tienes Alguna Opinión o Reclamación?
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                Tu voz es fundamental para nosotros. Cada comentario nos ayuda a mejorar y brindarte 
                la mejor experiencia posible en POSOQO.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Escribir Comentario
                </button>
                <button className="bg-transparent border-2 border-amber-600 text-amber-400 hover:bg-amber-600 hover:text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Llamar Ahora
                </button>
              </div>
            </div>

            {/* Final Note */}
            <div className="bg-gray-700/50 p-6 rounded-xl border-2 border-amber-500/50 text-center">
              <p className="text-lg font-bold text-amber-400 mb-2">
                💬 Tu Opinión es Importante para Nosotros - Siempre
              </p>
              <p className="text-gray-300">
                En POSOQO, creemos que la excelencia se construye día a día con la ayuda de nuestros 
                valiosos clientes. Cada comentario, sugerencia o reclamación es una oportunidad para 
                mejorar y brindarte la experiencia que mereces. Gracias por ser parte de nuestro crecimiento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}