// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// ⚠️ Usa los de tu proyecto Supabase
const SUPABASE_URL = 'https://nmcpndumjvpaztctibkn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tY3BuZHVtanZwYXp0Y3RpYmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODg4ODMsImV4cCI6MjA3Mzg2NDg4M30.vUZHF76bG8TTkxzEBYdjO2Tj4zqVtDkCXLeM4CTGbZE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
