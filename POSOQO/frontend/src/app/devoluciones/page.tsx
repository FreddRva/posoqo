"use client";
import { RefreshCw, Shield, CheckCircle, Clock, Package, Phone, Mail, AlertCircle } from "lucide-react";

export default function DevolucionesPage() {
  return (
    <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-8 py-8 sm:py-10 border-b border-amber-400/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <RefreshCw className="w-12 h-12 text-white mr-3" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Política de Devoluciones</h1>
            </div>
            <div className="bg-amber-600/20 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
              <p className="text-2xl font-bold text-amber-100 mb-2">
                🎯 Garantía de Satisfacción del 100%
              </p>
              <p className="text-amber-200 font-medium">
                Tu satisfacción es nuestra prioridad absoluta
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-10">
          <div className="prose prose-invert max-w-none">
            {/* Garantía Principal */}
            <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-8 rounded-2xl border-2 border-amber-500/50 text-center mb-10">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-16 h-16 text-amber-400 mr-4" />
                <div>
                  <h2 className="text-3xl font-bold text-amber-300 mb-2">
                    Garantía de Satisfacción del 100%
                  </h2>
                  <p className="text-xl text-amber-200">
                    Si no estás completamente satisfecho, te devolvemos tu dinero
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <CheckCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Sin Preguntas</h3>
                  <p className="text-amber-200 text-sm">Devolución inmediata sin interrogatorios</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">30 Días</h3>
                  <p className="text-amber-200 text-sm">Plazo amplio para tu decisión</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Package className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Reembolso Total</h3>
                  <p className="text-amber-200 text-sm">100% de tu dinero de vuelta</p>
                </div>
              </div>
            </div>

            {/* Section 1 - Cómo Funciona */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">1</div>
                <h2 className="text-2xl font-bold text-amber-400">¿Cómo Funciona la Devolución?</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Contacto</h4>
                    <p className="text-xs text-gray-300">Llámanos o escríbenos</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Recogida</h4>
                    <p className="text-xs text-gray-300">Recogemos el producto</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Verificación</h4>
                    <p className="text-xs text-gray-300">Revisamos el estado</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">4</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Reembolso</h4>
                    <p className="text-xs text-gray-300">Dinero de vuelta</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 - Condiciones */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">2</div>
                <h2 className="text-2xl font-bold text-amber-400">Condiciones de Devolución</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                      Productos Elegibles
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Cervezas artesanales en buen estado</li>
                      <li>• Productos de gastronomía no consumidos</li>
                      <li>• Merchandising y accesorios</li>
                      <li>• Productos con defectos de fabricación</li>
                      <li>• Productos que no cumplen expectativas</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                      Restricciones
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Productos consumidos o abiertos</li>
                      <li>• Daños por mal uso del cliente</li>
                      <li>• Productos personalizados</li>
                      <li>• Productos en oferta especial</li>
                      <li>• Pasado el plazo de 30 días</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 - Plazos */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">3</div>
                <h2 className="text-2xl font-bold text-amber-400">Plazos y Tiempos</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-amber-300 mb-2">Devolución Inmediata</h4>
                    <p className="text-2xl font-bold text-amber-400 mb-1">24-48 horas</p>
                    <p className="text-xs text-gray-300">Para productos en mal estado</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <RefreshCw className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-amber-300 mb-2">Devolución Estándar</h4>
                    <p className="text-2xl font-bold text-amber-400 mb-1">3-5 días</p>
                    <p className="text-xs text-gray-300">Para productos en buen estado</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <Package className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-amber-300 mb-2">Reembolso</h4>
                    <p className="text-2xl font-bold text-amber-400 mb-1">5-7 días</p>
                    <p className="text-xs text-gray-300">Procesamiento bancario</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 - Proceso Detallado */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">4</div>
                <h2 className="text-2xl font-bold text-amber-400">Proceso Detallado</h2>
              </div>
              <div className="pl-14 space-y-6">
                <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                  <h3 className="text-xl font-semibold text-amber-300 mb-3">4.1 Solicitud de Devolución</h3>
                  <p className="mb-3 text-gray-300">
                    Para iniciar una devolución, puedes contactarnos de las siguientes maneras:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-amber-800/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-amber-300 mb-2">📞 Por Teléfono</h4>
                      <p className="text-sm text-gray-300">Llamada directa a nuestro servicio al cliente</p>
                    </div>
                    <div className="bg-amber-800/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-amber-300 mb-2">📧 Por Email</h4>
                      <p className="text-sm text-gray-300">Envío de solicitud por correo electrónico</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                  <h3 className="text-xl font-semibold text-amber-300 mb-3">4.2 Recogida del Producto</h3>
                  <p className="mb-3 text-gray-300">
                    Una vez aprobada la devolución, coordinamos la recogida:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li><strong>Recogida gratuita:</strong> En tu domicilio o punto de venta</li>
                    <li><strong>Horarios flexibles:</strong> De 9:00 AM a 8:00 PM</li>
                    <li><strong>Documentación:</strong> Solo necesitas tu DNI y comprobante</li>
                    <li><strong>Empaque:</strong> Te proporcionamos el empaque necesario</li>
                  </ul>
                </div>

                <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                  <h3 className="text-xl font-semibold text-amber-300 mb-3">4.3 Verificación y Procesamiento</h3>
                  <p className="mb-3 text-gray-300">
                    Nuestro equipo verifica el estado del producto:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-amber-800/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-amber-300 mb-2">✅ Verificación Rápida</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Estado del producto</li>
                        <li>• Empaque original</li>
                        <li>• Accesorios incluidos</li>
                      </ul>
                    </div>
                    <div className="bg-amber-800/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-amber-300 mb-2">💳 Procesamiento</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Aprobación inmediata</li>
                        <li>• Inicio de reembolso</li>
                        <li>• Notificación por SMS/Email</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 - Garantías Adicionales */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">5</div>
                <h2 className="text-2xl font-bold text-amber-400">Garantías Adicionales</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">Garantía de Calidad</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Productos 100% artesanales</li>
                      <li>• Ingredientes de primera calidad</li>
                      <li>• Procesos certificados</li>
                      <li>• Control de calidad riguroso</li>
                      <li>• Trazabilidad completa</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">Garantía de Servicio</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Atención personalizada</li>
                      <li>• Resolución rápida</li>
                      <li>• Seguimiento completo</li>
                      <li>• Soporte post-venta</li>
                      <li>• Mejora continua</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-6 rounded-xl border border-amber-700 text-center">
                  <h3 className="text-xl font-bold text-amber-300 mb-3">
                    🎯 Nuestro Compromiso
                  </h3>
                  <p className="text-gray-300 mb-4">
                    En POSOQO, cada cliente es único y valioso. Nuestra política de devoluciones 
                    refleja nuestro compromiso absoluto con tu satisfacción y la calidad de nuestros productos.
                  </p>
                  <div className="bg-amber-800/20 p-4 rounded-lg inline-block">
                    <p className="text-2xl font-bold text-amber-400">
                      "Tu Satisfacción es Nuestra Prioridad"
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 p-8 rounded-xl border border-amber-700 text-center">
              <h3 className="text-2xl font-bold text-amber-300 mb-4">
                ¿Necesitas Hacer una Devolución?
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                Nuestro equipo está listo para ayudarte con cualquier consulta sobre devoluciones.
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Phone className="w-5 h-5" />
                    <span className="font-semibold">Línea Directa</span>
                  </div>
                  <p className="text-amber-200 font-medium">+51 966 123 456</p>
                  <p className="text-xs text-amber-300">Lun-Dom 9:00 AM - 8:00 PM</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Mail className="w-5 h-5" />
                    <span className="font-semibold">Email</span>
                  </div>
                  <p className="text-amber-200 font-medium">devoluciones@posoqo.com</p>
                  <p className="text-xs text-amber-300">Respuesta en 2-4 horas</p>
                </div>
              </div>
            </div>

            {/* Final Note */}
            <div className="bg-gray-700/50 p-6 rounded-xl border-2 border-amber-500/50 text-center">
              <p className="text-lg font-bold text-amber-400 mb-2">
                🎯 Garantía de Satisfacción del 100% - Sin Excepciones
              </p>
              <p className="text-gray-300">
                En POSOQO creemos que la confianza de nuestros clientes es nuestro activo más valioso. 
                Por eso ofrecemos la garantía más sólida del mercado: si no estás completamente satisfecho, 
                te devolvemos tu dinero. Sin preguntas, sin complicaciones, sin excepciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}