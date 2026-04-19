import type { SupabaseClient } from "@supabase/supabase-js";

export type LocationRow = {
  id: number;
  name: string;
  height: number | null;
};

export function getNextHeightAfterSession(
  currentHeightCm: number | null,
  averageBpm: number,
) {
  const safeCurrentHeight = currentHeightCm ?? 0;
  return safeCurrentHeight + Math.round(averageBpm);
}

export function applyHeightLocally(
  locations: LocationRow[],
  locationId: number,
  nextHeightCm: number,
) {
  return locations.map((location) =>
    location.id === locationId ? { ...location, height: nextHeightCm } : location,
  );
}

export async function persistLocationHeight(
  client: SupabaseClient,
  locationId: number,
  nextHeightCm: number,
) {
  const { error } = await client
    .from("locations")
    .update({ height: nextHeightCm })
    .eq("id", locationId);

  return { error };
}
