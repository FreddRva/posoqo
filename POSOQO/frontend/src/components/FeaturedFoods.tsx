import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category_id?: string;
}

export default function FeaturedFoods() {
  const [foods, setFoods] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFoods() {
      try {
        const categories = await apiFetch<any[]>("/categories");
        const comidasCat = categories.find(cat => cat.name.toLowerCase() === "comidas" || cat.name.toLowerCase() === "comida");
        if (!comidasCat) return setFoods([]);
        const res = await apiFetch<{ success: boolean; data: Product[] }>("/products");
        const filtered = res.data.filter(p => p.category_id === comidasCat.id).slice(0, 4);
        setFoods(filtered);
      } catch {
        setFoods([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFoods();
  }, []);

  if (loading) return null;
  if (!foods.length) return null;

  return (
    <section className="my-16 max-w-6xl mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-400 mb-6">Comidas destacadas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {foods.map(food => (
          <div key={food.id} className="bg-stone-900/80 rounded-2xl shadow-xl p-4 flex flex-col items-center border border-yellow-400/20">
            <img
              src={food.image_url && !food.image_url.startsWith('http') ? `http://localhost:4000${food.image_url}` : (food.image_url || "/file.svg")}
              alt={food.name}
              width={120}
              height={120}
              className="object-cover w-28 h-28 rounded-xl mb-3"
              onError={e => { e.currentTarget.src = '/file.svg'; }}
            />
            <h3 className="text-lg font-bold text-yellow-100 mb-1 truncate" title={food.name}>{food.name}</h3>
            <span className="font-bold text-green-400 mb-2">S/ {food.price.toFixed(2)}</span>
            <Link href={`/products/${food.id}`} className="bg-yellow-400 text-stone-900 font-bold px-4 py-2 rounded-xl shadow hover:bg-yellow-300 transition-colors text-sm">Ver más</Link>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <Link href="/products?filter=comidas" className="text-yellow-400 font-bold hover:underline text-lg">Ver todas las comidas &rarr;</Link>
      </div>
    </section>
  );
} 