/**
 * Utilidades para consultar DNI desde la API
 */

import { getApiUrl } from './config';

export interface DNIData {
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo: string;
  codigo_verificacion: string;
}

export interface DNIApiResponse {
  success: boolean;
  data: DNIData;
  error?: string;
}

/**
 * Consulta los datos de un DNI desde la API
 * @param dni - Número de DNI de 8 dígitos
 * @returns Promise con los datos del DNI o null si hay error
 */
export async function consultarDNI(dni: string): Promise<DNIData | null> {
  // Validar que el DNI tenga 8 dígitos
  if (!/^\d{8}$/.test(dni)) {
    return null;
  }

  try {
    const response = await fetch(getApiUrl(`dni/${dni}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al consultar el DNI');
    }

    const result: DNIApiResponse = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error('Error consultando DNI:', error);
    return null;
  }
}

