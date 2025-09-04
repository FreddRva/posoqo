"use client";
import { BeakerIcon, FireIcon, SparklesIcon } from "@heroicons/react/24/solid";

const categories = [
  {
    key: "drinks",
    label: "Bebidas",
    icon: <BeakerIcon className="w-8 h-8 text-yellow-400" />,
  },
  {
    key: "foods",
    label: "Comidas",
    icon: <FireIcon className="w-8 h-8 text-orange-500" />,
  },
  {
    key: "promos",
    label: "Promociones",
    icon: <SparklesIcon className="w-8 h-8 text-pink-500" />,
  },
];

export default function CategoryMenu({ selected, onSelectCategory }: { selected: string, onSelectCategory: (key: string) => void }) {
  return (
    <nav className="w-full bg-white/95 dark:bg-zinc-900/95 border-b shadow-sm sticky top-16 z-30 overflow-x-auto">
      <ul className="flex gap-6 px-6 py-3 min-w-max overflow-x-auto scrollbar-thin scrollbar-thumb-yellow-400">
        {categories.map(cat => (
          <li key={cat.key} className="flex flex-col items-center min-w-[90px]">
            <button
              onClick={() => onSelectCategory(cat.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all font-semibold text-sm ${selected === cat.key ? "bg-yellow-500 text-white shadow" : "hover:bg-yellow-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"}`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
} 