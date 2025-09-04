"use client";
import { Heart, Users, Target, Award, BookOpen, Globe, Star, Coffee, Phone, Mail } from "lucide-react";

export default function SobreNosotrosPage() {
  return (
    <div className="max-w-5xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700/50">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 px-8 py-8 sm:py-10 border-b border-amber-400/30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-12 h-12 text-white mr-3" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Sobre Nosotros</h1>
            </div>
            <div className="bg-amber-600/20 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
              <p className="text-2xl font-bold text-amber-100 mb-2">
                📖 Conoce Nuestra Historia y Filosofía
              </p>
              <p className="text-amber-200 font-medium">
                Descubre la pasión que hay detrás de cada cerveza artesanal
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-8 sm:p-10 space-y-10">
          <div className="prose prose-invert max-w-none">
            {/* Historia y Orígenes */}
            <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-8 rounded-2xl border-2 border-amber-500/50 text-center mb-10">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="w-16 h-16 text-amber-400 mr-4" />
                <div>
                  <h2 className="text-3xl font-bold text-amber-300 mb-2">
                    Nuestra Historia
                  </h2>
                  <p className="text-xl text-amber-200">
                    Una tradición que nació en el corazón de Ayacucho
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <div className="text-3xl mb-2">🏔️</div>
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Orígenes</h3>
                  <p className="text-amber-200 text-sm">Nacimos en las alturas de Ayacucho</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <div className="text-3xl mb-2">🍺</div>
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Tradición</h3>
                  <p className="text-amber-200 text-sm">Más de 10 años de experiencia</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-xl border border-amber-600/30">
                  <div className="text-3xl mb-2">❤️</div>
                  <h3 className="text-lg font-bold text-amber-300 mb-2">Pasión</h3>
                  <p className="text-amber-200 text-sm">Amor por la cerveza artesanal</p>
                </div>
              </div>
            </div>

            {/* Section 1 - Nuestra Historia */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">1</div>
                <h2 className="text-2xl font-bold text-amber-400">El Inicio de una Pasión</h2>
              </div>
              <div className="pl-14">
                <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800 mb-6">
                  <h3 className="text-xl font-semibold text-amber-300 mb-3">Los Primeros Pasos</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    POSOQO nació en el año 2014 en el corazón de Ayacucho, cuando un grupo de amigos 
                    apasionados por la cerveza artesanal decidió combinar la tradición local con técnicas 
                    modernas de elaboración. Lo que comenzó como un hobby en un garaje se convirtió en 
                    una misión: llevar la auténtica cerveza ayacuchana a todos los rincones del Perú.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Nuestro nombre "POSOQO" proviene de la palabra quechua que significa "el lugar donde 
                    se reúnen los amigos", y eso es exactamente lo que hemos creado: un espacio donde la 
                    comunidad se une para celebrar la vida, la tradición y, por supuesto, la excelente cerveza.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h4 className="font-semibold text-amber-300 mb-3">🏆 Hitos Importantes</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• <strong>2014:</strong> Fundación de POSOQO</li>
                      <li>• <strong>2016:</strong> Primer taproom en Ayacucho</li>
                      <li>• <strong>2018:</strong> Expansión a provincias</li>
                      <li>• <strong>2020:</strong> Lanzamiento de delivery</li>
                      <li>• <strong>2023:</strong> Club de miembros</li>
                      <li>• <strong>2024:</strong> 10 años de excelencia</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h4 className="font-semibold text-amber-300 mb-3">🎯 Nuestra Misión</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Ser la referencia en cerveza artesanal ayacuchana, preservando las tradiciones 
                      locales mientras innovamos constantemente para brindar experiencias únicas a 
                      nuestros clientes, contribuyendo al desarrollo de nuestra comunidad.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 - Nuestra Filosofía */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">2</div>
                <h2 className="text-2xl font-bold text-amber-400">Nuestra Filosofía</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                    <div className="flex items-center mb-4">
                      <Heart className="w-8 h-8 text-amber-400 mr-3" />
                      <h3 className="text-xl font-semibold text-amber-300">Valores Fundamentales</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">❤️ Pasión</h4>
                        <p className="text-sm text-gray-300">Amor por la cerveza y la tradición</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">🌟 Calidad</h4>
                        <p className="text-sm text-gray-300">Excelencia en cada producto</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">🤝 Comunidad</h4>
                        <p className="text-sm text-gray-300">Unión y apoyo mutuo</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800">
                    <div className="flex items-center mb-4">
                      <Target className="w-8 h-8 text-amber-400 mr-3" />
                      <h3 className="text-xl font-semibold text-amber-300">Principios de Trabajo</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">🌱 Sostenibilidad</h4>
                        <p className="text-sm text-gray-300">Respeto por el medio ambiente</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">🔬 Innovación</h4>
                        <p className="text-sm text-gray-300">Mejora continua</p>
                      </div>
                      <div className="bg-amber-800/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-1">🎨 Artesanía</h4>
                        <p className="text-sm text-gray-300">Trabajo manual y dedicado</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-6 rounded-xl border border-amber-700 text-center">
                  <h3 className="text-xl font-bold text-amber-300 mb-3">
                    🎯 Nuestra Visión
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Ser reconocidos como la marca líder en cerveza artesanal ayacuchana, expandiendo 
                    nuestra presencia a nivel nacional e internacional, siempre manteniendo la autenticidad 
                    y calidad que nos caracteriza.
                  </p>
                  <div className="bg-amber-800/20 p-4 rounded-lg inline-block">
                    <p className="text-2xl font-bold text-amber-400">
                      "Tradición, Calidad y Pasión en Cada Sorbo"
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 - Nuestro Equipo */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">3</div>
                <h2 className="text-2xl font-bold text-amber-400">Nuestro Equipo</h2>
              </div>
              <div className="pl-14">
                <div className="bg-amber-900/20 p-6 rounded-lg border border-amber-800 mb-6">
                  <h3 className="text-xl font-semibold text-amber-300 mb-3">El Corazón de POSOQO</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    Nuestro equipo está compuesto por profesionales apasionados, maestros cerveceros 
                    certificados, y personal comprometido con la excelencia. Cada miembro aporta su 
                    experiencia única para crear la experiencia POSOQO que nuestros clientes conocen y aman.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Coffee className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Maestros Cerveceros</h4>
                    <p className="text-xs text-gray-300">Expertos en el arte de la elaboración</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Servicio al Cliente</h4>
                    <p className="text-xs text-gray-300">Atención personalizada 24/7</p>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800 text-center">
                    <div className="bg-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">Gestión de Calidad</h4>
                    <p className="text-xs text-gray-300">Control riguroso de procesos</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 - Nuestros Logros */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">4</div>
                <h2 className="text-2xl font-bold text-amber-400">Logros y Reconocimientos</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">🏆 Premios y Certificaciones</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• <strong>2018:</strong> Mejor Cerveza Artesanal de Ayacucho</li>
                      <li>• <strong>2019:</strong> Certificación de Calidad ISO 9001</li>
                      <li>• <strong>2020:</strong> Premio a la Innovación Gastronómica</li>
                      <li>• <strong>2022:</strong> Mejor Taproom del Sur del Perú</li>
                      <li>• <strong>2023:</strong> Reconocimiento por Sostenibilidad</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">📊 Cifras Importantes</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• <strong>10+ años</strong> de experiencia</li>
                      <li>• <strong>50+ empleados</strong> comprometidos</li>
                      <li>• <strong>100,000+</strong> clientes satisfechos</li>
                      <li>• <strong>15+ variedades</strong> de cerveza</li>
                      <li>• <strong>3 taprooms</strong> en operación</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 - Compromiso Social */}
            <section className="mb-10">
              <div className="flex items-center mb-6">
                <div className="bg-amber-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-4">5</div>
                <h2 className="text-2xl font-bold text-amber-400">Compromiso Social</h2>
              </div>
              <div className="pl-14">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">🌱 Sostenibilidad</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Uso de ingredientes locales y orgánicos</li>
                      <li>• Reducción de residuos y reciclaje</li>
                      <li>• Energía renovable en nuestros procesos</li>
                      <li>• Empaques biodegradables</li>
                      <li>• Conservación del agua</li>
                    </ul>
                  </div>
                  <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-800">
                    <h3 className="text-xl font-semibold text-amber-300 mb-3">🤝 Comunidad</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Apoyo a productores locales</li>
                      <li>• Programas de capacitación</li>
                      <li>• Eventos culturales y educativos</li>
                      <li>• Donaciones a organizaciones locales</li>
                      <li>• Promoción del turismo local</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 p-6 rounded-xl border border-amber-700 text-center">
                  <h3 className="text-xl font-bold text-amber-300 mb-3">
                    🌍 Nuestro Impacto
                  </h3>
                  <p className="text-gray-300 mb-4">
                    En POSOQO, creemos que el éxito empresarial debe ir de la mano con el desarrollo 
                    sostenible y el bienestar de nuestra comunidad. Cada decisión que tomamos está 
                    guiada por nuestro compromiso con el futuro.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 p-8 rounded-xl border border-amber-700 text-center">
              <h3 className="text-2xl font-bold text-amber-300 mb-4">
                ¿Quieres Conocer Más de Nosotros?
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                Visítanos en cualquiera de nuestros taprooms o contáctanos para conocer más sobre 
                nuestra historia, filosofía y pasión por la cerveza artesanal.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Globe className="w-5 h-5" />
                    <span className="font-semibold">Visítanos</span>
                  </div>
                  <p className="text-amber-200 font-medium">Taproom Principal</p>
                  <p className="text-xs text-amber-300">Plaza de Armas, Ayacucho</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Phone className="w-5 h-5" />
                    <span className="font-semibold">Llámanos</span>
                  </div>
                  <p className="text-amber-200 font-medium">+51 966 123 456</p>
                  <p className="text-xs text-amber-300">24/7 disponible</p>
                </div>
                <div className="bg-amber-800/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center justify-center space-x-3 text-amber-300 mb-2">
                    <Mail className="w-5 h-5" />
                    <span className="font-semibold">Escríbenos</span>
                  </div>
                  <p className="text-amber-200 font-medium">info@posoqo.com</p>
                  <p className="text-xs text-amber-300">Respuesta en 2-4h</p>
                </div>
              </div>
            </div>

            {/* Final Note */}
            <div className="bg-gray-700/50 p-6 rounded-xl border-2 border-amber-500/50 text-center">
              <p className="text-lg font-bold text-amber-400 mb-2">
                📖 Nuestra Historia Continúa Escribiéndose
              </p>
              <p className="text-gray-300">
                En POSOQO, cada día es una nueva oportunidad para crear experiencias únicas, 
                preservar nuestras tradiciones y compartir nuestra pasión por la cerveza artesanal 
                con el mundo. Gracias por ser parte de esta increíble historia que estamos construyendo juntos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
