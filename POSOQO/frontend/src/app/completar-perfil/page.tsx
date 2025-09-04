"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function CompletarPerfilPage() {
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ last_name: lastName, dni, phone }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/"), 1000);
    } catch (err: any) {
      setError(err?.error || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Completa tu perfil</h1>
      <input
        type="text"
        placeholder="Apellido"
        value={lastName}
        onChange={e => setLastName(e.target.value)}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="DNI"
        value={dni}
        onChange={e => setDni(e.target.value)}
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Número de teléfono"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        required
        className="w-full border rounded px-3 py-2"
      />
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">¡Perfil actualizado!</div>}
      <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded">
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
} 