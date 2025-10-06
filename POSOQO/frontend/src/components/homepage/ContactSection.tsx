// components/homepage/ContactSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-4">
            Contacto
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            Visítanos o contáctanos para más información sobre nuestras cervezas
          </p>
          <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-2">Ubicación</h3>
                <p className="text-gray-600">
                  Ayacucho, Perú<br />
                  Centro Histórico
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-2">Teléfono</h3>
                <p className="text-gray-600">+51 999 999 999</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-2">Email</h3>
                <p className="text-gray-600">info@posoqo.com</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black mb-2">Horarios</h3>
                <p className="text-gray-600">
                  Lunes - Domingo<br />
                  10:00 AM - 10:00 PM
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-100 rounded-lg p-8"
          >
            <h3 className="text-2xl font-bold text-black mb-6">Envíanos un mensaje</h3>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <textarea
                  placeholder="Mensaje"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-yellow-400 focus:outline-none"
                ></textarea>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Enviar Mensaje
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};