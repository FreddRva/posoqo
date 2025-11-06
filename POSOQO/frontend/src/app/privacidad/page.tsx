'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Shield,
  ChevronRight,
  Eye,
  Database,
  Lock,
  Users,
  Globe,
  Bell,
  FileText,
  Mail,
  Calendar,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Key,
  Server,
  Fingerprint,
  Settings,
  Trash2,
  Download
} from 'lucide-react'

export default function PrivacidadPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })

  const sections = [
    { id: 'introduccion', title: '1. Introducción', icon: Shield },
    { id: 'recopilacion', title: '2. Información que Recopilamos', icon: Database },
    { id: 'uso', title: '3. Cómo Utilizamos tu Información', icon: Eye },
    { id: 'compartir', title: '4. Compartir Información con Terceros', icon: Users },
    { id: 'seguridad', title: '5. Seguridad y Protección', icon: Lock },
    { id: 'derechos', title: '6. Tus Derechos ARCO', icon: CheckCircle },
    { id: 'cookies', title: '7. Cookies y Tecnologías Similares', icon: Settings },
    { id: 'retencion', title: '8. Retención de Datos', icon: Server },
    { id: 'transferencias', title: '9. Transferencias Internacionales', icon: Globe },
    { id: 'menores', title: '10. Menores de Edad', icon: AlertTriangle },
    { id: 'modificaciones', title: '11. Modificaciones de la Política', icon: FileText },
    { id: 'contacto', title: '12. Contacto y Ejercicio de Derechos', icon: Mail }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200
      sections.forEach((section) => {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 120
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setActiveSection(id)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-16 px-6 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-cyan-900/30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 border border-blue-400/30 rounded-full">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm">
                Protección de Datos
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl">
                Política de Privacidad
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Ley N° 29733 - Protección de Datos Personales</span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl leading-relaxed"
            >
              En POSOQO valoramos profundamente tu privacidad y nos comprometemos a proteger tus datos personales. 
              Esta política describe cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/20">
                <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Índice de Contenido
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const SectionIcon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          activeSection === section.id
                            ? 'bg-blue-400/20 text-blue-400 border-l-2 border-blue-400'
                            : 'text-gray-400 hover:text-blue-400 hover:bg-white/5'
                        }`}
                      >
                        <SectionIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{section.title.replace(/^\d+\.\s/, '')}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                      </button>
                    )
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-blue-400/20 space-y-12">
                
                {/* Introducción */}
                <div id="introduccion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Shield className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">1. Introducción</h2>
                      <div className="bg-gradient-to-r from-blue-400/10 to-cyan-400/10 border border-blue-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed text-lg">
                          <strong className="text-blue-400">POSOQO Cervecería Artesanal</strong> ("nosotros", "nuestro" o "la Empresa") 
                          se compromete a proteger la privacidad y seguridad de la información personal de nuestros usuarios. 
                          Esta Política de Privacidad describe nuestras prácticas respecto a la recopilación, uso, almacenamiento, 
                          protección y divulgación de información personal cuando utiliza nuestros servicios.
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Esta política se rige por la <strong className="text-blue-400">Ley N° 29733 - Ley de Protección de Datos Personales</strong> 
                        y su Reglamento, Decreto Supremo N° 003-2013-JUS, así como por otras leyes aplicables de la República del Perú.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política. Si no está de acuerdo, 
                        le solicitamos que no utilice nuestros servicios.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <section id="recopilacion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Database className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">2. Información que Recopilamos</h2>
                      
                      <h3 className="text-xl font-semibold text-blue-300 mb-3">2.1 Información Personal Directa</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Recopilamos información que usted nos proporciona directamente cuando:
                      </p>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-blue-400">Crea una cuenta:</strong> Nombre completo, DNI, fecha de nacimiento, email, teléfono, dirección postal</li>
                        <li className="text-gray-300"><strong className="text-blue-400">Realiza una compra:</strong> Información de pago, dirección de facturación y envío, historial de compras</li>
                        <li className="text-gray-300"><strong className="text-blue-400">Contacta con nosotros:</strong> Información proporcionada en consultas, quejas o solicitudes de soporte</li>
                        <li className="text-gray-300"><strong className="text-blue-400">Participa en promociones:</strong> Información necesaria para participar en sorteos, concursos o programas de fidelización</li>
                        <li className="text-gray-300"><strong className="text-blue-400">Hace una reserva:</strong> Nombre, número de personas, fecha y hora, preferencias especiales</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">2.2 Información Recopilada Automáticamente</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Cuando utiliza nuestros servicios, recopilamos automáticamente cierta información:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4">
                          <h4 className="font-semibold text-blue-300 mb-2">Datos de Navegación</h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Dirección IP</li>
                            <li>• Tipo de navegador</li>
                            <li>• Páginas visitadas</li>
                            <li>• Tiempo de permanencia</li>
                            <li>• Referencias de origen</li>
                          </ul>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4">
                          <h4 className="font-semibold text-blue-300 mb-2">Datos de Dispositivo</h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Tipo de dispositivo</li>
                            <li>• Sistema operativo</li>
                            <li>• Identificadores únicos</li>
                            <li>• Configuraciones regionales</li>
                            <li>• Datos de geolocalización</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">2.3 Cookies y Tecnologías Similares</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Utilizamos cookies, web beacons, pixel tags y tecnologías similares para recopilar información sobre su uso de nuestra plataforma. 
                        Más detalles en la sección 7 de esta política.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 3 */}
                <section id="uso" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Eye className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">3. Cómo Utilizamos tu Información</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Utilizamos su información personal para los siguientes propósitos:
                      </p>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">3.1 Prestación de Servicios</h3>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Procesar y gestionar sus pedidos y pagos</li>
                        <li className="text-gray-300">Coordinar envíos y entregas</li>
                        <li className="text-gray-300">Proporcionar soporte al cliente y responder consultas</li>
                        <li className="text-gray-300">Gestionar reservas y eventos</li>
                        <li className="text-gray-300">Administrar cuentas de usuario y preferencias</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">3.2 Comunicaciones</h3>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Enviar confirmaciones de pedidos y actualizaciones de envío</li>
                        <li className="text-gray-300">Comunicar cambios en términos, políticas o servicios</li>
                        <li className="text-gray-300">Enviar información sobre productos, promociones y eventos (con su consentimiento)</li>
                        <li className="text-gray-300">Responder a sus consultas y solicitudes</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">3.3 Mejora de Servicios</h3>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Analizar el uso de la plataforma para mejorar la experiencia del usuario</li>
                        <li className="text-gray-300">Personalizar contenido y recomendaciones</li>
                        <li className="text-gray-300">Desarrollar nuevos productos y servicios</li>
                        <li className="text-gray-300">Realizar investigaciones y análisis de mercado</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">3.4 Cumplimiento Legal</h3>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Cumplir con obligaciones legales y regulatorias</li>
                        <li className="text-gray-300">Responder a solicitudes de autoridades competentes</li>
                        <li className="text-gray-300">Prevenir fraudes y actividades ilegales</li>
                        <li className="text-gray-300">Proteger nuestros derechos legales</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section id="compartir" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Users className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">4. Compartir Información con Terceros</h2>
                      
                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed text-lg font-semibold mb-2">
                          <strong className="text-green-400">Compromiso Fundamental:</strong>
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-green-400">NO vendemos, alquilamos ni compartimos su información personal con terceros</strong> 
                          para fines comerciales, excepto en las circunstancias específicas descritas a continuación.
                        </p>
                      </div>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">4.1 Con su Consentimiento</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Compartimos información cuando usted nos da su consentimiento explícito para hacerlo.
                      </p>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">4.2 Proveedores de Servicios</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Podemos compartir información con proveedores de servicios que nos ayudan a operar nuestro negocio, incluyendo:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Proveedores de servicios de pago y procesamiento de transacciones</li>
                        <li className="text-gray-300">Empresas de envío y logística</li>
                        <li className="text-gray-300">Servicios de hosting y almacenamiento en la nube</li>
                        <li className="text-gray-300">Proveedores de servicios de marketing y análisis</li>
                        <li className="text-gray-300">Servicios de atención al cliente</li>
                      </ul>
                      <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4 mb-6">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-blue-400">Todos estos proveedores están contractualmente obligados</strong> a mantener la confidencialidad 
                          de su información y solo pueden utilizarla para los fines específicos para los que fueron contratados.
                        </p>
                      </div>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">4.3 Cumplimiento Legal</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Podemos divulgar información cuando sea requerido por ley, orden judicial o proceso legal, o cuando creamos de buena fe 
                        que la divulgación es necesaria para:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Cumplir con una obligación legal</li>
                        <li className="text-gray-300">Proteger y defender nuestros derechos o propiedad</li>
                        <li className="text-gray-300">Prevenir o investigar posibles infracciones en relación con nuestros servicios</li>
                        <li className="text-gray-300">Proteger la seguridad personal de usuarios o del público</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">4.4 Transferencias Comerciales</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        En caso de fusión, adquisición, reorganización o venta de activos, su información personal puede ser transferida como parte 
                        de esa transacción. Notificaremos a los usuarios afectados antes de que su información sea transferida.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section id="seguridad" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Lock className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">5. Seguridad y Protección</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para proteger su información personal 
                        contra acceso no autorizado, alteración, divulgación o destrucción.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Key className="w-6 h-6 text-blue-400" />
                            <h4 className="font-semibold text-blue-300 text-lg">Seguridad Técnica</h4>
                          </div>
                          <ul className="text-sm text-gray-300 space-y-2">
                            <li>• Encriptación SSL/TLS de 256 bits para todas las transmisiones</li>
                            <li>• Sistemas de firewall y detección de intrusiones</li>
                            <li>• Acceso restringido a bases de datos con autenticación multifactor</li>
                            <li>• Monitoreo continuo de seguridad 24/7</li>
                            <li>• Actualizaciones regulares de software y parches de seguridad</li>
                            <li>• Copias de seguridad encriptadas regulares</li>
                          </ul>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Fingerprint className="w-6 h-6 text-blue-400" />
                            <h4 className="font-semibold text-blue-300 text-lg">Protección Organizativa</h4>
                          </div>
                          <ul className="text-sm text-gray-300 space-y-2">
                            <li>• Políticas estrictas de confidencialidad para empleados</li>
                            <li>• Capacitación regular en seguridad y privacidad</li>
                            <li>• Control de acceso basado en roles (principio de menor privilegio)</li>
                            <li>• Auditorías regulares de seguridad y cumplimiento</li>
                            <li>• Procedimientos de respuesta a incidentes de seguridad</li>
                            <li>• Evaluaciones periódicas de riesgos</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-yellow-400">Importante:</strong> Aunque implementamos medidas de seguridad robustas, ningún método 
                          de transmisión por Internet o almacenamiento electrónico es 100% seguro. No podemos garantizar la seguridad absoluta de su información, 
                          pero nos comprometemos a notificarlo en caso de una violación de seguridad que afecte sus datos personales.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 6 */}
                <section id="derechos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">6. Tus Derechos ARCO</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        De acuerdo con la Ley N° 29733, usted tiene los siguientes derechos sobre sus datos personales:
                      </p>

                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <Eye className="w-5 h-5 text-blue-400" />
                            <h4 className="font-semibold text-blue-300">Acceso (A)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Tiene derecho a conocer qué información personal tenemos sobre usted y cómo la estamos utilizando.
                          </p>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <Settings className="w-5 h-5 text-blue-400" />
                            <h4 className="font-semibold text-blue-300">Rectificación (R)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Puede solicitar la corrección de información inexacta, incompleta o desactualizada.
                          </p>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <Trash2 className="w-5 h-5 text-blue-400" />
                            <h4 className="font-semibold text-blue-300">Cancelación (C)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Puede solicitar la eliminación de su información personal cuando ya no sea necesaria para los fines originales.
                          </p>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="w-5 h-5 text-blue-400" />
                            <h4 className="font-semibold text-blue-300">Oposición (O)</h4>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Puede oponerse al tratamiento de sus datos para ciertos fines, como marketing directo.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-blue-300 mb-3">6.1 Cómo Ejercer tus Derechos</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Para ejercer cualquiera de estos derechos, puede contactarnos a través de:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Email: <a href="mailto:privacidad@posoqo.com" className="text-blue-400 hover:text-blue-300 underline">privacidad@posoqo.com</a></li>
                        <li className="text-gray-300">Formulario en línea disponible en nuestra plataforma</li>
                        <li className="text-gray-300">Escrito dirigido a nuestra dirección física</li>
                      </ul>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Responderemos a su solicitud dentro de los plazos establecidos por la ley (generalmente 20 días hábiles).
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 7 */}
                <section id="cookies" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Settings className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">7. Cookies y Tecnologías Similares</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso de la plataforma y personalizar contenido.
                      </p>

                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5 text-center">
                          <h4 className="font-semibold text-blue-300 mb-3">Cookies Esenciales</h4>
                          <p className="text-gray-300 text-sm mb-3">Necesarias para el funcionamiento básico del sitio</p>
                          <p className="text-xs text-gray-400">No se pueden desactivar</p>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5 text-center">
                          <h4 className="font-semibold text-blue-300 mb-3">Cookies de Rendimiento</h4>
                          <p className="text-gray-300 text-sm mb-3">Recopilan información sobre cómo utiliza el sitio</p>
                          <p className="text-xs text-gray-400">Puede desactivarlas</p>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5 text-center">
                          <h4 className="font-semibold text-blue-300 mb-3">Cookies de Marketing</h4>
                          <p className="text-gray-300 text-sm mb-3">Se utilizan para mostrar publicidad relevante</p>
                          <p className="text-xs text-gray-400">Puede desactivarlas</p>
                        </div>
                      </div>

                      <p className="text-gray-300 leading-relaxed">
                        Puede gestionar sus preferencias de cookies a través de la configuración de su navegador o mediante nuestro 
                        panel de preferencias de cookies (cuando esté disponible).
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 8 */}
                <section id="retencion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Server className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">8. Retención de Datos</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Conservamos su información personal durante el tiempo necesario para cumplir con los fines para los que fue recopilada, 
                        incluyendo cualquier requisito legal, contable o de informes.
                      </p>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-blue-400">Datos de cuenta:</strong> Mientras su cuenta esté activa y hasta 3 años después de su cierre</li>
                        <li className="text-gray-300"><strong className="text-blue-400">Información de transacciones:</strong> Según requerimientos legales y fiscales (generalmente 7 años)</li>
                        <li className="text-gray-300"><strong className="text-blue-400">Datos de marketing:</strong> Hasta que retire su consentimiento o solicite su eliminación</li>
                        <li className="text-gray-300"><strong className="text-blue-400">Comunicaciones:</strong> Durante el tiempo necesario para responder a su consulta</li>
                      </ul>
                      <p className="text-gray-300 leading-relaxed">
                        Cuando la información ya no sea necesaria, la eliminaremos de forma segura utilizando métodos que impidan su recuperación.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 9 */}
                <section id="transferencias" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Globe className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">9. Transferencias Internacionales</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Su información puede ser procesada y almacenada en servidores ubicados fuera del Perú. Cuando transferimos información 
                        internacionalmente, nos aseguramos de que se apliquen salvaguardas adecuadas para proteger su información.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        Si transferimos información personal fuera del Perú, nos comprometemos a cumplir con los estándares de protección 
                        de datos aplicables y a implementar medidas contractuales apropiadas para proteger su información.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 10 */}
                <section id="menores" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">10. Menores de Edad</h2>
                      <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed text-lg">
                          <strong className="text-red-400">Nuestros servicios NO están dirigidos a menores de 18 años.</strong> 
                          No recopilamos intencionalmente información personal de menores de edad.
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Si descubrimos que hemos recopilado información de un menor sin el consentimiento de sus padres o tutores, 
                        tomaremos medidas para eliminar esa información de nuestros sistemas.
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        Si es padre o tutor y cree que su hijo nos ha proporcionado información personal, contáctenos inmediatamente.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 11 */}
                <section id="modificaciones" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <FileText className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">11. Modificaciones de la Política</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas, 
                        servicios o requisitos legales. Las modificaciones entrarán en vigor cuando se publiquen en esta página.
                      </p>
                      <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4 mb-6">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-blue-400">Notificaremos cambios significativos:</strong> Le notificaremos por email o mediante 
                          un aviso prominente en nuestra plataforma cuando realicemos cambios materiales a esta política.
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        La fecha de "Última actualización" en la parte superior de esta página indica cuándo se realizó la última revisión. 
                        Le recomendamos revisar esta política periódicamente para mantenerse informado sobre cómo protegemos su información.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 12 */}
                <section id="contacto" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl p-3 flex-shrink-0">
                      <Mail className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">12. Contacto y Ejercicio de Derechos</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o el tratamiento de sus datos personales, 
                        puede contactarnos a través de:
                      </p>
                      <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-6 space-y-4 mb-6">
                        <div>
                          <p className="text-blue-400 font-semibold mb-2">Email de Privacidad:</p>
                          <a href="mailto:privacidad@posoqo.com" className="text-gray-300 hover:text-blue-400 transition-colors text-lg">
                            privacidad@posoqo.com
                          </a>
                        </div>
                        <div>
                          <p className="text-blue-400 font-semibold mb-2">Dirección Postal:</p>
                          <p className="text-gray-300">Portal Independencia Nº65, Plaza de Armas</p>
                          <p className="text-gray-300">Ayacucho, Perú</p>
                        </div>
                        <div>
                          <p className="text-blue-400 font-semibold mb-2">Teléfono:</p>
                          <a href="tel:+51966123456" className="text-gray-300 hover:text-blue-400 transition-colors">
                            +51 966 123 456
                          </a>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-blue-300 mb-3">12.1 Autoridad de Supervisión</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Si no está satisfecho con nuestra respuesta a su solicitud relacionada con sus datos personales, 
                        tiene derecho a presentar una queja ante la Autoridad Nacional de Protección de Datos Personales del Perú.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Acceptance Box */}
                <div className="bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border-2 border-blue-400/50 rounded-2xl p-8 text-center">
                  <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-blue-400 mb-4">
                    Tu Privacidad es Nuestra Prioridad
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto mb-4">
                    En POSOQO, nos comprometemos a proteger su información personal con los más altos estándares de seguridad y transparencia. 
                    Valoramos su confianza y trabajamos continuamente para mantenerla.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta Política de Privacidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
