import type { Persona, PersonaRaw, Silhouette } from "../contracts/agentTypes";

const SILHOUETTE_MAP: Record<string, "slim" | "straight" | "oversized" | "mixed"> = {
  slim: "slim",
  straight: "straight",
  oversized: "oversized",
  mixed: "mixed",
  tailored: "straight",
  structured: "straight",
  classic_relaxed: "mixed",
  relaxed: "mixed",
  fluid: "mixed",
  workwear: "straight",
  precise: "straight",
  light_relaxed: "mixed",
  comfortable_clean: "straight",
  classic: "straight"
};

const FOOTWEAR_MAP: Record<
  string,
  "loafers" | "derbies" | "sneakers" | "boots" | "heels" | "sandals"
> = {
  loafers: "loafers",
  derbies: "derbies",
  sneakers: "sneakers",
  boots: "boots",
  heels: "heels",
  sandals: "sandals",
  ankle_boots: "boots",
  minimal_sneakers: "sneakers",
  clogs: "loafers",
  slip_on: "sneakers",
  slip_ons: "sneakers",
  flats: "loafers"
};

const FABRICS_MAP: Record<
  string,
  "wool" | "linen" | "denim" | "tech" | "leather" | "cotton" | "silk"
> = {
  wool: "wool",
  linen: "linen",
  denim: "denim",
  tech: "tech",
  leather: "leather",
  cotton: "cotton",
  silk: "silk",
  cashmere: "wool",
  organic_cotton: "cotton",
  satin: "silk",
  tropical_wool: "wool",
  light_wool: "wool",
  tweed: "wool",
  canvas: "cotton",
  knit: "cotton",
  stretch_wool: "wool"
};

const CLIMATE_MAP: Record<string, "cold" | "temperate" | "hot" | "humid" | "dry"> = {
  cold: "cold",
  temperate: "temperate",
  hot: "hot",
  humid: "humid",
  dry: "dry",
  warm: "hot"
};

const GENDER_MAP: Record<string, "male" | "female" | "non-binary"> = {
  male: "male",
  female: "female",
  "non-binary": "non-binary",
  nonbinary: "non-binary",
  "non binary": "non-binary"
};

const normalizeList = (items?: string[]): string[] =>
  (items ?? []).map((item) => item.trim()).filter(Boolean);

const normalizeFootwear = (items?: string[]) =>
  normalizeList(items)
    .map((item) => FOOTWEAR_MAP[item] ?? "sneakers")
    .filter(Boolean);

const normalizeFabrics = (items?: string[]) =>
  normalizeList(items)
    .map((item) => FABRICS_MAP[item] ?? "cotton")
    .filter(Boolean);

export const normalizePersona = (raw: PersonaRaw): Persona => {
  const genderKey = raw.gender_category.toLowerCase();
  const climateKey = raw.climate_type.toLowerCase();
  const silhouetteValue = raw.silhouette as Silhouette;
  const cityCulture = raw.city_culture ?? raw.culture_label ?? "";

  return {
    id: raw.id,
    name: raw.name,
    age: raw.age,
    gender_category: GENDER_MAP[genderKey] ?? "non-binary",
    occupation: raw.occupation,
    city_culture: cityCulture,
    climate_type: CLIMATE_MAP[climateKey] ?? "temperate",
    mobility_level: raw.mobility_level,
    dresscode_level: raw.dresscode_level,
    palette: raw.palette,
    silhouette: silhouetteValue,
    signature_items: raw.signature_items,
    avoid_rules: raw.avoid_rules,
    fabrics_bias: normalizeList(raw.fabrics_bias),
    footwear_bias: normalizeList(raw.footwear_bias),
    normalized: {
      silhouette: SILHOUETTE_MAP[silhouetteValue] ?? "mixed",
      footwear_bias: normalizeFootwear(raw.footwear_bias),
      fabrics_bias: normalizeFabrics(raw.fabrics_bias)
    }
  };
};

