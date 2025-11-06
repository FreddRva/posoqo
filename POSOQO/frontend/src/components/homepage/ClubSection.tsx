'use client'
import React from 'react'
import { Calendar, Sparkles } from 'lucide-react'

export const ClubSection: React.FC = () => {
  return (
    <section 
      className="relative py-24 overflow-hidden bg-gradient-to-br from-black via-gray-950 to-black"
    >
      {/* Fondo simple sin animaciones pesadas */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-2 text-yellow-400 text-sm font-semibold mb-8">
          <Calendar className="w-5 h-5" />
          <span className="tracking-wider">EVENTOS</span>
          <Sparkles className="w-5 h-5" />
        </div>
        
        {/* Título principal */}
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Próximos Eventos
          </span>
        </h2>
        
        {/* Descripción */}
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Estamos preparando eventos exclusivos e increíbles para ti. Muy pronto estarán disponibles.
        </p>

        {/* Card informativo */}
        <div className="mt-12 bg-black/60 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-black" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-1">Mantente Informado</h3>
              <p className="text-gray-400">Sé el primero en conocer nuestros próximos eventos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
