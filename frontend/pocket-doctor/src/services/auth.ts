import { supabase } from '@/src/lib/supabase';

export async function registerUser(input: {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: string; // 'YYYY-MM-DD'
  sexo?: string;             // 'M'|'F'|'U'
}) {
  const { email, password, ...meta } = input;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: meta },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data; // data.session?.access_token es tu JWT
}