export const rawPersonas: PersonaRaw[] = [
  {
    id: "P01",
    name: "Paris Minimal PR",
    age: 29,
    gender_category: "female",
    occupation: "PR Manager",
    city_culture: "Paris",
    climate_type: "temperate",
    mobility_level: "medium",
    dresscode_level: 2,
    palette: {
      base: ["black", "navy", "offwhite"],
      accent: ["camel"]
    },
    silhouette: "straight",
    signature_items: ["trench_coat", "silk_scarf", "loafers"],
    avoid_rules: ["heavy_logos", "overly_trendy_items", "neon_colors"],
    fabrics_bias: ["wool", "cotton", "silk"],
    footwear_bias: ["loafers", "ankle_boots"]
  },
  {
    id: "P02",
    name: "Milan Tailoring MD",
    age: 34,
    gender_category: "male",
    occupation: "Fashion MD",
    city_culture: "Milan",
    climate_type: "temperate",
    mobility_level: "low",
    dresscode_level: 3,
    palette: {
      base: ["brown", "cream", "navy"],
      accent: ["dark_green"]
    },
    silhouette: "tailored",
    signature_items: ["double_breasted_jacket", "knit_polo", "chelsea_boots"],
    avoid_rules: ["cheap_synthetics", "poor_fit", "sporty_sneakers"],
    fabrics_bias: ["wool", "cashmere"],
    footwear_bias: ["chelsea_boots", "derbies"]
  },
  {
    id: "P03",
    name: "Seoul Trend Creator",
    age: 26,
    gender_category: "female",
    occupation: "Content Creator",
    city_culture: "Seoul",
    climate_type: "temperate",
    mobility_level: "high",
    dresscode_level: 1,
    palette: {
      base: ["gray", "offwhite"],
      accent: ["seasonal_bright"]
    },
    silhouette: "oversized",
    signature_items: ["cropped_jacket", "wide_pants", "sneakers"],
    avoid_rules: ["formal_shoes", "rigid_suiting", "monotone_only"],
    fabrics_bias: ["denim", "cotton"],
    footwear_bias: ["sneakers"]
  },
  {
    id: "P04",
    name: "Tokyo Product Designer",
    age: 31,
    gender_category: "male",
    occupation: "Product Designer",
    city_culture: "Tokyo",
    climate_type: "humid",
    mobility_level: "high",
    dresscode_level: 1,
    palette: {
      base: ["charcoal", "navy", "khaki"],
      accent: []
    },
    silhouette: "relaxed",
    signature_items: ["tech_jacket", "wide_slacks", "minimal_sneakers"],
    avoid_rules: ["bright_colors", "tight_fit", "decorative_details"],
    fabrics_bias: ["tech", "light_wool"],
    footwear_bias: ["minimal_sneakers"]
  },
  {
    id: "P05",
    name: "NYC Power Lawyer",
    age: 41,
    gender_category: "female",
    occupation: "Lawyer",
    city_culture: "New York",
    climate_type: "cold",
    mobility_level: "medium",
    dresscode_level: 3,
    palette: {
      base: ["black", "offwhite"],
      accent: ["burgundy"]
    },
    silhouette: "structured",
    signature_items: ["sharp_blazer", "midi_skirt", "classic_heels"],
    avoid_rules: ["casual_denim", "oversized_fit", "flat_sneakers"],
    fabrics_bias: ["wool", "silk"],
    footwear_bias: ["heels", "loafers"]
  },
  {
    id: "P06",
    name: "London Creative Director",
    age: 38,
    gender_category: "male",
    occupation: "Creative Director",
    city_culture: "London",
    climate_type: "cold",
    mobility_level: "medium",
    dresscode_level: 2,
    palette: {
      base: ["navy", "gray"],
      accent: ["check_pattern"]
    },
    silhouette: "classic_relaxed",
    signature_items: ["check_coat", "turtleneck", "leather_shoes"],
    avoid_rules: ["athleisure", "cheap_patterns", "overbranding"],
    fabrics_bias: ["wool", "tweed"],
    footwear_bias: ["derbies", "boots"]
  },
  {
    id: "P07",
    name: "LA Indie Musician",
    age: 24,
    gender_category: "male",
    occupation: "Musician",
    city_culture: "Los Angeles",
    climate_type: "dry",
    mobility_level: "medium",
    dresscode_level: 0,
    palette: {
      base: ["indigo", "offwhite", "brown"],
      accent: []
    },
    silhouette: "relaxed",
    signature_items: ["denim_jacket", "graphic_tee", "work_boots"],
    avoid_rules: ["formal_suiting", "polished_shoes", "slick_fabrics"],
    fabrics_bias: ["denim", "cotton"],
    footwear_bias: ["boots", "canvas_sneakers"]
  },
  {
    id: "P08",
    name: "Barcelona Architect",
    age: 27,
    gender_category: "female",
    occupation: "Architect",
    city_culture: "Barcelona",
    climate_type: "hot",
    mobility_level: "high",
    dresscode_level: 1,
    palette: {
      base: ["white", "beige", "black"],
      accent: []
    },
    silhouette: "straight",
    signature_items: ["boxy_shirt", "wide_slacks", "mules"],
    avoid_rules: ["ornate_details", "loud_patterns", "tight_fit"],
    fabrics_bias: ["cotton", "linen"],
    footwear_bias: ["loafers", "mules"]
  },
  {
    id: "P09",
    name: "Berlin Art Curator",
    age: 35,
    gender_category: "male",
    occupation: "Art Curator",
    city_culture: "Berlin",
    climate_type: "cold",
    mobility_level: "medium",
    dresscode_level: 1,
    palette: {
      base: ["black", "charcoal"],
      accent: []
    },
    silhouette: "oversized",
    signature_items: ["long_coat", "wide_pants", "derby_shoes"],
    avoid_rules: ["bright_colors", "sporty_items", "short_outerwear"],
    fabrics_bias: ["wool"],
    footwear_bias: ["derbies"]
  },
  {
    id: "P10",
    name: "Copenhagen Sustainable Buyer",
    age: 30,
    gender_category: "female",
    occupation: "Fashion Buyer",
    city_culture: "Copenhagen",
    climate_type: "cold",
    mobility_level: "medium",
    dresscode_level: 1,
    palette: {
      base: ["oatmeal", "brown", "olive"],
      accent: []
    },
    silhouette: "relaxed",
    signature_items: ["wool_cardigan", "straight_pants", "clogs"],
    avoid_rules: ["synthetic_shine", "tight_fit", "high_heels"],
    fabrics_bias: ["wool", "organic_cotton"],
    footwear_bias: ["clogs", "loafers"]
  },
  {
    id: "P11",
    name: "Dubai Glam Marketer",
    age: 28,
    gender_category: "female",
    occupation: "Marketing Manager",
    city_culture: "Dubai",
    climate_type: "hot",
    mobility_level: "low",
    dresscode_level: 2,
    palette: {
      base: ["black", "nude"],
      accent: ["gold"]
    },
    silhouette: "fluid",
    signature_items: ["satin_set", "statement_jewelry", "heels"],
    avoid_rules: ["casual_fabrics", "sporty_shoes", "muted_only"],
    fabrics_bias: ["satin", "silk"],
    footwear_bias: ["heels"]
  },
  {
    id: "P12",
    name: "Singapore Finance Professional",
    age: 33,
    gender_category: "male",
    occupation: "Investment Banker",
    city_culture: "Singapore",
    climate_type: "humid",
    mobility_level: "low",
    dresscode_level: 3,
    palette: {
      base: ["navy", "gray", "white"],
      accent: []
    },
    silhouette: "tailored",
    signature_items: ["light_suit", "knit_top", "loafers"],
    avoid_rules: ["heavy_fabrics", "dark_black", "boots"],
    fabrics_bias: ["tropical_wool"],
    footwear_bias: ["loafers"]
  },
  {
    id: "P13",
    name: "Bangkok Campus Style",
    age: 22,
    gender_category: "female",
    occupation: "Student",
    city_culture: "Bangkok",
    climate_type: "hot",
    mobility_level: "high",
    dresscode_level: 0,
    palette: {
      base: ["white"],
      accent: ["pastel"]
    },
    silhouette: "light_relaxed",
    signature_items: ["crop_top", "pleated_skirt", "sandals"],
    avoid_rules: ["dark_layers", "heavy_denim", "formal_shoes"],
    fabrics_bias: ["cotton"],
    footwear_bias: ["sandals", "sneakers"]
  },
  {
    id: "P14",
    name: "Zurich Quiet Luxury Consultant",
    age: 45,
    gender_category: "male",
    occupation: "Consultant",
    city_culture: "Zurich",
    climate_type: "cold",
    mobility_level: "low",
    dresscode_level: 3,
    palette: {
      base: ["navy", "gray", "cream"],
      accent: []
    },
    silhouette: "precise",
    signature_items: ["cashmere_knit", "wool_slacks", "luxury_sneakers"],
    avoid_rules: ["logos", "flashy_colors", "cheap_shoes"],
    fabrics_bias: ["cashmere", "wool"],
    footwear_bias: ["minimal_sneakers", "loafers"]
  },
  {
    id: "P15",
    name: "Sydney Surf Startup",
    age: 29,
    gender_category: "male",
    occupation: "Startup Operator",
    city_culture: "Sydney",
    climate_type: "hot",
    mobility_level: "high",
    dresscode_level: 0,
    palette: {
      base: ["sand", "offwhite"],
      accent: ["sky_blue"]
    },
    silhouette: "relaxed",
    signature_items: ["linen_shirt", "shorts", "slip_on"],
    avoid_rules: ["formal_suiting", "dark_heavy_colors", "leather_shoes"],
    fabrics_bias: ["linen", "cotton"],
    footwear_bias: ["slip_ons", "sandals"]
  },
  {
    id: "P16",
    name: "Mumbai Startup Founder",
    age: 37,
    gender_category: "female",
    occupation: "Startup Founder",
    city_culture: "Mumbai",
    climate_type: "hot",
    mobility_level: "medium",
    dresscode_level: 1,
    palette: {
      base: ["neutral"],
      accent: ["jewel_tone"]
    },
    silhouette: "fluid",
    signature_items: ["long_shirt", "wide_pants", "flats"],
    avoid_rules: ["tight_fit", "synthetic_heat_trap", "dark_layers"],
    fabrics_bias: ["cotton", "linen"],
    footwear_bias: ["flats"]
  },
  {
    id: "P17",
    name: "Mexico City Chef",
    age: 32,
    gender_category: "male",
    occupation: "Chef",
    city_culture: "Mexico City",
    climate_type: "temperate",
    mobility_level: "high",
    dresscode_level: 0,
    palette: {
      base: ["olive", "brown", "offwhite"],
      accent: []
    },
    silhouette: "workwear",
    signature_items: ["canvas_jacket", "work_pants", "boots"],
    avoid_rules: ["fragile_fabrics", "formal_shoes", "slim_fit"],
    fabrics_bias: ["canvas", "denim"],
    footwear_bias: ["boots"]
  },
  {
    id: "P18",
    name: "Amsterdam UX Designer",
    age: 26,
    gender_category: "non-binary",
    occupation: "UX Designer",
    city_culture: "Amsterdam",
    climate_type: "cold",
    mobility_level: "high",
    dresscode_level: 1,
    palette: {
      base: ["monotone"],
      accent: ["single_bright"]
    },
    silhouette: "oversized",
    signature_items: ["overshirt", "wide_pants", "minimal_loafers"],
    avoid_rules: ["gendered_styling", "tight_fit", "excessive_accessories"],
    fabrics_bias: ["cotton", "wool"],
    footwear_bias: ["loafers"]
  },
  {
    id: "P19",
    name: "Toronto Tech PM",
    age: 40,
    gender_category: "female",
    occupation: "Product Manager",
    city_culture: "Toronto",
    climate_type: "cold",
    mobility_level: "medium",
    dresscode_level: 1,
    palette: {
      base: ["navy", "gray", "offwhite"],
      accent: []
    },
    silhouette: "comfortable_clean",
    signature_items: ["knit_layer", "stretch_slacks", "clean_sneakers"],
    avoid_rules: ["stiff_suiting", "high_heels", "complex_layers"],
    fabrics_bias: ["knit", "stretch_wool"],
    footwear_bias: ["sneakers", "loafers"]
  },
  {
    id: "P20",
    name: "Rome Hotel Host",
    age: 55,
    gender_category: "male",
    occupation: "Hotel Owner",
    city_culture: "Rome",
    climate_type: "temperate",
    mobility_level: "low",
    dresscode_level: 2,
    palette: {
      base: ["navy", "brown", "offwhite"],
      accent: []
    },
    silhouette: "classic",
    signature_items: ["knit_jacket", "tailored_shirt", "loafers"],
    avoid_rules: ["sporty_items", "synthetic_fabrics", "casual_shorts"],
    fabrics_bias: ["wool", "cotton"],
    footwear_bias: ["loafers"]
  }
];

export const personas: Persona[] = rawPersonas.map(normalizePersona);
