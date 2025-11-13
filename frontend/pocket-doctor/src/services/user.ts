import { API_BASE_URL } from '../constants/api';

export interface UserProfile {
  id: number;
  user_auth_id: string;
  nombre?: string;
  apellido?: string;
  email: string;
  fecha_nacimiento?: string;
  sexo?: string;
  ubicacion?: string;
  fecha_registro: string;
  estado: boolean;
  es_admin?: boolean;
  altura_cm?: number;
  peso_kg?: number;
  tipo_sangre?: string;
  alergias?: string[];
  condiciones_medicas?: string[];
}

export async function getUserProfile(accessToken: string): Promise<UserProfile> {
    console.log(`${API_BASE_URL}`);
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json ',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}}`);
  }

  return response.json();
}

export async function updateUserProfile(accessToken: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user profile: ${response.statusText}`);
  }

  return response.json();
}

export async function getRootMessage(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch root message: ${response.statusText}`);
  }

  return response.json();
}
