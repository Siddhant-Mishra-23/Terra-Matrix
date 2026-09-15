import { createClient } from "@/lib/supabase/client";

/**
 * Automatically removes uploaded files from Supabase Storage 'media' bucket
 * when an associated training, project, conference, or team member is deleted.
 */
export async function deleteStorageFileIfUploaded(imageUrl?: string | null): Promise<void> {
  if (!imageUrl) return;

  try {
    const marker = "/storage/v1/object/public/media/";
    if (imageUrl.includes(marker)) {
      const filePath = decodeURIComponent(imageUrl.substring(imageUrl.indexOf(marker) + marker.length));
      if (filePath) {
        const supabase = createClient();
        const { error } = await supabase.storage.from("media").remove([filePath]);
        if (error) {
          console.warn(`[Storage Cleanup] Could not delete ${filePath}:`, error.message);
        } else {
          console.log(`[Storage Cleanup] Successfully removed orphaned image: ${filePath}`);
        }
      }
    }
  } catch (err) {
    console.warn("[Storage Cleanup] Non-fatal error during storage removal:", err);
  }
}
