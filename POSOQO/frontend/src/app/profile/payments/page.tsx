"use client";

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface Payment {
  id: string;
  order_id?: string;
  reservation_id?: string;
  stripe_payment_id: string;
  amount: number;
  status: string;
  method: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await apiFetch<{ payments: Payment[] }>('/payments');
      if (response.payments) {
        setPayments(response.payments);
      }
    } catch (error) {
      console.error('Error cargando pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'failed': return 'Fallido';
      case 'refunded': return 'Reembolsado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleRefund = async (paymentId: string, amount: number) => {
    if (!confirm('¿Estás seguro de que quieres solicitar un reembolso?')) {
      return;
    }

    try {
      setRefunding(paymentId);
      await apiFetch('/payments/refund', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: paymentId,
          amount: 0, // Reembolso completo
          reason: 'Solicitud del cliente'
        })
      });
      
      // Recargar pagos
      await loadPayments();
      alert('Reembolso solicitado exitosamente');
    } catch (error) {
      console.error('Error solicitando reembolso:', error);
      alert('Error al solicitar reembolso');
    } finally {
      setRefunding(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Historial de Pagos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Revisa todos tus pagos y solicita reembolsos si es necesario
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{payment.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.order_id ? 'Pedido' : payment.reservation_id ? 'Reserva' : 'Otro'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        S/ {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payment.status === 'paid' && (
                          <button
                            onClick={() => handleRefund(payment.id, payment.amount)}
                            disabled={refunding === payment.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            {refunding === payment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            ) : (
                              'Solicitar Reembolso'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && payments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No hay pagos para mostrar</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 