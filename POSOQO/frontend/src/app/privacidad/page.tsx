"use client";
import { Shield, Lock, Eye, Database, Users, Globe, Bell, FileText, Mail, Phone } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-8 py-8 sm:py-10 border-b border-blue-400/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-white mr-3" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Política de Privacidad</h1>
            </div>
            <p className="text-lg text-blue-100 font-medium">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-blue-200 mt-3">
              Protegemos tu privacidad con los más altos estándares de seguridad
            </p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-10">
          <div className="prose prose-invert max-w-none">
            <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-800 mb-8">
              <p className="text-blue-100 text-lg leading-relaxed">
                En POSOQO, valoramos profundamente tu privacidad y nos comprometemos a proteger tus datos personales. 
                Esta política describe cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal 
                cuando utilizas nuestros servicios, sitios web y aplicaciones.
              </p>
            </div>

            {/* Section 1 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">1</div>
                <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                  <Eye className="w-6 h-6 mr-2" />
                  Información que Recopilamos
                </h2>
              </div>
              <div className="pl-12">
                <h3 className="text-xl font-semibold text-blue-300 mb-3">1.1 Información Personal Directa</h3>
                <p className="mb-4 text-gray-300">
                  Recopilamos información que nos proporcionas directamente:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>Datos de identificación:</strong> Nombre completo, DNI, fecha de nacimiento</li>
                  <li><strong>Información de contacto:</strong> Email, teléfono, dirección postal</li>
                  <li><strong>Datos de cuenta:</strong> Usuario, contraseña, preferencias</li>
                  <li><strong>Información comercial:</strong> Historial de compras, preferencias de productos</li>
                </ul>

                <h3 className="text-xl font-semibold text-blue-300 mb-3">1.2 Información Recopilada Automáticamente</h3>
                <p className="mb-4 text-gray-300">
                  Utilizamos tecnologías para recopilar información automáticamente:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>Datos de navegación:</strong> IP, tipo de navegador, páginas visitadas</li>
                  <li><strong>Cookies y tecnologías similares:</strong> Para mejorar tu experiencia</li>
                  <li><strong>Datos de dispositivo:</strong> Tipo de dispositivo, sistema operativo</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">2</div>
                <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                  <Database className="w-6 h-6 mr-2" />
                  Cómo Utilizamos tu Información
                </h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  Utilizamos tu información personal para los siguientes propósitos:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800">
                    <h4 className="font-semibold text-blue-300 mb-2">Servicios y Productos</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Procesar pedidos y pagos</li>
                      <li>• Gestionar envíos y entregas</li>
                      <li>• Proporcionar soporte al cliente</li>
                      <li>• Personalizar tu experiencia</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800">
                    <h4 className="font-semibold text-blue-300 mb-2">Comunicaciones</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Enviar confirmaciones de pedido</li>
                      <li>• Notificar sobre envíos</li>
                      <li>• Informar sobre promociones</li>
                      <li>• Responder consultas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">3</div>
                <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Compartir Información
                </h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  <strong>NO vendemos, alquilamos ni compartimos tu información personal</strong> con terceros, excepto en las siguientes circunstancias:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>Con tu consentimiento explícito</strong> para servicios específicos</li>
                  <li><strong>Proveedores de servicios:</strong> Solo la información necesaria para cumplir con nuestros servicios</li>
                  <li><strong>Cumplimiento legal:</strong> Cuando la ley lo requiera o para proteger nuestros derechos</li>
                  <li><strong>Seguridad:</strong> Para prevenir fraudes y proteger la integridad de nuestros servicios</li>
                </ul>
                <div className="bg-green-900/20 p-5 rounded-lg border border-green-800">
                  <p className="text-green-300 font-medium">
                    <strong>Compromiso de Confidencialidad:</strong> Todos nuestros proveedores están obligados a mantener la confidencialidad de tu información.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">4</div>
                <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                  <Lock className="w-6 h-6 mr-2" />
                  Seguridad y Protección
                </h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800">
                    <h4 className="font-semibold text-blue-300 mb-2">Seguridad Técnica</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Encriptación SSL/TLS de 256 bits</li>
                      <li>• Firewalls y sistemas de detección de intrusos</li>
                      <li>• Acceso restringido a bases de datos</li>
                      <li>• Monitoreo continuo de seguridad</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800">
                    <h4 className="font-semibold text-blue-300 mb-2">Protección Organizativa</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Políticas de confidencialidad internas</li>
                      <li>• Capacitación del personal en seguridad</li>
                      <li>• Acceso limitado a información sensible</li>
                      <li>• Auditorías regulares de seguridad</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">5</div>
                <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                  <Globe className="w-6 h-6 mr-2" />
                  Tus Derechos y Opciones
                </h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  Tienes derecho a controlar tu información personal:
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800">
                    <h4 className="font-semibold text-blue-300 mb-2">Derechos de Acceso</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Acceder a tu información personal</li>
                      <li>• Corregir datos inexactos</li>
                      <li>• Solicitar eliminación de datos</li>
                      <li>• Oponerte al procesamiento</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800">
                    <h4 className="font-semibold text-blue-300 mb-2">Preferencias de Comunicación</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Cancelar suscripciones</li>
                      <li>• Modificar preferencias de marketing</li>
                      <li>• Configurar notificaciones</li>
                      <li>• Gestionar cookies</li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-300">
                  Para ejercer estos derechos, contáctanos en: <span className="text-blue-400">privacidad@posoqo.com</span>
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">6</div>
                <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                  <Bell className="w-6 h-6 mr-2" />
                  Cookies y Tecnologías Similares
                </h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia:
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800 text-center">
                    <h4 className="font-semibold text-blue-300 mb-2 text-sm">Cookies Esenciales</h4>
                    <p className="text-xs text-gray-300">Funcionamiento básico del sitio</p>
                  </div>
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800 text-center">
                    <h4 className="font-semibold text-blue-300 mb-2 text-sm">Cookies de Rendimiento</h4>
                    <p className="text-xs text-gray-300">Análisis y mejoras del servicio</p>
                  </div>
                  <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800 text-center">
                    <h4 className="font-semibold text-blue-300 mb-2 text-sm">Cookies de Marketing</h4>
                    <p className="text-xs text-gray-300">Publicidad personalizada</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  Puedes gestionar tus preferencias de cookies en la configuración de tu navegador.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <div className="flex items-center mb-5">
                <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">7</div>
                <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                  <FileText className="w-6 h-6 mr-2" />
                  Cambios y Actualizaciones
                </h2>
              </div>
              <div className="pl-12">
                <p className="mb-4 text-gray-300">
                  Esta política puede actualizarse periódicamente para reflejar cambios en nuestras prácticas:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-gray-300 mb-6">
                  <li><strong>Notificación de cambios:</strong> Te informaremos sobre cambios significativos</li>
                  <li><strong>Fecha de actualización:</strong> La fecha en la parte superior se actualiza automáticamente</li>
                  <li><strong>Consentimiento:</strong> El uso continuado implica aceptación de la política actualizada</li>
                  <li><strong>Historial de cambios:</strong> Disponible en nuestra base de conocimientos</li>
                </ul>
              </div>
            </section>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-6 rounded-xl border border-blue-700 text-center">
              <h3 className="text-xl font-bold text-blue-300 mb-3">
                ¿Tienes Preguntas sobre Privacidad?
              </h3>
              <p className="text-gray-300 mb-4">
                Nuestro equipo de privacidad está disponible para responder tus consultas y resolver cualquier inquietud.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center justify-center space-x-2 text-blue-300">
                  <Mail className="w-4 h-4" />
                  <span>privacidad@posoqo.com</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-blue-300">
                  <Phone className="w-4 h-4" />
                  <span>+51 966 123 456</span>
                </div>
              </div>
            </div>

            {/* Acceptance Box */}
            <div className="bg-gray-700/50 p-6 rounded-xl border-2 border-blue-500/50 text-center">
              <p className="text-lg font-bold text-blue-400 mb-2">
                Tu Privacidad es Nuestra Prioridad
              </p>
              <p className="text-gray-300">
                Al utilizar nuestros servicios, confías en que protegeremos tu información personal con los más altos estándares de seguridad. 
                Nos comprometemos a ser transparentes sobre nuestras prácticas de privacidad y a respetar tus derechos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}