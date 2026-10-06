/**
 * Static content layer — plants, services, locations, projects and plans are shipped as
 * JSON in /public/data and fetched at runtime. No backend, no database involved; the API
 * is only used for AI logic and lead email.
 */

import type { LocationPage, Plan, Plant, Project, Service } from "@/lib/types";

async function loadJson<T>(file: string): Promise<T> {
  const res = await fetch(`/data/${file}.json`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Could not load ${file}.json (${res.status})`);
  return (await res.json()) as T;
}

export const getPlants = () => loadJson<Plant[]>("plants");
export const getServices = () => loadJson<Service[]>("services");
export const getLocations = () => loadJson<LocationPage[]>("locations");
export const getProjects = () => loadJson<Project[]>("projects");
export const getPlans = () => loadJson<Plan[]>("plans");

export async function getService(slug: string): Promise<Service> {
  const found = (await getServices()).find((s) => s.slug === slug);
  if (!found) throw new Error("service not found");
  return found;
}

export async function getLocation(slug: string): Promise<LocationPage> {
  const found = (await getLocations()).find((l) => l.slug === slug);
  if (!found) throw new Error("location not found");
  return found;
}

export interface PlantFilters {
  category?: string;
  sunlight?: string;
  maintenance?: string;
  location?: string;
  search?: string;
}

/** Client-side filtering — mirrors what the old /api/plants query params did. */
export async function getFilteredPlants(filters: PlantFilters): Promise<Plant[]> {
  const all = await getPlants();
  const needle = filters.search?.trim().toLowerCase();
  return all.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.sunlight && p.sunlight !== filters.sunlight) return false;
    if (filters.maintenance && p.maintenance !== filters.maintenance) return false;
    if (filters.location && !p.locations.includes(filters.location)) return false;
    if (needle && !p.name.toLowerCase().includes(needle)) return false;
    return true;
  });
}
