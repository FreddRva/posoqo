"use client";
import Image from "next/image";
import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"], weight: ["800"] });

const cervezas = [
  {
    nombre: "Cerveza Retama",
    color: "Dorado",
    notas: "Notas cítricas a pomelo y lima.",
    ibus: 20,
    estilo: "Session Ipa",
    avb: "5%",
    icono: "lupulo"
  },
  {
    nombre: "Cerveza Herbal",
    color: "Dorado Profundo",
    notas: "Notas herbales, hierba luisa.",
    ibus: 50,
    estilo: "Ipa",
    avb: "7%",
    icono: "lupulo"
  },
  {
    nombre: "Cerveza Frutal",
    color: "Anaranjado Intenso",
    notas: "Notas frutales a mango y maracuyá.",
    ibus: 50,
    estilo: "Doble Ipa",
    avb: "8%",
    icono: "lupulo"
  },
  {
    nombre: "Cerveza Tankar",
    color: "Rojo Intenso",
    notas: "Notas cítricas, tostadas, sabor a malta y pan dulce.",
    ibus: 30,
    estilo: "Irish Ale",
    avb: "7%",
    icono: "lupulo"
  }
];

export default function BrandPresentation() {
  return (
    <section className={`relative bg-black py-12 md:py-20 flex flex-col items-center text-center overflow-hidden border-b-4 border-yellow-500 ${montserrat.className}`}>
      {/* Espigas decorativas ejemplo SVG */}
      <div className="absolute left-8 top-0 md:top-8 w-24 md:w-32 opacity-80 select-none pointer-events-none">
        <svg viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 0C24 0 24 40 0 80C24 60 48 80 24 0Z" fill="#E6B800"/></svg>
      </div>
      <div className="absolute right-8 top-0 md:top-8 w-24 md:w-32 opacity-80 select-none pointer-events-none rotate-180">
        <svg viewBox="0 0 48 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 0C24 0 24 40 0 80C24 60 48 80 24 0Z" fill="#E6B800"/></svg>
      </div>
      {/* Logo y subtítulo */}
      <div className="mb-4 flex flex-col items-center">
        <span className="text-6xl md:text-7xl font-extrabold tracking-tight text-[#E6B800] font-[Montserrat,sans-serif]">POSOQO</span>
        <span className="text-xl md:text-2xl font-extrabold text-[#E6B800] tracking-widest mt-1 font-[Montserrat,sans-serif]">CERVEZA AYACUCHANA</span>
      </div>
      <p className="max-w-2xl mx-auto text-zinc-200 text-lg md:text-xl mb-6 leading-relaxed font-sans">
        Posoqo viene del quechua <span className="font-bold text-[#E6B800]">pusuqo</span>, que significa <span className="italic text-yellow-200">espuma</span>.<br />
        Para nosotros, la espuma no es solo un símbolo de calidad y fermentación bien lograda, sino también una expresión de tradición, dedicación y respeto por lo auténtico.<br />
        Cada una de nuestras cervezas artesanales nace de esta filosofía: honrar nuestras raíces con sabores únicos, elaborados con esmero y con el <span className="font-bold text-[#E6B800]">orgullo de ser ayacuchanos</span>.
      </p>
      {/* Separador dorado con espiga */}
      <div className="w-full flex justify-center items-center my-8">
        <div className="h-1 w-1/4 bg-[#E6B800] rounded-full"></div>
        <svg className="mx-4" width="32" height="32" viewBox="0 0 32 32"><path d="M16 0C16 0 16 16 0 32C16 24 32 32 16 0Z" fill="#E6B800"/></svg>
        <div className="h-1 w-1/4 bg-[#E6B800] rounded-full"></div>
      </div>
      {/* Grid de cards de cervezas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 w-full max-w-6xl">
        {cervezas.map((c, i) => (
          <div key={i} className="bg-[#18151f] border-l-4 border-[#E6B800] rounded-xl p-6 shadow-lg flex flex-col items-start">
            {/* Ícono de lúpulo ejemplo SVG */}
            <svg width="32" height="32" viewBox="0 0 32 32" className="mb-2"><ellipse cx="16" cy="16" rx="12" ry="16" fill="#E6B800" /></svg>
            <span className="block text-[#E6B800] font-extrabold text-lg mb-1 font-[Montserrat,sans-serif]">{c.nombre}</span>
            <span className="block text-yellow-200 text-xs mb-1 font-bold uppercase">Color: {c.color}</span>
            <span className="block text-zinc-100 text-sm mb-1">{c.notas}</span>
            <span className="block text-zinc-400 text-xs">Ibus: {c.ibus} | Estilo: {c.estilo} | Avb: {c.avb}</span>
          </div>
        ))}
      </div>
      {/* Separador dorado con espiga */}
      <div className="w-full flex justify-center items-center my-10">
        <div className="h-1 w-1/4 bg-[#E6B800] rounded-full"></div>
        <svg className="mx-4" width="32" height="32" viewBox="0 0 32 32"><path d="M16 0C16 0 16 16 0 32C16 24 32 32 16 0Z" fill="#E6B800"/></svg>
        <div className="h-1 w-1/4 bg-[#E6B800] rounded-full"></div>
      </div>
      {/* Bloque de servicios ejemplo */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-[#18151f] border-2 border-[#E6B800] rounded-xl p-6 flex flex-col items-center shadow-lg">
          <img src="/placeholder.png" alt="Draf Beer" className="w-32 h-32 object-cover rounded-lg mb-2" />
          <span className="text-[#E6B800] font-extrabold text-lg mb-1 font-[Montserrat,sans-serif]">DRAF BEER</span>
          <span className="text-zinc-100 text-sm text-center">Múltiple dispensación de cerveza, equipos y atención especial para eventos.</span>
        </div>
        <div className="bg-[#18151f] border-2 border-[#E6B800] rounded-xl p-6 flex flex-col items-center shadow-lg">
          <img src="/placeholder.png" alt="Party Pump" className="w-32 h-32 object-cover rounded-lg mb-2" />
          <span className="text-[#E6B800] font-extrabold text-lg mb-1 font-[Montserrat,sans-serif]">PARTY PUMP</span>
          <span className="text-zinc-100 text-sm text-center">Alquiler de Party Pump para fiestas, eventos y celebraciones.</span>
        </div>
        <div className="bg-[#18151f] border-2 border-[#E6B800] rounded-xl p-6 flex flex-col items-center shadow-lg">
          <img src="/placeholder.png" alt="POSOQO Corporativo" className="w-32 h-32 object-cover rounded-lg mb-2" />
          <span className="text-[#E6B800] font-extrabold text-lg mb-1 font-[Montserrat,sans-serif]">POSOQO CORPORATIVO</span>
          <span className="text-zinc-100 text-sm text-center">Cerveza personalizada para empresas, eventos y regalos corporativos.</span>
        </div>
      </div>
      {/* Footer de contacto */}
      <div className="w-full flex flex-col items-center mt-8">
        <div className="w-full flex justify-center items-center mb-4">
          <div className="h-1 w-1/4 bg-[#E6B800] rounded-full"></div>
          <svg className="mx-4" width="32" height="32" viewBox="0 0 32 32"><path d="M16 0C16 0 16 16 0 32C16 24 32 32 16 0Z" fill="#E6B800"/></svg>
          <div className="h-1 w-1/4 bg-[#E6B800] rounded-full"></div>
        </div>
        <span className="text-[#E6B800] font-extrabold text-2xl font-[Montserrat,sans-serif] mb-2">SERVICIO ESPECIAL DEL BARRIL A TU VASO</span>
        <span className="text-white text-xl font-bold flex items-center gap-2"><svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#25D366"/><text x="50%" y="56%" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fff">&#x1F4F2;</text></svg> 956091241</span>
      </div>
    </section>
  );
} 