'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  FileText,
  ChevronRight,
  CheckCircle,
  Scale,
  Shield,
  AlertTriangle,
  Users,
  CreditCard,
  Package,
  Truck,
  Lock,
  Gavel,
  Mail,
  Calendar,
  BookOpen
} from 'lucide-react'

export default function TerminosPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })

  const sections = [
    { id: 'definiciones', title: '1. Definiciones y Alcance', icon: BookOpen },
    { id: 'aceptacion', title: '2. Aceptación de los Términos', icon: CheckCircle },
    { id: 'uso', title: '3. Uso de la Plataforma', icon: Users },
    { id: 'compras', title: '4. Compras y Transacciones', icon: CreditCard },
    { id: 'precios', title: '5. Precios y Pagos', icon: CreditCard },
    { id: 'envios', title: '6. Envíos y Entregas', icon: Truck },
    { id: 'devoluciones', title: '7. Devoluciones y Reembolsos', icon: Package },
    { id: 'propiedad', title: '8. Propiedad Intelectual', icon: Shield },
    { id: 'privacidad', title: '9. Privacidad y Protección de Datos', icon: Lock },
    { id: 'responsabilidad', title: '10. Limitación de Responsabilidad', icon: AlertTriangle },
    { id: 'indemnizacion', title: '11. Indemnización', icon: Scale },
    { id: 'modificaciones', title: '12. Modificaciones de los Términos', icon: FileText },
    { id: 'terminacion', title: '13. Terminación', icon: Gavel },
    { id: 'ley', title: '14. Ley Aplicable y Jurisdicción', icon: Scale },
    { id: 'contacto', title: '15. Contacto y Consultas', icon: Mail }
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
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 via-black to-amber-900/30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full">
              <FileText className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Documento Legal
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Términos y Condiciones
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <span>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-yellow-400" />
                <span>Ley aplicable: República del Perú</span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl leading-relaxed"
            >
              Estos Términos y Condiciones regulan el uso del sitio web y servicios de POSOQO Cervecería Artesanal. 
              Al acceder o utilizar nuestra plataforma, usted acepta estar legalmente vinculado por estos términos.
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
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/20">
                <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
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
                            ? 'bg-yellow-400/20 text-yellow-400 border-l-2 border-yellow-400'
                            : 'text-gray-400 hover:text-yellow-400 hover:bg-white/5'
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
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-yellow-400/20 space-y-12">
                
                {/* Introducción */}
                <div className="prose prose-invert max-w-none">
                  <div className="bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-xl p-6 mb-8">
                    <p className="text-gray-300 leading-relaxed text-lg">
                      <strong className="text-yellow-400">IMPORTANTE:</strong> Lea cuidadosamente estos Términos y Condiciones antes de utilizar nuestros servicios. 
                      Si no está de acuerdo con alguna parte de estos términos, absténgase de usar nuestros servicios. 
                      El uso continuado de nuestra plataforma implica la aceptación plena de estos términos.
                    </p>
                  </div>
                </div>

                {/* Section 1 */}
                <section id="definiciones" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">1. Definiciones y Alcance</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Para efectos de estos Términos y Condiciones, se entenderá por:
                      </p>
                      <ul className="space-y-3 mb-6 pl-6">
                        <li className="text-gray-300"><strong className="text-yellow-400">"POSOQO"</strong> o <strong className="text-yellow-400">"Nosotros"</strong>: Se refiere a POSOQO Cervecería Artesanal, empresa constituida bajo las leyes de la República del Perú.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">"Plataforma"</strong>: Incluye el sitio web, aplicaciones móviles, servicios digitales y cualquier otro medio digital operado por POSOQO.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">"Usuario"</strong> o <strong className="text-yellow-400">"Usted"</strong>: Cualquier persona natural o jurídica que acceda o utilice nuestros servicios.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">"Contenido"</strong>: Textos, imágenes, logos, diseños, videos, audio y demás elementos disponibles en la plataforma.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">"Productos"</strong>: Cervezas artesanales, comidas, refrescos y demás bienes ofrecidos por POSOQO.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">"Servicios"</strong>: Todos los servicios ofrecidos a través de la plataforma, incluyendo ventas, entregas, reservas y asistencia.</li>
                      </ul>
                      <p className="text-gray-300 leading-relaxed">
                        Estos términos aplican a todas las transacciones, interacciones y relaciones comerciales establecidas a través de nuestra plataforma, 
                        independientemente del medio utilizado para acceder a ella.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 2 */}
                <section id="aceptacion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">2. Aceptación de los Términos</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Al acceder y utilizar la plataforma de POSOQO, usted acepta:
                      </p>
                      <ul className="space-y-3 mb-6 pl-6">
                        <li className="text-gray-300">Estar legalmente vinculado por estos Términos y Condiciones en su totalidad.</li>
                        <li className="text-gray-300">Cumplir con todas las leyes y regulaciones aplicables en Perú.</li>
                        <li className="text-gray-300">Aceptar nuestra Política de Privacidad y cualquier otra política publicada en la plataforma.</li>
                        <li className="text-gray-300">Ser mayor de 18 años para realizar compras de productos alcohólicos.</li>
                        <li className="text-gray-300">Proporcionar información veraz, precisa y actualizada.</li>
                      </ul>
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-yellow-400">Si no está de acuerdo con estos términos,</strong> debe abstenerse inmediatamente de utilizar nuestros servicios 
                          y cerrar cualquier cuenta que pueda haber creado.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3 */}
                <section id="uso" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Users className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">3. Uso de la Plataforma</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">3.1 Uso Permitido</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        La plataforma está diseñada para uso personal y comercial legítimo. Usted puede:
                      </p>
                      <ul className="space-y-2 mb-6 pl-6">
                        <li className="text-gray-300">Navegar y explorar nuestros productos y servicios.</li>
                        <li className="text-gray-300">Realizar compras de productos disponibles.</li>
                        <li className="text-gray-300">Crear una cuenta personal para gestionar sus pedidos.</li>
                        <li className="text-gray-300">Contactar a nuestro servicio de atención al cliente.</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">3.2 Prohibiciones</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Está estrictamente prohibido:
                      </p>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                        <ul className="space-y-2 pl-6">
                          <li className="text-gray-300">Utilizar la plataforma para fines ilegales, fraudulentos o no autorizados.</li>
                          <li className="text-gray-300">Intentar acceder a áreas restringidas o sistemas de seguridad.</li>
                          <li className="text-gray-300">Modificar, copiar, distribuir o crear trabajos derivados del contenido sin autorización.</li>
                          <li className="text-gray-300">Transmitir virus, malware o código malicioso.</li>
                          <li className="text-gray-300">Realizar ingeniería inversa o descompilar cualquier parte del software.</li>
                          <li className="text-gray-300">Usar robots, scrapers o métodos automatizados sin permiso.</li>
                          <li className="text-gray-300">Suplantar identidad o proporcionar información falsa.</li>
                          <li className="text-gray-300">Interferir o interrumpir el funcionamiento de la plataforma.</li>
                        </ul>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">3.3 Cuentas de Usuario</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Si crea una cuenta, usted es responsable de:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Mantener la confidencialidad de sus credenciales de acceso.</li>
                        <li className="text-gray-300">Todas las actividades que ocurran bajo su cuenta.</li>
                        <li className="text-gray-300">Notificarnos inmediatamente sobre cualquier uso no autorizado.</li>
                        <li className="text-gray-300">Proporcionar información precisa y actualizada.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section id="compras" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">4. Compras y Transacciones</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">4.1 Proceso de Compra</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        El proceso de compra incluye los siguientes pasos:
                      </p>
                      <ol className="space-y-3 mb-6 pl-6 list-decimal">
                        <li className="text-gray-300"><strong className="text-yellow-400">Selección:</strong> Agregar productos al carrito de compras.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Revisión:</strong> Verificar productos, cantidades y precios.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Información:</strong> Proporcionar datos de envío y facturación.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Pago:</strong> Seleccionar método de pago y completar la transacción.</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Confirmación:</strong> Recibir confirmación de la orden por correo electrónico.</li>
                      </ol>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">4.2 Disponibilidad</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Todos los productos están sujetos a disponibilidad. POSOQO se reserva el derecho de:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Limitar la cantidad de productos por pedido.</li>
                        <li className="text-gray-300">Rechazar o cancelar órdenes por causas justificadas.</li>
                        <li className="text-gray-300">Modificar o descontinuar productos sin previo aviso.</li>
                        <li className="text-gray-300">Corregir errores en precios o descripciones.</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">4.3 Confirmación de Pedido</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        La recepción de una confirmación de pedido por correo electrónico constituye nuestra aceptación de su orden. 
                        Sin embargo, nos reservamos el derecho de rechazar cualquier pedido antes del envío.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section id="precios" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">5. Precios y Pagos</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">5.1 Precios</h3>
                      <ul className="space-y-3 mb-6 pl-6">
                        <li className="text-gray-300">Todos los precios están expresados en <strong className="text-yellow-400">Soles Peruanos (S/)</strong> e incluyen IGV cuando corresponda.</li>
                        <li className="text-gray-300">Los precios pueden ser modificados sin previo aviso, pero no afectarán pedidos ya confirmados.</li>
                        <li className="text-gray-300">Nos reservamos el derecho de corregir errores en precios, incluso después de confirmar una orden.</li>
                        <li className="text-gray-300">Los precios no incluyen costos de envío, que se calculan durante el proceso de checkout.</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">5.2 Métodos de Pago</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Aceptamos los siguientes métodos de pago:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
                        <li className="text-gray-300">Transferencias bancarias</li>
                        <li className="text-gray-300">Billeteras digitales (cuando estén disponibles)</li>
                        <li className="text-gray-300">Pago contra entrega (solo en áreas específicas)</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">5.3 Seguridad de Pagos</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Todos los pagos se procesan mediante sistemas seguros y encriptados. No almacenamos información completa de tarjetas de crédito. 
                        Los datos de pago son procesados por procesadores de pago certificados y cumplen con los estándares PCI DSS.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 6 */}
                <section id="envios" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Truck className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">6. Envíos y Entregas</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Los términos de envío y entrega están detallados en nuestra <a href="/envios" className="text-yellow-400 hover:text-yellow-300 underline">Política de Envíos</a>. 
                        En resumen:
                      </p>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300">Los tiempos de entrega son estimados y pueden variar según la ubicación.</li>
                        <li className="text-gray-300">El usuario debe proporcionar una dirección de entrega precisa y completa.</li>
                        <li className="text-gray-300">POSOQO no se responsabiliza por retrasos causados por terceros (empresas de envío).</li>
                        <li className="text-gray-300">El riesgo de pérdida o daño se transfiere al usuario al momento de la entrega.</li>
                        <li className="text-gray-300">Se requiere identificación y firma para la entrega de productos alcohólicos.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 7 */}
                <section id="devoluciones" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Package className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">7. Devoluciones y Reembolsos</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Consulte nuestra <a href="/devoluciones" className="text-yellow-400 hover:text-yellow-300 underline">Política de Devoluciones</a> para información detallada. 
                        Principios generales:
                      </p>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300">Tiene derecho a devolver productos no conformes dentro del plazo establecido.</li>
                        <li className="text-gray-300">Los productos deben estar en su estado original, sin usar y con embalaje intacto.</li>
                        <li className="text-gray-300">Los reembolsos se procesarán utilizando el mismo método de pago utilizado para la compra.</li>
                        <li className="text-gray-300">Los costos de envío de devoluciones corren por cuenta del usuario, excepto en casos de productos defectuosos.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 8 */}
                <section id="propiedad" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Shield className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">8. Propiedad Intelectual</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Todo el contenido de la plataforma, incluyendo pero no limitado a:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Logotipos, marcas comerciales y nombres comerciales</li>
                        <li className="text-gray-300">Diseños gráficos, interfaces y elementos visuales</li>
                        <li className="text-gray-300">Contenido textual, imágenes, videos y audio</li>
                        <li className="text-gray-300">Código fuente, software y bases de datos</li>
                        <li className="text-gray-300">Recetas, fórmulas y procesos únicos</li>
                      </ul>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        están protegidos por las leyes de propiedad intelectual de Perú y convenios internacionales, y son de exclusiva propiedad de POSOQO 
                        o de sus licenciantes.
                      </p>
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-yellow-400">Queda estrictamente prohibido</strong> copiar, reproducir, distribuir, modificar o crear trabajos 
                          derivados de cualquier contenido sin autorización escrita previa de POSOQO.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 9 */}
                <section id="privacidad" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Lock className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">9. Privacidad y Protección de Datos</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        El tratamiento de sus datos personales se rige por nuestra <a href="/privacidad" className="text-yellow-400 hover:text-yellow-300 underline">Política de Privacidad</a>, 
                        la cual forma parte integral de estos Términos y Condiciones. Al utilizar nuestros servicios, usted consiente el tratamiento de sus datos 
                        personales de acuerdo con dicha política y la Ley N° 29733 - Ley de Protección de Datos Personales del Perú.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 10 */}
                <section id="responsabilidad" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">10. Limitación de Responsabilidad</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">10.1 Exclusiones</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        En la máxima medida permitida por la ley, POSOQO no será responsable por:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Daños indirectos, incidentales, especiales, consecuentes o punitivos</li>
                        <li className="text-gray-300">Pérdida de beneficios, ingresos, datos o oportunidades de negocio</li>
                        <li className="text-gray-300">Interrupciones del servicio por causas ajenas a nuestro control (fuerza mayor, fallas técnicas, etc.)</li>
                        <li className="text-gray-300">Errores, omisiones o inexactitudes en el contenido</li>
                        <li className="text-gray-300">Uso indebido de la plataforma por terceros</li>
                        <li className="text-gray-300">Contenido publicado por usuarios en secciones de comentarios o reseñas</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">10.2 Límite Máximo</h3>
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-6">
                        <p className="text-gray-300 leading-relaxed">
                          En ningún caso la responsabilidad total acumulada de POSOQO, sus directores, empleados o agentes excederá el monto total 
                          pagado por el usuario a POSOQO en la transacción específica que generó el reclamo, o S/ 100.00, lo que sea menor.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 11 */}
                <section id="indemnizacion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Scale className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">11. Indemnización</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Usted acepta indemnizar, defender y eximir de responsabilidad a POSOQO, sus afiliados, directores, empleados y agentes de cualquier 
                        reclamación, demanda, pérdida, responsabilidad y gasto (incluyendo honorarios legales razonables) que surjan de o estén relacionados con:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Su uso o mal uso de la plataforma</li>
                        <li className="text-gray-300">Su violación de estos Términos y Condiciones</li>
                        <li className="text-gray-300">Su violación de cualquier derecho de terceros</li>
                        <li className="text-gray-300">Cualquier contenido que usted publique o transmita a través de la plataforma</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 12 */}
                <section id="modificaciones" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <FileText className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">12. Modificaciones de los Términos</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor 
                        inmediatamente después de su publicación en la plataforma. La fecha de última actualización se indicará en la parte superior de este documento.
                      </p>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Es su responsabilidad revisar periódicamente estos términos. El uso continuado de la plataforma después de la publicación de modificaciones 
                        constituye su aceptación de los términos modificados.
                      </p>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-blue-400">Si no está de acuerdo con las modificaciones,</strong> debe cesar inmediatamente el uso de nuestros servicios 
                          y puede solicitar la cancelación de su cuenta.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 13 */}
                <section id="terminacion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Gavel className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">13. Terminación</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">13.1 Terminación por el Usuario</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Puede terminar su relación con POSOQO en cualquier momento dejando de usar la plataforma y cancelando su cuenta si tiene una.
                      </p>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">13.2 Terminación por POSOQO</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Nos reservamos el derecho de suspender o terminar su acceso a la plataforma, con o sin previo aviso, si:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Viola estos Términos y Condiciones o cualquier política aplicable</li>
                        <li className="text-gray-300">Realiza actividades fraudulentas o ilegales</li>
                        <li className="text-gray-300">Proporciona información falsa o engañosa</li>
                        <li className="text-gray-300">Hace uso indebido de la plataforma</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">13.3 Efectos de la Terminación</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Al terminar, perderá acceso a su cuenta y cualquier contenido asociado. Las disposiciones que por su naturaleza deben sobrevivir 
                        permanecerán en vigor después de la terminación.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 14 */}
                <section id="ley" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Scale className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">14. Ley Aplicable y Jurisdicción</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">14.1 Legislación Aplicable</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Estos Términos y Condiciones se rigen por las leyes de la República del Perú, sin dar efecto a ninguna disposición sobre conflictos de leyes.
                      </p>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">14.2 Jurisdicción</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Cualquier disputa, controversia o reclamo que surja de o esté relacionado con estos términos, o con el uso de la plataforma, 
                        será sometido a la jurisdicción exclusiva de los tribunales competentes de Ayacucho, Perú.
                      </p>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">14.3 Resolución de Disputas</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Antes de iniciar cualquier procedimiento legal, las partes se comprometen a intentar resolver cualquier disputa mediante negociación 
                        de buena fe. Si no se alcanza una resolución dentro de 30 días, las partes pueden proceder con recursos legales.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 15 */}
                <section id="contacto" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Mail className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">15. Contacto y Consultas</h2>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Para cualquier consulta, reclamo o notificación relacionada con estos Términos y Condiciones, puede contactarnos a través de:
                      </p>
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 space-y-4">
                        <div>
                          <p className="text-yellow-400 font-semibold mb-2">Email Legal:</p>
                          <a href="mailto:legal@posoqo.com" className="text-gray-300 hover:text-yellow-400 transition-colors">
                            legal@posoqo.com
                          </a>
                        </div>
                        <div>
                          <p className="text-yellow-400 font-semibold mb-2">Dirección:</p>
                          <p className="text-gray-300">Portal Independencia Nº65, Plaza de Armas</p>
                          <p className="text-gray-300">Ayacucho, Perú</p>
                        </div>
                        <div>
                          <p className="text-yellow-400 font-semibold mb-2">Teléfono:</p>
                          <a href="tel:+51966123456" className="text-gray-300 hover:text-yellow-400 transition-colors">
                            +51 966 123 456
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Acceptance Box */}
                <div className="bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-2 border-yellow-400/50 rounded-2xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                    Declaración de Aceptación
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto">
                    Al utilizar nuestros servicios, usted reconoce haber leído, entendido y aceptado integralmente estos Términos y Condiciones, 
                    así como nuestra Política de Privacidad y cualquier otra política aplicable, comprometiéndose a cumplirlos en su totalidad.
                  </p>
                  <p className="text-gray-400 mt-4 text-sm">
                    Si no está de acuerdo con estos términos, debe abstenerse de utilizar nuestros servicios.
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
