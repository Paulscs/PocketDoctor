import { API_BASE_URL } from '@/constants/api';

export interface Centro {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  provincia?: string;
  rnc?: string;
  ubicacion_geografica?: string;
  estado: boolean;
}

export interface EspecialistaCentro {
  especialista_id: number;
  nombre: string;
  apellido?: string;
  especialidad?: string[];
  contacto?: string;
  centro_id: number;
}

export async function getCentros(accessToken: string): Promise<Centro[]> {
  const response = await fetch(`${API_BASE_URL}/centros`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch centros: ${response.statusText}`);
  }

  return response.json();
}

export async function getEspecialistasCentro(centroId: string, accessToken: string): Promise<EspecialistaCentro[]> {
  const response = await fetch(`${API_BASE_URL}/centros/${centroId}/especialistas`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch especialistas: ${response.statusText}`);
  }

  return response.json();
}

export async function searchSpecialists(query: string, accessToken: string): Promise<EspecialistaCentro[]> {
  const response = await fetch(`${API_BASE_URL}/especialistas?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search specialists: ${response.statusText}`);
  }

  return response.json();
}