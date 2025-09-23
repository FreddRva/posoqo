"use client";
import { Heart, Users, Target, Award, BookOpen, Globe, Star, Coffee, Phone, Mail, ChevronRight, MapPin, Calendar, Leaf, Zap, Shield } from "lucide-react";

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/30 mb-6">
            <Star className="w-5 h-5 text-amber-400 mr-2" />
            <span className="text-amber-300 font-medium">Desde 2014 - Tradición y Excelencia</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Descubre la <span className="text-amber-400">Esencia</span> de POSOQO
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Donde la tradición ayacuchana se encuentra con la innovación cervecera artesanal. 
            Más que una cervecería, somos una familia apasionada por crear experiencias únicas.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-2">10+</div>
            <div className="text-gray-300 text-sm">Años de Experiencia</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-2">50K+</div>
            <div className="text-gray-300 text-sm">Clientes Satisfechos</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-2">15+</div>
            <div className="text-gray-300 text-sm">Variedades Únicas</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-2">3</div>
            <div className="text-gray-300 text-sm">Taprooms Activos</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Historia Section */}
        <section className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
          <div className="ml-8">
            <div className="flex items-center mb-8">
              <div className="bg-amber-500 p-3 rounded-2xl mr-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-amber-400 font-semibold text-lg">Capítulo 01</span>
                <h2 className="text-3xl font-bold text-white">Nuestra Historia</h2>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/20">
                <h3 className="text-xl font-bold text-amber-300 mb-4">El Comienzo de un Sueño</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  En el corazón de los Andes ayacuchanos, un grupo de amigos compartía una pasión: 
                  la cerveza artesanal. Lo que comenzó como reuniones informales en un garaje familiar 
                  en 2014, pronto se transformó en una visión compartida de crear algo extraordinario.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  El nombre <span className="text-amber-400 font-semibold">POSOQO</span>, que en quechua 
                  significa "lugar de encuentro", refleja nuestra esencia: un espacio donde la comunidad 
                  se une alrededor de buenas cervezas y mejores momentos.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/30 rounded-2xl p-8 border border-amber-500/30">
                <h3 className="text-xl font-bold text-amber-300 mb-6">Línea de Tiempo</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-amber-500 rounded-full p-2 mr-4 mt-1">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">2014 - Fundación</h4>
                      <p className="text-gray-300 text-sm">Nacimos en un garaje familiar en Ayacucho</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-amber-500 rounded-full p-2 mr-4 mt-1">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">2016 - Primer Taproom</h4>
                      <p className="text-gray-300 text-sm">Inauguramos nuestro primer espacio oficial</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-amber-500 rounded-full p-2 mr-4 mt-1">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">2020 - Expansión Digital</h4>
                      <p className="text-gray-300 text-sm">Lanzamos servicio de delivery nacional</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filosofía Section */}
        <section className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
          <div className="ml-8">
            <div className="flex items-center mb-8">
              <div className="bg-amber-500 p-3 rounded-2xl mr-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-amber-400 font-semibold text-lg">Capítulo 02</span>
                <h2 className="text-3xl font-bold text-white">Nuestra Filosofía</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                <div className="bg-amber-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Pasión Artesanal</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Cada cerveza es una obra maestra creada con dedicación y amor por el arte cervecero tradicional.
                </p>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                <div className="bg-amber-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Sostenibilidad</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Comprometidos con el medio ambiente y el desarrollo sostenible de nuestra comunidad.
                </p>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                <div className="bg-amber-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Comunidad</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Creamos espacios donde las personas se conectan, comparten y crean recuerdos juntos.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-900/40 to-amber-800/30 rounded-2xl p-8 border border-amber-500/30">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-amber-300 mb-4">Nuestra Promesa</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  "En cada sorbo de POSOQO, encontrarás no solo una cerveza excepcional, 
                  sino una historia de tradición, innovación y el espíritu vibrante de Ayacucho."
                </p>
                <div className="text-amber-400 font-semibold">
                  — Fundadores de POSOQO
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Equipo Section */}
        <section className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
          <div className="ml-8">
            <div className="flex items-center mb-8">
              <div className="bg-amber-500 p-3 rounded-2xl mr-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-amber-400 font-semibold text-lg">Capítulo 03</span>
                <h2 className="text-3xl font-bold text-white">Nuestro Equipo</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Coffee className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Maestros Cerveceros</h3>
                <p className="text-gray-300 text-sm">Expertos en el arte de la elaboración tradicional</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Control de Calidad</h3>
                <p className="text-gray-300 text-sm">Garantía de excelencia en cada lote</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Innovación</h3>
                <p className="text-gray-300 text-sm">Desarrollo de nuevas recetas y técnicas</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Sostenibilidad</h3>
                <p className="text-gray-300 text-sm">Compromiso con prácticas responsables</p>
              </div>
            </div>
          </div>
        </section>

        {/* Compromiso Section */}
        <section className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
          <div className="ml-8">
            <div className="flex items-center mb-8">
              <div className="bg-amber-500 p-3 rounded-2xl mr-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-amber-400 font-semibold text-lg">Capítulo 04</span>
                <h2 className="text-3xl font-bold text-white">Compromiso Social</h2>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/20">
                <h3 className="text-xl font-bold text-amber-300 mb-6">🌱 Nuestro Impacto Ambiental</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                      <Leaf className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-gray-300">100% energía renovable en nuestros procesos</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                      <Leaf className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-gray-300">Embalajes 100% biodegradables</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                      <Leaf className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-gray-300">Programa de reciclaje de botellas</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/20">
                <h3 className="text-xl font-bold text-amber-300 mb-6">🤝 Apoyo a la Comunidad</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-gray-300">Capacitación a productores locales</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-gray-300">Eventos culturales gratuitos</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-gray-300">Apoyo a emprendimientos locales</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/30 rounded-3xl p-12 border border-amber-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para Experimentar la Diferencia POSOQO?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Visita nuestros taprooms y descubre por qué somos la elección preferida 
              de los amantes de la cerveza artesanal en Ayacucho.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <MapPin className="w-5 h-5 mr-2" />
                Encuentra tu Taproom Más Cercano
              </button>
              <button className="border border-amber-500 text-amber-400 hover:bg-amber-500/10 font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center justify-center">
                <Phone className="w-5 h-5 mr-2" />
                Contáctanos
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}