'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Truck,
  ChevronRight,
  MapPin,
  Clock,
  Package,
  DollarSign,
  Shield,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Navigation,
  Box,
  FileText,
  Users,
  Home,
  RefreshCw,
  TruckIcon
} from 'lucide-react'

export default function EnviosPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" })

  const sections = [
    { id: 'introduccion', title: '1. Introducción', icon: Truck },
    { id: 'cobertura', title: '2. Cobertura de Envíos', icon: MapPin },
    { id: 'tiempos', title: '3. Tiempos de Entrega', icon: Clock },
    { id: 'costos', title: '4. Costos y Tarifas', icon: DollarSign },
    { id: 'proceso', title: '5. Proceso de Envío', icon: Navigation },
    { id: 'seguimiento', title: '6. Seguimiento de Pedidos', icon: Package },
    { id: 'entrega', title: '7. Proceso de Entrega', icon: Home },
    { id: 'garantias', title: '8. Garantías y Seguridad', icon: Shield },
    { id: 'restricciones', title: '9. Restricciones y Limitaciones', icon: AlertTriangle },
    { id: 'reclamos', title: '10. Reclamos y Soluciones', icon: RefreshCw },
    { id: 'condiciones', title: '11. Condiciones Especiales', icon: FileText },
    { id: 'contacto', title: '12. Contacto y Soporte', icon: Phone }
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
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-black to-yellow-900/30" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-full">
              <Truck className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wider uppercase text-sm">
                Política de Envíos
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
                Política de Envíos
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <span>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-yellow-400" />
                <span>Cobertura: Ayacucho y Provincias</span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-300 max-w-4xl leading-relaxed"
            >
              En POSOQO nos comprometemos a llevar la auténtica cerveza ayacuchana a todos los rincones de la región. 
              Nuestra política de envíos garantiza que recibas tus productos en perfectas condiciones, con la máxima rapidez y seguridad.
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
                <div id="introduccion" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Truck className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">1. Introducción</h2>
                      <div className="bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed text-lg">
                          Esta Política de Envíos establece los términos y condiciones bajo los cuales POSOQO Cervecería Artesanal 
                          realiza las entregas de productos a nuestros clientes. Al realizar una compra, usted acepta esta política 
                          en su totalidad.
                        </p>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Nos comprometemos a ofrecer un servicio de envío confiable, seguro y eficiente, asegurando que nuestros 
                        productos lleguen en perfectas condiciones a su destino.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <section id="cobertura" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">2. Cobertura de Envíos</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">2.1 Área de Cobertura Principal</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Cubrimos toda la región de Ayacucho con envíos directos:
                      </p>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-yellow-300 mb-4 text-lg">Ciudad de Ayacucho</h4>
                          <ul className="text-gray-300 space-y-2">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Centro histórico y zonas comerciales
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Distritos periféricos
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Zonas residenciales
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Áreas metropolitanas
                            </li>
                          </ul>
                        </div>
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-yellow-300 mb-4 text-lg">Provincias de Ayacucho</h4>
                          <ul className="text-gray-300 space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Huamanga
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Cangallo
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Huanta
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              La Mar
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Lucanas
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Parinacochas
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Víctor Fajardo
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400" />
                              Sucre
                            </li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">2.2 Envíos Especiales</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Para ubicaciones fuera de nuestra cobertura estándar, ofrecemos servicios especiales:
                      </p>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-yellow-400">Envíos interprovinciales:</strong> Coordinamos con transportistas especializados para entregas fuera de Ayacucho</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Zonas rurales:</strong> Adaptamos nuestros servicios según la accesibilidad y distancia</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Eventos especiales:</strong> Envíos programados para celebraciones, ferias y eventos corporativos</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Pedidos corporativos:</strong> Servicios de entrega personalizados para empresas y organizaciones</li>
                      </ul>
                      <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-blue-400">Nota:</strong> Para envíos especiales, contacte directamente con nuestro equipo 
                          para coordinar detalles y obtener una cotización personalizada.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3 */}
                <section id="tiempos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Clock className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">3. Tiempos de Entrega</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Los tiempos de entrega varían según la ubicación y el método de envío seleccionado:
                      </p>

                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-black" />
                          </div>
                          <h4 className="font-semibold text-yellow-300 mb-2 text-lg">Envío Express</h4>
                          <p className="text-3xl font-bold text-yellow-400 mb-2">2-4 horas</p>
                          <p className="text-sm text-gray-300 mb-3">Ciudad de Ayacucho</p>
                          <p className="text-xs text-gray-400">Disponible de lunes a domingo</p>
                        </div>
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-8 h-8 text-black" />
                          </div>
                          <h4 className="font-semibold text-yellow-300 mb-2 text-lg">Envío Estándar</h4>
                          <p className="text-3xl font-bold text-yellow-400 mb-2">24-48 horas</p>
                          <p className="text-sm text-gray-300 mb-3">Provincias cercanas</p>
                          <p className="text-xs text-gray-400">Días hábiles</p>
                        </div>
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-black" />
                          </div>
                          <h4 className="font-semibold text-yellow-300 mb-2 text-lg">Envío Extendido</h4>
                          <p className="text-3xl font-bold text-yellow-400 mb-2">3-5 días</p>
                          <p className="text-sm text-gray-300 mb-3">Provincias remotas</p>
                          <p className="text-xs text-gray-400">Días hábiles</p>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">3.1 Factores que Afectan los Tiempos</h3>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Condiciones climáticas adversas (lluvias intensas, deslizamientos)</li>
                        <li className="text-gray-300">Eventos especiales o festividades que afecten el tráfico</li>
                        <li className="text-gray-300">Alta demanda en fechas especiales (Navidad, Año Nuevo, etc.)</li>
                        <li className="text-gray-300">Accesibilidad de la zona de entrega</li>
                        <li className="text-gray-300">Disponibilidad de producto en stock</li>
                      </ul>

                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-yellow-400">Importante:</strong> Los tiempos de entrega son estimados y pueden variar. 
                          Le mantendremos informado sobre el estado de su envío a través de notificaciones por email y SMS.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section id="costos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">4. Costos y Tarifas</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">4.1 Tarifas por Zona</h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-green-300 mb-4 text-lg">Ciudad de Ayacucho</h4>
                          <ul className="text-gray-300 space-y-3">
                            <li className="flex items-center justify-between">
                              <span>Envío Express (2-4 horas)</span>
                              <span className="font-bold text-yellow-400">S/ 8.00</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>Envío Estándar (24 horas)</span>
                              <span className="font-bold text-yellow-400">S/ 5.00</span>
                            </li>
                            <li className="flex items-center justify-between pt-3 border-t border-green-400/20">
                              <span className="font-semibold">Pedidos mayores a S/ 100</span>
                              <span className="font-bold text-green-400">¡GRATIS!</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-green-300 mb-4 text-lg">Provincias</h4>
                          <ul className="text-gray-300 space-y-3">
                            <li className="flex items-center justify-between">
                              <span>Provincias cercanas</span>
                              <span className="font-bold text-yellow-400">S/ 12.00</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>Provincias intermedias</span>
                              <span className="font-bold text-yellow-400">S/ 18.00</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>Provincias remotas</span>
                              <span className="font-bold text-yellow-400">S/ 25.00</span>
                            </li>
                            <li className="flex items-center justify-between pt-3 border-t border-green-400/20">
                              <span className="font-semibold">Pedidos mayores a S/ 200</span>
                              <span className="font-bold text-green-400">¡GRATIS!</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">4.2 Factores que Afectan el Costo</h3>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-yellow-400">Distancia:</strong> Mayor distancia implica mayor costo de transporte</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Peso y volumen:</strong> Productos más pesados o voluminosos pueden tener costos adicionales</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Urgencia:</strong> Envíos express tienen una tarifa premium</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Accesibilidad:</strong> Zonas de difícil acceso pueden requerir costos adicionales</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Embalaje especial:</strong> Productos que requieren embalaje especial pueden tener costos adicionales</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">4.3 Envíos Gratis</h3>
                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6 mb-6">
                        <p className="text-gray-300 leading-relaxed mb-4">
                          Ofrecemos envío gratuito en los siguientes casos:
                        </p>
                        <ul className="space-y-2 pl-6">
                          <li className="text-gray-300">Pedidos mayores a S/ 100 en Ciudad de Ayacucho</li>
                          <li className="text-gray-300">Pedidos mayores a S/ 200 en Provincias</li>
                          <li className="text-gray-300">Miembros del Club POSOQO (sin monto mínimo)</li>
                          <li className="text-gray-300">Promociones especiales que indiquen envío gratis</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-yellow-400">Nota:</strong> Los costos de envío se calculan automáticamente durante el proceso de checkout. 
                          Puede ver el costo total antes de confirmar su pedido.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section id="proceso" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Navigation className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">5. Proceso de Envío</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Una vez confirmado su pedido, el proceso de envío sigue estos pasos:
                      </p>

                      <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-black font-bold text-lg">1</span>
                          </div>
                          <h4 className="font-semibold text-yellow-300 mb-2">Confirmación</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">Pedido confirmado y en preparación</p>
                        </div>
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-black font-bold text-lg">2</span>
                          </div>
                          <h4 className="font-semibold text-yellow-300 mb-2">Empacado</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">Productos empacados con cuidado especial</p>
                        </div>
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-black font-bold text-lg">3</span>
                          </div>
                          <h4 className="font-semibold text-yellow-300 mb-2">En Camino</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">Enviado con número de seguimiento</p>
                        </div>
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 text-center">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <span className="text-black font-bold text-lg">4</span>
                          </div>
                          <h4 className="font-semibold text-yellow-300 mb-2">Entrega</h4>
                          <p className="text-xs text-gray-300 leading-relaxed">Entregado en la dirección indicada</p>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">5.1 Embalaje y Protección</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Todos nuestros productos son empacados con especial cuidado para garantizar su integridad:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Cervezas en envases protegidos con material de amortiguación</li>
                        <li className="text-gray-300">Control de temperatura durante el transporte (cuando aplica)</li>
                        <li className="text-gray-300">Cajas resistentes para prevenir daños</li>
                        <li className="text-gray-300">Sellado seguro para evitar filtraciones</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 6 */}
                <section id="seguimiento" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Package className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">6. Seguimiento de Pedidos</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Una vez que su pedido esté en camino, recibirá herramientas para seguirlo en tiempo real:
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-blue-300 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Número de Seguimiento
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Recibirá un número único de seguimiento por email y SMS que le permitirá rastrear su pedido en tiempo real 
                            a través de nuestra plataforma.
                          </p>
                        </div>
                        <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-blue-300 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Notificaciones
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            Recibirá actualizaciones automáticas por email y SMS sobre el estado de su pedido, incluyendo estimaciones 
                            de entrega y contacto del repartidor.
                          </p>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">6.1 Estados del Pedido</h3>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-yellow-400">Confirmado:</strong> Pedido recibido y en proceso de preparación</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">En Preparación:</strong> Productos siendo empacados</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Listo para Envío:</strong> Empaquetado y listo para ser despachado</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">En Camino:</strong> Pedido en ruta hacia su destino</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">En Entrega:</strong> Repartidor en camino a su dirección</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Entregado:</strong> Pedido recibido exitosamente</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 7 */}
                <section id="entrega" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Home className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">7. Proceso de Entrega</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">7.1 Requisitos para la Entrega</h3>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-yellow-400">Mayoría de edad:</strong> Solo entregamos a personas mayores de 18 años</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Identificación:</strong> Se requiere presentar DNI original al momento de la entrega</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Dirección precisa:</strong> La dirección debe ser completa y accesible</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Disponibilidad:</strong> Alguien debe estar disponible para recibir el pedido</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">7.2 Horarios de Entrega</h3>
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 mb-6">
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span><strong>Lunes a Viernes:</strong> 9:00 AM - 8:00 PM</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span><strong>Sábados:</strong> 9:00 AM - 6:00 PM</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span><strong>Domingos:</strong> 10:00 AM - 5:00 PM (solo envíos express)</span>
                          </li>
                        </ul>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">7.3 Intentos de Entrega</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Realizamos hasta 2 intentos de entrega en días hábiles consecutivos. Si no hay nadie disponible:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Le contactaremos para reprogramar la entrega</li>
                        <li className="text-gray-300">Puede coordinar una nueva fecha y hora</li>
                        <li className="text-gray-300">Si no se puede contactar después de 5 días, el pedido puede ser cancelado</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 8 */}
                <section id="garantias" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Shield className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">8. Garantías y Seguridad</h2>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-green-300 mb-4 text-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Garantía de Producto
                          </h4>
                          <ul className="text-gray-300 space-y-2 text-sm">
                            <li>• Productos en perfectas condiciones al momento de la entrega</li>
                            <li>• Temperatura controlada durante el transporte (cuando aplica)</li>
                            <li>• Empaque especial para cervezas artesanales</li>
                            <li>• Protección contra golpes y vibraciones</li>
                            <li>• Inspección previa al envío</li>
                          </ul>
                        </div>
                        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-green-300 mb-4 text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Seguridad del Envío
                          </h4>
                          <ul className="text-gray-300 space-y-2 text-sm">
                            <li>• Repartidores verificados y capacitados</li>
                            <li>• Vehículos equipados y mantenidos</li>
                            <li>• Seguro de transporte incluido</li>
                            <li>• Protocolos de seguridad establecidos</li>
                            <li>• Registro de entregas con firma</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-6">
                        <p className="text-gray-300 leading-relaxed text-lg">
                          <strong className="text-green-400">Compromiso de Calidad:</strong> Si su producto llega en malas condiciones, 
                          lo reemplazamos inmediatamente sin costo adicional. Debe reportar el problema dentro de las 24 horas posteriores 
                          a la entrega.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 9 */}
                <section id="restricciones" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">9. Restricciones y Limitaciones</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">9.1 Restricciones de Envío</h3>
                      <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 mb-6">
                        <ul className="space-y-3 text-gray-300">
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-red-400">Edad mínima:</strong> Solo enviamos productos alcohólicos a personas mayores de 18 años</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-red-400">Identificación obligatoria:</strong> Presentar DNI original al momento de la entrega</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-red-400">Zonas restringidas:</strong> Algunas áreas pueden tener restricciones legales o de acceso</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-red-400">Pedidos mínimos:</strong> Algunos productos pueden requerir pedidos mínimos para envío</span>
                          </li>
                        </ul>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">9.2 Consideraciones Especiales</h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-yellow-300 mb-3">Condiciones Climáticas</h4>
                          <ul className="text-sm text-gray-300 space-y-2">
                            <li>• Lluvias intensas pueden retrasar envíos</li>
                            <li>• En temporada de lluvias, horarios pueden variar</li>
                            <li>• Comunicación previa en caso de retrasos</li>
                            <li>• Evaluación de condiciones de acceso antes del envío</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6">
                          <h4 className="font-semibold text-yellow-300 mb-3">Eventos Especiales</h4>
                          <ul className="text-sm text-gray-300 space-y-2">
                            <li>• Ferias y festividades pueden afectar tiempos</li>
                            <li>• Alta demanda en fechas especiales</li>
                            <li>• Planificación anticipada recomendada</li>
                            <li>• Posibles restricciones de tráfico</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">9.3 Productos No Enviables</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Algunos productos pueden tener restricciones especiales de envío:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Productos con temperatura controlada requieren vehículos especializados</li>
                        <li className="text-gray-300">Pedidos muy grandes pueden requerir coordinación previa</li>
                        <li className="text-gray-300">Productos frágiles pueden tener limitaciones en zonas remotas</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 10 */}
                <section id="reclamos" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <RefreshCw className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">10. Reclamos y Soluciones</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">10.1 Problemas con el Envío</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Si experimenta algún problema con su envío, contáctenos inmediatamente:
                      </p>
                      <ul className="space-y-3 pl-6 mb-6">
                        <li className="text-gray-300"><strong className="text-yellow-400">Productos dañados:</strong> Reporte dentro de 24 horas con fotos del daño</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Pedido incompleto:</strong> Verifique el contenido y reporte inmediatamente</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Pedido incorrecto:</strong> Contacte a nuestro servicio al cliente para solución rápida</li>
                        <li className="text-gray-300"><strong className="text-yellow-400">Retrasos significativos:</strong> Comunicaremos y ofreceremos soluciones</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">10.2 Proceso de Reclamo</h3>
                      <div className="bg-blue-400/10 border border-blue-400/30 rounded-xl p-6 mb-6">
                        <ol className="space-y-3 text-gray-300">
                          <li className="flex items-start gap-3">
                            <span className="bg-blue-400 text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                            <span>Contacte nuestro servicio al cliente por email, teléfono o a través de nuestra plataforma</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-blue-400 text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                            <span>Proporcione el número de pedido y detalles del problema</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-blue-400 text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                            <span>Nuestro equipo investigará y responderá dentro de 24-48 horas</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="bg-blue-400 text-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
                            <span>Ofreceremos una solución adecuada (reemplazo, reembolso, o crédito)</span>
                          </li>
                        </ol>
                      </div>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">10.3 Política de Reembolsos</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        En casos justificados, ofrecemos reembolsos completos o parciales:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Productos defectuosos o dañados → Reembolso completo o reemplazo</li>
                        <li className="text-gray-300">Pedidos incorrectos → Reembolso o envío del producto correcto</li>
                        <li className="text-gray-300">Cancelaciones antes del envío → Reembolso completo</li>
                        <li className="text-gray-300">Retrasos extremos → Reembolso del costo de envío o descuento</li>
                      </ul>
                      <p className="text-gray-300 leading-relaxed">
                        Los reembolsos se procesarán utilizando el mismo método de pago utilizado para la compra, 
                        dentro de 5-10 días hábiles después de la aprobación.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 11 */}
                <section id="condiciones" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <FileText className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">11. Condiciones Especiales</h2>
                      
                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">11.1 Responsabilidad del Cliente</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        El cliente es responsable de:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Proporcionar una dirección de entrega precisa y completa</li>
                        <li className="text-gray-300">Estar disponible en la dirección indicada durante los horarios de entrega</li>
                        <li className="text-gray-300">Verificar que la información de contacto sea correcta</li>
                        <li className="text-gray-300">Notificar cambios de dirección con al menos 24 horas de anticipación</li>
                        <li className="text-gray-300">Presentar identificación válida al momento de la entrega</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">11.2 Fuerza Mayor</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        No seremos responsables por retrasos o fallas en la entrega causados por circunstancias fuera de nuestro control:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Desastres naturales (terremotos, inundaciones, deslizamientos)</li>
                        <li className="text-gray-300">Condiciones climáticas extremas</li>
                        <li className="text-gray-300">Huelgas, conflictos laborales o sociales</li>
                        <li className="text-gray-300">Restricciones gubernamentales o legales</li>
                        <li className="text-gray-300">Pandemias o emergencias sanitarias</li>
                        <li className="text-gray-300">Fallas en servicios de terceros (transporte, comunicaciones)</li>
                      </ul>

                      <h3 className="text-xl font-semibold text-yellow-300 mb-3">11.3 Modificaciones de Pedidos</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Puede solicitar modificaciones a su pedido antes de que sea enviado:
                      </p>
                      <ul className="space-y-2 pl-6 mb-6">
                        <li className="text-gray-300">Cambios de dirección: Máximo 24 horas después de la confirmación</li>
                        <li className="text-gray-300">Cancelación: Antes de que el pedido salga de nuestro almacén</li>
                        <li className="text-gray-300">Modificaciones de productos: Dependen de disponibilidad</li>
                      </ul>
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                        <p className="text-gray-300 leading-relaxed">
                          <strong className="text-yellow-400">Importante:</strong> Una vez que el pedido esté en camino, 
                          las modificaciones pueden no ser posibles. Contacte a nuestro servicio al cliente para evaluar opciones.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 12 */}
                <section id="contacto" className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-3 flex-shrink-0">
                      <Phone className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">12. Contacto y Soporte</h2>
                      <p className="text-gray-300 leading-relaxed mb-6">
                        Si tiene preguntas, necesita ayuda o quiere coordinar un envío especial, nuestro equipo está disponible:
                      </p>
                      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-6 space-y-4 mb-6">
                        <div>
                          <p className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Email de Envíos
                          </p>
                          <a href="mailto:envios@posoqo.com" className="text-gray-300 hover:text-yellow-400 transition-colors text-lg">
                            envios@posoqo.com
                          </a>
                        </div>
                        <div>
                          <p className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Teléfono
                          </p>
                          <a href="tel:+51966123456" className="text-gray-300 hover:text-yellow-400 transition-colors">
                            +51 966 123 456
                          </a>
                          <p className="text-sm text-gray-400 mt-1">Lunes a Domingo: 9:00 AM - 8:00 PM</p>
                        </div>
                        <div>
                          <p className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Dirección
                          </p>
                          <p className="text-gray-300">Portal Independencia Nº65, Plaza de Armas</p>
                          <p className="text-gray-300">Ayacucho, Perú</p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        Nuestro equipo de logística está disponible para resolver sus dudas, coordinar envíos especiales 
                        y asistirle con cualquier consulta relacionada con el servicio de entrega.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Acceptance Box */}
                <div className="bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border-2 border-yellow-400/50 rounded-2xl p-8 text-center">
                  <Truck className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                    Llevamos la Tradición Ayacuchana a tu Puerta
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto mb-4">
                    En POSOQO, cada envío es una oportunidad para compartir la autenticidad de nuestras cervezas artesanales. 
                    Nos esforzamos por brindarle un servicio de entrega excepcional que complemente la calidad de nuestros productos.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Al realizar una compra, usted acepta esta Política de Envíos en su totalidad.
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
