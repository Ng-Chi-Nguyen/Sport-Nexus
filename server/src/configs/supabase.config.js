import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Lỗi: Không tìm thấy SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong môi trường.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };