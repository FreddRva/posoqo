'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  RefreshCw,
  ChevronRight,
  Shield,
  CheckCircle,
  Clock,
  Package,
  DollarSign,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  FileText,
  Box,
  Truck,
  CreditCard,
  XCircle,
  ArrowRight,
  User
} from 'lucide-react'

export default function DevolucionesPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })

  const sections = [
    { id: 'introduccion', title: '1. Introducción', icon: Shield },
    { id: 'garantia', title: '2. Garantía de Satisfacción', icon: CheckCircle },
    { id: 'elegibilidad', title: '3. Productos Elegibles', icon: Package },
    { id: 'plazos', title: '4. Plazos y Tiempos', icon: Clock },
    { id: 'proceso', title: '5. Proceso de Devolución', icon: RefreshCw },
    { id: 'reembolsos', title: '6. Reembolsos', icon: DollarSign },
    { id: 'condiciones', title: '7. Condiciones de Devolución', icon: FileText },
    { id: 'restricciones', title: '8. Restricciones', icon: XCircle },
    { id: 'costos', title: '9. Costos de Devolución', icon: DollarSign },
    { id: 'reemplazos', title: '10. Reemplazos', icon: Box },
    { id: 'contacto', title: '11. Contacto y Soporte', icon: Phone }
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
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-black to-emerald-900/30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-green-400/10 to-emerald-400/10 border border-green-400/30 rounded-full">
              <RefreshCw className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold tracking-wider uppercase text-sm">
                Política de Devoluciones
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-2xl">
                Política de Devoluciones
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Garantía de Satisfacción 100%</span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl leading-relaxed"
            >
              En POSOQO, tu satisfacción es nuestra prioridad absoluta. Esta política establece los términos y condiciones 
              para devoluciones y reembolsos, garantizando un proceso transparente y sin complicaciones.
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
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-green-400/20">
                <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
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
                            ? 'bg-green-400/20 text-green-400 border-l-2 border-green-400'
                            : 'text-gray-400 hover:text-green-400 hover:bg-white/5'
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
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-green-400/20 space-y-12">
                
                {/* Introducción */}
                <div id="introduccion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <Shield className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">1. Introducción</h2>
                      <div className="bg-gradient-to-r from-green-400/10 to-emerald-400/10 border border-green-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed text-lg">
                          Esta Política de Devoluciones establece los términos y condiciones bajo los cuales POSOQO Cervecería Artesanal 
                          acepta devoluciones y procesa reembolsos. Al realizar una compra, usted acepta esta política en su totalidad.
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Nos comprometemos a ofrecer un proceso de devolución justo, transparente y sin complicaciones. 
                        Su satisfacción es fundamental para nosotros.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <section id="garantia" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">2. Garantía de Satisfacción</h2>
                      <div className="bg-gradient-to-r from-green-400/20 to-emerald-400/20 border-2 border-green-400/50 rounded-2xl p-8 text-center mb-6">
                        <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-3xl font-bold text-green-400 mb-4">
                          Garantía de Satisfacción del 100%
                        </h3>
                        <p className="text-xl text-gray-300 mb-6">
                          Si no estás completamente satisfecho, te devolvemos tu dinero
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <h4 className="font-bold text-green-300 mb-2">Sin Preguntas</h4>
                            <p className="text-gray-300 text-sm">Proceso simple y directo</p>
                          </div>
                          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                            <Clock className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <h4 className="font-bold text-green-300 mb-2">30 Días</h4>
                            <p className="text-gray-300 text-sm">Plazo amplio para decidir</p>
                          </div>
                          <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                            <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <h4 className="font-bold text-green-300 mb-2">Reembolso Total</h4>
                            <p className="text-gray-300 text-sm">100% de tu dinero de vuelta</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3 */}
                <section id="elegibilidad" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <Package className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">3. Productos Elegibles para Devolución</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Aceptamos devoluciones de los siguientes productos bajo las condiciones especificadas:
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Productos Elegibles
                          </h3>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Cervezas artesanales sin abrir y en buen estado</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Productos de gastronomía no consumidos y sellados</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Merchandising, accesorios y productos promocionales</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Productos con defectos de fabricación o calidad</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Productos que no cumplen con las expectativas anunciadas</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>Pedidos incorrectos o productos diferentes al solicitado</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-red-300 mb-4 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            No Elegibles
                          </h3>
                          <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Productos consumidos, abiertos o parcialmente usados</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Daños causados por mal uso o negligencia del cliente</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Productos personalizados o hechos a medida</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Productos en ofertas especiales o liquidación (según términos)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Productos devueltos después del plazo establecido</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <span>Productos sin empaque original o sin etiquetas</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section id="plazos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <Clock className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">4. Plazos y Tiempos</h2>
                      
                      <h3 className="text-xl font-semibold text-green-300 mb-3">4.1 Plazo para Solicitar Devolución</h3>
                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed text-lg mb-4">
                          Tiene <strong className="text-green-400">30 días calendario</strong> desde la fecha de entrega para solicitar una devolución.
                        </p>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>El plazo se cuenta desde la fecha de entrega confirmada</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Para productos defectuosos: Sin límite de tiempo mientras el defecto sea evidente</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Para pedidos incorrectos: Hasta 14 días después de la entrega</span>
                          </li>
                        </ul>
                      </div>

                      <h3 className="text-xl font-semibold text-green-300 mb-3">4.2 Tiempos de Procesamiento</h3>
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 text-center">
                          <Clock className="w-12 h-12 text-green-400 mx-auto mb-4" />
                          <h4 className="font-semibold text-green-300 mb-2">Devolución Inmediata</h4>
                          <p className="text-3xl font-bold text-green-400 mb-2">24-48 horas</p>
                          <p className="text-xs text-gray-300">Para productos defectuosos o en mal estado</p>
                        </div>
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 text-center">
                          <RefreshCw className="w-12 h-12 text-green-400 mx-auto mb-4" />
                          <h4 className="font-semibold text-green-300 mb-2">Devolución Estándar</h4>
                          <p className="text-3xl font-bold text-green-400 mb-2">3-5 días</p>
                          <p className="text-xs text-gray-300">Para productos en buen estado</p>
                        </div>
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 text-center">
                          <CreditCard className="w-12 h-12 text-green-400 mx-auto mb-4" />
                          <h4 className="font-semibold text-green-300 mb-2">Reembolso</h4>
                          <p className="text-3xl font-bold text-green-400 mb-2">5-10 días</p>
                          <p className="text-xs text-gray-300">Procesamiento bancario</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section id="proceso" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <RefreshCw className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">5. Proceso de Devolución</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        El proceso de devolución es simple y directo. Siga estos pasos:
                      </p>

                      <div className="space-y-6 mb-6">
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <span className="text-black font-bold text-lg">1</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-green-300 mb-3">Solicitar la Devolución</h3>
                              <p className="text-gray-300 leading-relaxed mb-4">
                                Contacte a nuestro servicio al cliente para iniciar el proceso:
                              </p>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-green-400/10 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Phone className="w-4 h-4 text-green-400" />
                                    <span className="font-semibold text-green-300">Por Teléfono</span>
                                  </div>
                                  <p className="text-sm text-gray-300">+51 966 123 456</p>
                                  <p className="text-xs text-gray-400 mt-1">Lun-Dom 9:00 AM - 8:00 PM</p>
                                </div>
                                <div className="bg-green-400/10 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-green-400" />
                                    <span className="font-semibold text-green-300">Por Email</span>
                                  </div>
                                  <p className="text-sm text-gray-300">devoluciones@posoqo.com</p>
                                  <p className="text-xs text-gray-400 mt-1">Respuesta en 2-4 horas</p>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mt-4">
                                <strong className="text-green-400">Información requerida:</strong> Número de pedido, motivo de devolución, 
                                fotos del producto (si aplica).
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <span className="text-black font-bold text-lg">2</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-green-300 mb-3">Recogida del Producto</h3>
                              <p className="text-gray-300 leading-relaxed mb-4">
                                Una vez aprobada la devolución, coordinamos la recogida:
                              </p>
                              <ul className="space-y-2 pl-6 mb-4">
                                <li className="text-gray-300"><strong className="text-green-400">Recogida gratuita:</strong> En su domicilio o punto de venta más cercano</li>
                                <li className="text-gray-300"><strong className="text-green-400">Horarios flexibles:</strong> De 9:00 AM a 8:00 PM, de lunes a domingo</li>
                                <li className="text-gray-300"><strong className="text-green-400">Documentación:</strong> Solo necesita su DNI y comprobante de compra</li>
                                <li className="text-gray-300"><strong className="text-green-400">Empaque:</strong> Le proporcionamos el empaque necesario si lo requiere</li>
                              </ul>
                              <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4 mt-4">
                                <p className="text-gray-300 text-sm">
                                  <strong className="text-blue-400">Nota:</strong> Para productos defectuosos, la recogida es prioritaria 
                                  y se coordina dentro de las 24 horas.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <span className="text-black font-bold text-lg">3</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-green-300 mb-3">Verificación y Aprobación</h3>
                              <p className="text-gray-300 leading-relaxed mb-4">
                                Nuestro equipo verifica el estado del producto recibido:
                              </p>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-green-400/10 rounded-lg p-4">
                                  <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Verificación
                                  </h4>
                                  <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• Estado del producto</li>
                                    <li>• Empaque original</li>
                                    <li>• Accesorios incluidos</li>
                                    <li>• Condiciones de devolución</li>
                                  </ul>
                                </div>
                                <div className="bg-green-400/10 rounded-lg p-4">
                                  <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Aprobación
                                  </h4>
                                  <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• Aprobación inmediata (si aplica)</li>
                                    <li>• Inicio de procesamiento</li>
                                    <li>• Notificación por SMS/Email</li>
                                    <li>• Seguimiento del reembolso</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <span className="text-black font-bold text-lg">4</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-green-300 mb-3">Procesamiento del Reembolso</h3>
                              <p className="text-gray-300 leading-relaxed">
                                Una vez aprobada la devolución, procesamos el reembolso utilizando el mismo método de pago utilizado 
                                para la compra original. El reembolso se reflejará en su cuenta dentro de 5-10 días hábiles.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 6 */}
                <section id="reembolsos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">6. Reembolsos</h2>
                      
                      <h3 className="text-xl font-semibold text-green-300 mb-3">6.1 Métodos de Reembolso</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Los reembolsos se procesan utilizando el mismo método de pago utilizado para la compra original:
                      </p>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-green-400">Tarjetas de crédito/débito:</strong> El reembolso aparecerá en su estado de cuenta dentro de 5-10 días hábiles</li>
                        <li className="text-gray-300"><strong className="text-green-400">Transferencias bancarias:</strong> Procesamiento en 3-5 días hábiles</li>
                        <li className="text-gray-300"><strong className="text-green-400">Billeteras digitales:</strong> Reembolso inmediato o dentro de 24-48 horas</li>
                        <li className="text-gray-300"><strong className="text-green-400">Pago contra entrega:</strong> Reembolso mediante transferencia bancaria o crédito en cuenta</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-green-300 mb-3">6.2 Montos de Reembolso</h3>
                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 mb-6">
                        <ul className="space-y-3 text-gray-300">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-green-400">Reembolso completo:</strong> Precio de compra + costo de envío original (si aplica)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-green-400">Productos defectuosos:</strong> Reembolso completo + costo de envío de devolución</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-green-400">Pedidos incorrectos:</strong> Reembolso completo + envío gratuito del producto correcto</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-green-400">Devoluciones estándar:</strong> Precio de compra (el costo de envío original no es reembolsable)</span>
                          </li>
                        </ul>
                      </div>

                      <h3 className="text-xl font-semibold text-green-300 mb-3">6.3 Tiempos de Reembolso</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Los tiempos de procesamiento varían según el método de pago:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5">
                          <h4 className="font-semibold text-blue-300 mb-3">Procesamiento Interno</h4>
                          <p className="text-gray-300 text-sm mb-2">1-3 días hábiles</p>
                          <p className="text-xs text-gray-400">Verificación y aprobación de la devolución</p>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-5">
                          <h4 className="font-semibold text-blue-300 mb-3">Procesamiento Bancario</h4>
                          <p className="text-gray-300 text-sm mb-2">5-10 días hábiles</p>
                          <p className="text-xs text-gray-400">Tiempo del banco para reflejar el reembolso</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 7 */}
                <section id="condiciones" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <FileText className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">7. Condiciones de Devolución</h2>
                      
                      <h3 className="text-xl font-semibold text-green-300 mb-3">7.1 Estado del Producto</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Para que una devolución sea aceptada, el producto debe cumplir con las siguientes condiciones:
                      </p>
                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 mb-6">
                        <ul className="space-y-3 text-gray-300">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>Producto sin usar, sin consumir y en su estado original</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>Empaque original intacto o en buen estado</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>Todas las etiquetas, sellos y accesorios incluidos</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>Comprobante de compra original</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>Producto devuelto dentro del plazo establecido</span>
                          </li>
                        </ul>
                      </div>

                      <h3 className="text-xl font-semibold text-green-300 mb-3">7.2 Excepciones para Productos Defectuosos</h3>
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed mb-4">
                          Para productos defectuosos o en mal estado, las condiciones son más flexibles:
                        </p>
                        <ul className="space-y-2 pl-6">
                          <li className="text-gray-300">No es necesario que el producto esté sin abrir</li>
                          <li className="text-gray-300">El empaque puede estar dañado si el daño fue causado durante el transporte</li>
                          <li className="text-gray-300">Se aceptan devoluciones en cualquier momento, sin límite de tiempo</li>
                          <li className="text-gray-300">Incluimos el costo de envío de devolución en el reembolso</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 8 */}
                <section id="restricciones" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <XCircle className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">8. Restricciones</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        No se aceptan devoluciones en los siguientes casos:
                      </p>

                      <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 mb-6">
                        <ul className="space-y-3 text-gray-300">
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>Productos consumidos, abiertos o parcialmente usados (excepto defectuosos)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>Daños causados por mal uso, negligencia o abuso del cliente</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>Productos personalizados, grabados o modificados según especificaciones del cliente</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>Productos en ofertas especiales o liquidación marcados como "no reembolsables"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>Devoluciones solicitadas después del plazo de 30 días (excepto defectuosos)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>Productos sin empaque original o sin etiquetas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>Productos que han sido devueltos previamente</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-yellow-400">Nota:</strong> En casos excepcionales, podemos evaluar devoluciones 
                          fuera de estas restricciones. Contacte a nuestro servicio al cliente para discutir su caso específico.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 9 */}
                <section id="costos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">9. Costos de Devolución</h2>
                      
                      <h3 className="text-xl font-semibold text-green-300 mb-3">9.1 Recogida Gratuita</h3>
                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed mb-4">
                          Ofrecemos recogida gratuita en los siguientes casos:
                        </p>
                        <ul className="space-y-2 pl-6">
                          <li className="text-gray-300">Productos defectuosos o en mal estado</li>
                          <li className="text-gray-300">Pedidos incorrectos (producto diferente al solicitado)</li>
                          <li className="text-gray-300">Productos que no cumplen con las expectativas anunciadas</li>
                          <li className="text-gray-300">Devoluciones dentro de las primeras 7 días después de la entrega</li>
                        </ul>
                      </div>

                      <h3 className="text-xl font-semibold text-green-300 mb-3">9.2 Costos a Cargo del Cliente</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        El cliente es responsable de los costos de envío de devolución en los siguientes casos:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Devoluciones por cambio de opinión (después de 7 días)</li>
                        <li className="text-gray-300">Productos devueltos sin motivo justificado</li>
                        <li className="text-gray-300">Productos que no cumplen con las condiciones de devolución</li>
                      </ul>
                      <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-blue-400">Importante:</strong> Los costos de envío de devolución se deducirán 
                          del monto del reembolso solo en casos donde el cliente sea responsable del mismo.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 10 */}
                <section id="reemplazos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <Box className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">10. Reemplazos</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        En lugar de un reembolso, puede solicitar el reemplazo del producto:
                      </p>

                      <h3 className="text-xl font-semibold text-green-300 mb-3">10.1 Opción de Reemplazo</h3>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-green-400">Producto defectuoso:</strong> Reemplazo inmediato del mismo producto sin costo adicional</li>
                        <li className="text-gray-300"><strong className="text-green-400">Producto incorrecto:</strong> Envío del producto correcto + recogida del incorrecto</li>
                        <li className="text-gray-300"><strong className="text-green-400">Producto diferente:</strong> Intercambio por otro producto disponible (diferencia de precio ajustada)</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-green-300 mb-3">10.2 Proceso de Reemplazo</h3>
                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 mb-6">
                        <ol className="space-y-3 text-gray-300">
                          <li className="flex items-start gap-3">
                            <span className="bg-green-400 text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                            <span>Solicite el reemplazo al momento de la devolución</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-green-400 text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                            <span>Verificamos disponibilidad del producto de reemplazo</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-green-400 text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                            <span>Enviamos el producto de reemplazo con envío gratuito</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-green-400 text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
                            <span>Recogemos el producto original (si aplica)</span>
                          </li>
                        </ol>
                      </div>

                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-green-400">Ventaja:</strong> El proceso de reemplazo suele ser más rápido que el reembolso, 
                          especialmente si el producto está disponible en stock.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 11 */}
                <section id="contacto" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 flex-shrink-0">
                      <Phone className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-green-400 mb-4">11. Contacto y Soporte</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Para iniciar una devolución o resolver cualquier consulta, nuestro equipo está disponible:
                      </p>
                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 space-y-4 mb-6">
                        <div>
                          <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Email de Devoluciones
                          </p>
                          <a href="mailto:devoluciones@posoqo.com" className="text-gray-300 hover:text-green-400 transition-colors text-lg">
                            devoluciones@posoqo.com
                          </a>
                          <p className="text-sm text-gray-400 mt-1">Respuesta en 2-4 horas</p>
                        </div>
                        <div>
                          <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Teléfono
                          </p>
                          <a href="tel:+51966123456" className="text-gray-300 hover:text-green-400 transition-colors">
                            +51 966 123 456
                          </a>
                          <p className="text-sm text-gray-400 mt-1">Lunes a Domingo: 9:00 AM - 8:00 PM</p>
                        </div>
                        <div>
                          <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Soporte en Línea
                          </p>
                          <p className="text-gray-300">A través de nuestra plataforma web en la sección "Mis Pedidos"</p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        Nuestro equipo de atención al cliente está capacitado para ayudarle con todas sus consultas sobre devoluciones, 
                        reembolsos y reemplazos. Estamos aquí para asegurar que tenga la mejor experiencia posible.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Acceptance Box */}
                <div className="bg-gradient-to-r from-green-400/20 to-emerald-400/20 border-2 border-green-400/50 rounded-2xl p-8 text-center">
                  <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-400 mb-4">
                    Garantía de Satisfacción del 100%
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto mb-4">
                    En POSOQO creemos que la confianza de nuestros clientes es nuestro activo más valioso. 
                    Por eso ofrecemos la garantía más sólida del mercado: si no estás completamente satisfecho, 
                    te devolvemos tu dinero. Sin preguntas, sin complicaciones, sin excepciones.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Tu satisfacción es nuestra prioridad absoluta.
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
