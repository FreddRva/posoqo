"use client";
import { Truck, MapPin, Clock, Package, Shield, Star, Phone, Mail, Navigation } from "lucide-react";

export default function EnviosPage() {
  return (
    <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-8 py-8 sm:py-10 border-b border-amber-400/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Truck className="w-12 h-12 text-white mr-3" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Política de Envíos</h1>
            </div>
            <p className="text-lg text-amber-100 font-medium">
              Llevamos POSOQO a todo Ayacucho y provincias
            </p>
            <p className="text-amber-200 mt-3">
              Envío rápido, seguro y con seguimiento en tiempo real
            </p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-10">
          <div className="prose prose-invert max-w-none">
            <div className="bg-amber-900/20 p-6 rounded-xl border border-amber-800 mb-8">
              <p className="text-amber-100 text-lg leading-relaxed">
                En POSOQO nos comprometemos a llevar la auténtica cerveza ayacuchana a todos los rincones de la región. 
                Nuestra política de envíos está diseñada para garantizar que recibas tus productos en perfectas condiciones, 
                con la máxima rapidez y seguridad posible.
              </p>
            </div>

            {/* Section 1 - Cobertura de Envíos */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">1</div>
                <h2 className="text-2xl font-bold text-amber-400 flex items-center">
                  <MapPin className="w-6 h-6 mr-2" />
                  Cobertura de Envíos
                </h2>
              </div>
              <div className="pl-12">
                <h3 className="text-xl font-semibold text-amber-300 mb-3">1.1 Área de Cobertura Principal</h3>
                <p className="mb-4 text-gray-300">
                  Cubrimos toda la región de Ayacucho con envíos directos:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800">
                    <h4 className="font-semibold text-amber-300 mb-2">Ciudad de Ayacucho</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Centro histórico</li>
                      <li>• Distritos periféricos</li>
                      <li>• Zonas residenciales</li>
                      <li>• Áreas comerciales</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800">
                    <h4 className="font-semibold text-amber-300 mb-2">Provincias</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Huamanga</li>
                      <li>• Cangallo</li>
                      <li>• Huanta</li>
                      <li>• La Mar</li>
                      <li>• Lucanas</li>
                      <li>• Parinacochas</li>
                      <li>• Víctor Fajardo</li>
                      <li>• Sucre</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-amber-300 mb-3">1.2 Envíos Especiales</h3>
                <p className="mb-4 text-gray-300">
                  Para ubicaciones fuera de nuestra cobertura estándar, ofrecemos envíos especiales:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>Envíos interprovinciales:</strong> Coordinamos con transportistas especializados</li>
                  <li><strong>Zonas rurales:</strong> Adaptamos nuestros servicios según la accesibilidad</li>
                  <li><strong>Eventos especiales:</strong> Envíos programados para celebraciones y ferias</li>
                  <li><strong>Pedidos corporativos:</strong> Servicios de entrega para empresas y organizaciones</li>
                </ul>
              </div>
            </section>

            {/* Section 2 - Tiempos de Entrega */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-amber-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">2</div>
                <h2 className="text-2xl font-bold text-amber-400 flex items-center">
                  <Clock className="w-6 h-6 mr-2" />
                  Tiempos de Entrega
                </h2>
              </div>
              <div className="pl-12">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Envío Express</h4>
                    <p className="text-2xl font-bold text-amber-400 mb-1">2-4 horas</p>
                    <p className="text-xs text-gray-300">Ciudad de Ayacucho</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Envío Estándar</h4>
                    <p className="text-2xl font-bold text-amber-400 mb-1">24-48 horas</p>
                    <p className="text-xs text-gray-300">Provincias cercanas</p>
                  </div>
                  <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Envío Extendido</h4>
                    <p className="text-2xl font-bold text-amber-400 mb-1">3-5 días</p>
                    <p className="text-xs text-gray-300">Provincias remotas</p>
                  </div>
                </div>

                <div className="bg-yellow-900/20 p-5 rounded-lg border border-yellow-800">
                  <p className="text-yellow-300 font-medium">
                    <strong>Nota importante:</strong> Los tiempos de entrega pueden variar según condiciones climáticas, 
                    eventos especiales o alta demanda. Te mantendremos informado sobre el estado de tu envío.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 - Costos de Envío */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">3</div>
                <h2 className="text-2xl font-bold text-green-400 flex items-center">
                  <Package className="w-6 h-6 mr-2" />
                  Costos y Tarifas
                </h2>
              </div>
              <div className="pl-12">
                <h3 className="text-xl font-semibold text-green-300 mb-3">3.1 Tarifas por Zona</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-800">
                    <h4 className="font-semibold text-green-300 mb-2">Ciudad de Ayacucho</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li><strong>Envío Express:</strong> S/ 8.00</li>
                      <li><strong>Envío Estándar:</strong> S/ 5.00</li>
                      <li><strong>Pedidos +S/ 100:</strong> ¡GRATIS!</li>
                    </ul>
                  </div>
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-800">
                    <h4 className="font-semibold text-green-300 mb-2">Provincias</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li><strong>Provincias cercanas:</strong> S/ 12.00</li>
                      <li><strong>Provincias intermedias:</strong> S/ 18.00</li>
                      <li><strong>Provincias remotas:</strong> S/ 25.00</li>
                      <li><strong>Pedidos +S/ 200:</strong> ¡GRATIS!</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-green-300 mb-3">3.2 Factores que Afectan el Costo</h3>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>Distancia:</strong> Mayor distancia = mayor costo</li>
                  <li><strong>Peso del pedido:</strong> Productos más pesados pueden tener costos adicionales</li>
                  <li><strong>Urgencia:</strong> Envíos express tienen tarifa premium</li>
                  <li><strong>Accesibilidad:</strong> Zonas de difícil acceso pueden requerir costos adicionales</li>
                </ul>
              </div>
            </section>

            {/* Section 4 - Proceso de Envío */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">4</div>
                <h2 className="text-2xl font-bold text-green-400 flex items-center">
                  <Navigation className="w-6 h-6 mr-2" />
                  Proceso de Envío
                </h2>
              </div>
              <div className="pl-12">
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-900/20 p-3 rounded-lg border border-green-800 text-center">
                    <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h4 className="font-semibold text-green-300 mb-1 text-sm">Confirmación</h4>
                    <p className="text-xs text-gray-300">Pedido confirmado y preparado</p>
                  </div>
                  <div className="bg-green-900/20 p-3 rounded-lg border border-green-800 text-center">
                    <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h4 className="font-semibold text-green-300 mb-1 text-sm">Empacado</h4>
                    <p className="text-xs text-gray-300">Productos empacados con cuidado</p>
                  </div>
                  <div className="bg-green-900/20 p-3 rounded-lg border border-green-800 text-center">
                    <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <h4 className="font-semibold text-green-300 mb-1 text-sm">Envío</h4>
                    <p className="text-xs text-gray-300">Enviado con seguimiento</p>
                  </div>
                  <div className="bg-green-900/20 p-3 rounded-lg border border-green-800 text-center">
                    <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <h4 className="font-semibold text-green-300 mb-1 text-sm">Entrega</h4>
                    <p className="text-xs text-gray-300">Entregado en tu puerta</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-green-300 mb-3">4.1 Seguimiento en Tiempo Real</h3>
                <p className="mb-4 text-gray-300">
                  Una vez que tu pedido esté en camino, recibirás:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>Número de seguimiento:</strong> Para rastrear tu envío en tiempo real</li>
                  <li><strong>Notificaciones SMS/Email:</strong> Actualizaciones sobre el estado de tu pedido</li>
                  <li><strong>Estimación de entrega:</strong> Hora aproximada de llegada</li>
                  <li><strong>Contacto del repartidor:</strong> Para coordinar la entrega</li>
                </ul>
              </div>
            </section>

            {/* Section 5 - Garantías y Seguridad */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">5</div>
                <h2 className="text-2xl font-bold text-green-400 flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  Garantías y Seguridad
                </h2>
              </div>
              <div className="pl-12">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-800">
                    <h4 className="font-semibold text-green-300 mb-2">Garantía de Producto</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Productos en perfectas condiciones</li>
                      <li>• Temperatura controlada durante el transporte</li>
                      <li>• Empaque especial para cervezas</li>
                      <li>• Protección contra golpes y vibraciones</li>
                    </ul>
                  </div>
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-800">
                    <h4 className="font-semibold text-green-300 mb-2">Seguridad del Envío</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Repartidores verificados y capacitados</li>
                      <li>• Vehículos equipados y mantenidos</li>
                      <li>• Seguro de transporte incluido</li>
                      <li>• Protocolos de seguridad establecidos</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-800">
                  <p className="text-blue-300 font-medium">
                    <strong>Compromiso de Calidad:</strong> Si tu producto llega en malas condiciones, 
                    te lo reemplazamos inmediatamente sin costo adicional.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 - Restricciones y Consideraciones */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">6</div>
                <h2 className="text-2xl font-bold text-green-400 flex items-center">
                  <Package className="w-6 h-6 mr-2" />
                  Restricciones y Consideraciones
                </h2>
              </div>
              <div className="pl-12">
                <h3 className="text-xl font-semibold text-green-300 mb-3">6.1 Restricciones de Envío</h3>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>Edad mínima:</strong> Solo enviamos a personas mayores de 18 años</li>
                  <li><strong>Identificación:</strong> Presentar DNI al momento de la entrega</li>
                  <li><strong>Horarios:</strong> Entregas de 9:00 AM a 8:00 PM</li>
                  <li><strong>Zonas restringidas:</strong> Algunas áreas pueden tener restricciones especiales</li>
                </ul>

                <h3 className="text-xl font-semibold text-green-300 mb-3">6.2 Consideraciones Especiales</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800">
                    <h4 className="font-semibold text-yellow-300 mb-2">Condiciones Climáticas</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Lluvias intensas pueden retrasar envíos</li>
                      <li>• En temporada de lluvias, horarios pueden variar</li>
                      <li>• Comunicación previa en caso de retrasos</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800">
                    <h4 className="font-semibold text-yellow-300 mb-2">Eventos Especiales</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Ferias y festividades pueden afectar tiempos</li>
                      <li>• Alta demanda en fechas especiales</li>
                      <li>• Planificación anticipada recomendada</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 p-6 rounded-xl border border-amber-700 text-center">
              <h3 className="text-xl font-bold text-amber-300 mb-3">
                ¿Tienes Preguntas sobre Envíos?
              </h3>
              <p className="text-gray-300 mb-4">
                Nuestro equipo de logística está disponible para resolver tus dudas y coordinar envíos especiales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center justify-center space-x-2 text-amber-300">
                  <Phone className="w-4 h-4" />
                  <span>+51 966 123 456</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-300">
                  <Mail className="w-4 h-4" />
                  <span>envios@posoqo.com</span>
                </div>
              </div>
            </div>

            {/* Final Note */}
            <div className="bg-gray-700/50 p-6 rounded-xl border-2 border-amber-500/50 text-center">
              <p className="text-lg font-bold text-amber-400 mb-2">
                Llevamos la Tradición Ayacuchana a tu Puerta
              </p>
              <p className="text-gray-300">
                En POSOQO, cada envío es una oportunidad para compartir la autenticidad de nuestras cervezas artesanales. 
                Nos esforzamos por brindarte un servicio de entrega excepcional que complemente la calidad de nuestros productos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}