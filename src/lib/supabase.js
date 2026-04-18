import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/** Upload une video, retourne la signed URL (1h) */
export async function uploadVideo(file, sessionId) {
  const ext  = file.name.split(".").pop();
  const path = `${sessionId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("videos")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  const { data } = await supabase.storage
    .from("videos")
    .createSignedUrl(path, 3600);
  return data.signedUrl;
}