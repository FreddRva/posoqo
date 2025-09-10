"use client";

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/51966123456"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 top-1/2 right-6 -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl hover:shadow-green-500/30 flex items-center justify-center w-16 h-16 transition-all duration-300 group hover:scale-110 animate-pulse"
      aria-label="Contactar por WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="w-8 h-8"
      >
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.05C13.416 27.168 14.684 27.5 16 27.5c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.18 0-2.336-.195-3.432-.578l-.244-.082-4.65 1.217 1.24-4.53-.158-.234C6.57 18.08 6 16.57 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.71c-.29-.145-1.71-.844-1.974-.94-.264-.097-.456-.145-.648.145-.193.29-.744.94-.912 1.133-.168.193-.336.217-.626.072-.29-.145-1.224-.451-2.33-1.438-.861-.767-1.443-1.713-1.613-2.003-.168-.29-.018-.447.127-.592.13-.13.29-.336.435-.504.145-.168.193-.29.29-.483.097-.193.048-.362-.024-.507-.072-.145-.648-1.566-.888-2.146-.234-.563-.473-.486-.648-.495-.168-.007-.362-.009-.555-.009-.193 0-.507.072-.773.362-.264.29-1.016.994-1.016 2.423 0 1.429 1.04 2.809 1.185 3.003.145.193 2.05 3.13 4.97 4.267.695.3 1.236.478 1.66.612.698.222 1.334.191 1.836.116.56-.084 1.71-.698 1.953-1.372.241-.674.241-1.252.168-1.372-.072-.12-.264-.193-.555-.338z" />
      </svg>
      <span className="absolute opacity-0 group-hover:opacity-100 bg-green-600 text-white text-xs font-bold rounded px-3 py-2 left-0 -translate-x-full ml-2 transition-all pointer-events-none whitespace-nowrap shadow-lg">
        ¡Escríbenos!
      </span>
    </a>
  );
} 