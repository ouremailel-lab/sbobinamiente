// Configurazione Supabase
// Le credenziali sono state configurate automaticamente

const SUPABASE_URL = 'https://kmfjswmlwgglytktynzp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZmpzd21sd2dnbHl0a3R5bnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDQ3NDgsImV4cCI6MjA4MDcyMDc0OH0.vJrV-0eUZkpwZ_VCZwLG2lT7XnJq1f68oriCiiNrUjE';

// Inizializza client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export per uso in altri file
window.supabaseClient = supabase;
