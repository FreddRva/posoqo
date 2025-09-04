"use client";
import { Scale, FileText, Shield, Gavel, BookOpen, Users, Eye, Lock, Phone, Mail } from "lucide-react";

export default function InformacionLegalPage() {
  return (
    <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-8 py-8 sm:py-10 border-b border-amber-400/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Scale className="w-12 h-12 text-white mr-3" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Información Legal</h1>
            </div>
            <div className="bg-amber-600/20 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
              <p className="text-2xl font-bold text-amber-100 mb-2">
                ⚖️ Transparencia y Cumplimiento Legal
              </p>
              <p className="text-amber-200 font-medium">
                Conoce nuestros compromisos legales y de transparencia
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-10">
          <div className="prose prose-invert max-w-none">
            {/* Compromiso Legal */}
            <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-8 rounded-2xl border-2 border-amber-500/50 text-center mb-10">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-16 h-16 text-amber-400 mr-4" />
                <div>
                  <h2 className="text-3xl font-bold text-amber-300 mb-2">
                    Compromiso con la Legalidad
                  </h2>
                  <p className="text-xl text-amber-200">
                    Operamos bajo los más altos estándares de cumplimiento legal
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Scale className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Cumplimiento</h3>
                  <p className="text-amber-200 text-sm">Todas las regulaciones vigentes</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Eye className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Transparencia</h3>
                  <p className="text-amber-200 text-sm">Información clara y accesible</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <Lock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Protección</h3>
                  <p className="text-amber-200 text-sm">Derechos de nuestros clientes</p>
                </div>
              </div>
            </div>

            {/* Section 1 - Marco Legal */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">1</div>
                <h2 className="text-2xl font-bold text-amber-400">Marco Legal Aplicable</h2>
              </div>
              <div className="pl-14">
                <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800 mb-6">
                  <h3 className="text-xl font-semibold text-amber-300 mb-3">Legislación Vigente</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    POSOQO opera bajo el cumplimiento de todas las leyes y regulaciones peruanas aplicables, 
                    incluyendo pero no limitándose a las siguientes normativas:
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h4 className="font-semibold text-amber-300 mb-3">📋 Leyes Generales</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Código de Protección y Defensa del Consumidor</li>
                      <li>• Ley de Protección de Datos Personales</li>
                      <li>• Código Civil y Comercial</li>
                      <li>• Ley General de Salud</li>
                      <li>• Reglamento de Establecimientos de Salud</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h4 className="font-semibold text-amber-300 mb-3">🍺 Regulaciones Específicas</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Reglamento de Bebidas Alcohólicas</li>
                      <li>• Normas de Etiquetado de Alimentos</li>
                      <li>• Reglamento de Seguridad Alimentaria</li>
                      <li>• Normas de Comercialización</li>
                      <li>• Reglamento de Publicidad</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 - Cumplimiento Normativo */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">2</div>
                <h2 className="text-2xl font-bold text-amber-400">Cumplimiento Normativo</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                    <div className="flex items-center mb-4">
                      <Shield className="w-8 h-8 text-amber-400 mr-3" />
                      <h3 className="text-xl font-semibold text-amber-300">Certificaciones</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">✅ ISO 9001:2015</h4>
                        <p className="text-sm text-gray-300">Sistema de Gestión de Calidad</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">✅ HACCP</h4>
                        <p className="text-sm text-gray-300">Análisis de Peligros y Puntos Críticos</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">✅ DIGESA</h4>
                        <p className="text-sm text-gray-300">Autorización Sanitaria</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                    <div className="flex items-center mb-4">
                      <Gavel className="w-8 h-8 text-amber-400 mr-3" />
                      <h3 className="text-xl font-semibold text-amber-300">Auditorías Regulares</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">🔍 Auditorías Internas</h4>
                        <p className="text-sm text-gray-300">Revisión mensual de procesos</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">🔍 Auditorías Externas</h4>
                        <p className="text-sm text-gray-300">Verificación anual por terceros</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">🔍 Inspecciones Oficiales</h4>
                        <p className="text-sm text-gray-300">Cumplimiento de autoridades</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 - Derechos del Consumidor */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">3</div>
                <h2 className="text-2xl font-bold text-amber-400">Derechos del Consumidor</h2>
              </div>
              <div className="pl-14">
                <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800 mb-6">
                  <h3 className="text-xl font-semibold text-amber-300 mb-3">Protección Integral</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    En POSOQO, reconocemos y respetamos plenamente todos los derechos del consumidor 
                    establecidos en la legislación peruana. Nos comprometemos a garantizar que cada 
                    interacción con nuestros clientes cumpla con estos derechos fundamentales.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h4 className="font-semibold text-amber-300 mb-3">🎯 Derechos Básicos</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Información clara y veraz</li>
                      <li>• Protección de intereses económicos</li>
                      <li>• Reparación de daños</li>
                      <li>• Educación del consumidor</li>
                      <li>• Participación en políticas públicas</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h4 className="font-semibold text-amber-300 mb-3">🛡️ Garantías Específicas</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Calidad de productos</li>
                      <li>• Seguridad en el consumo</li>
                      <li>• Cumplimiento de ofertas</li>
                      <li>• Respeto a términos acordados</li>
                      <li>• Atención de reclamos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 - Protección de Datos */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">4</div>
                <h2 className="text-2xl font-bold text-amber-400">Protección de Datos Personales</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">🔒 Principios de Protección</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Licitud en el tratamiento</li>
                      <li>• Finalidad específica</li>
                      <li>• Proporcionalidad</li>
                      <li>• Calidad de los datos</li>
                      <li>• Seguridad</li>
                      <li>• Derecho de información</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">📋 Derechos ARCO</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• <strong>Acceso:</strong> Conocer qué datos tenemos</li>
                      <li>• <strong>Rectificación:</strong> Corregir datos inexactos</li>
                      <li>• <strong>Cancelación:</strong> Eliminar datos</li>
                      <li>• <strong>Oposición:</strong> Oponerse al tratamiento</li>
                      <li>• <strong>Portabilidad:</strong> Transferir datos</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-6 rounded-xl border border-amber-700 text-center">
                  <h3 className="text-xl font-bold text-amber-300 mb-3">
                    🎯 Nuestro Compromiso con la Privacidad
                  </h3>
                  <p className="text-gray-300 mb-4">
                    En POSOQO, la protección de tus datos personales es una prioridad absoluta. 
                    Implementamos las más altas medidas de seguridad y cumplimos estrictamente con 
                    la Ley de Protección de Datos Personales del Perú.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 - Transparencia */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">5</div>
                <h2 className="text-2xl font-bold text-amber-400">Transparencia y Acceso a la Información</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">📊 Información Pública</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Políticas de la empresa</li>
                      <li>• Términos y condiciones</li>
                      <li>• Política de privacidad</li>
                      <li>• Información de contacto</li>
                      <li>• Horarios de atención</li>
                      <li>• Precios y tarifas</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">📞 Canales de Comunicación</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Línea telefónica 24/7</li>
                      <li>• Email de atención</li>
                      <li>• WhatsApp oficial</li>
                      <li>• Redes sociales</li>
                      <li>• Formularios web</li>
                      <li>• Atención presencial</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 - Cumplimiento Fiscal */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">6</div>
                <h2 className="text-2xl font-bold text-amber-400">Cumplimiento Fiscal y Tributario</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">💰 Obligaciones Fiscales</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Pago puntual de impuestos</li>
                      <li>• Emisión de comprobantes</li>
                      <li>• Declaraciones mensuales</li>
                      <li>• Retenciones aplicables</li>
                      <li>• Libros contables</li>
                      <li>• Auditorías fiscales</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">📋 Documentación</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• RUC vigente</li>
                      <li>• Licencias municipales</li>
                      <li>• Autorizaciones sanitarias</li>
                      <li>• Permisos de funcionamiento</li>
                      <li>• Certificados de calidad</li>
                      <li>• Seguros obligatorios</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 p-8 rounded-xl border border-amber-700 text-center">
              <h3 className="text-2xl font-bold text-amber-300 mb-4">
                ¿Tienes Consultas Legales?
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                Nuestro equipo legal está disponible para resolver cualquier consulta sobre 
                nuestros compromisos legales y de transparencia.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold">Documentos</span>
                  </div>
                  <p className="text-amber-200 font-medium">Políticas y Términos</p>
                  <p className="text-xs text-amber-300">Acceso completo</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Phone className="w-5 h-5" />
                    <span className="font-semibold">Línea Legal</span>
                  </div>
                  <p className="text-amber-200 font-medium">+51 966 123 456</p>
                  <p className="text-xs text-amber-300">Ext. 101</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Mail className="w-5 h-5" />
                    <span className="font-semibold">Email Legal</span>
                  </div>
                  <p className="text-amber-200 font-medium">legal@posoqo.com</p>
                  <p className="text-xs text-amber-300">Respuesta en 24h</p>
                </div>
              </div>
            </div>

            {/* Final Note */}
            <div className="bg-gray-700/50 p-6 rounded-xl border-2 border-amber-500/50 text-center">
              <p className="text-lg font-bold text-amber-400 mb-2">
                ⚖️ Compromiso Total con la Legalidad y Transparencia
              </p>
              <p className="text-gray-300">
                En POSOQO, operamos bajo los más altos estándares de cumplimiento legal y transparencia. 
                Cada decisión que tomamos está guiada por nuestro compromiso con la legalidad, la protección 
                de nuestros clientes y la transparencia en todas nuestras operaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






