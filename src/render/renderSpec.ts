import type { BodyProfile, GenderCategory, RenderSpec, Silhouette, WardrobeItem } from "../contracts/agentTypes";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const buildOutfitDescription = (items: WardrobeItem[]) =>
  items
    .map((item) => {
      const parts = [item.color, item.subcategory ?? item.category];
      return parts.filter(Boolean).join(" ");
    })
    .join(", ");

const buildPalette = (items: WardrobeItem[]) =>
  Array.from(new Set(items.map((item) => item.color))).slice(0, 4);

const buildImageDataUrl = (description: string) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640">
  <rect width="100%" height="100%" fill="#f5f5f5"/>
  <rect x="140" y="80" width="200" height="360" rx="24" fill="#d9d9d9" />
  <circle cx="240" cy="60" r="40" fill="#cfcfcf" />
  <text x="50%" y="500" font-size="18" text-anchor="middle" fill="#333" font-family="Arial, sans-serif">${description}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const buildRenderSpec = (params: {
  items: WardrobeItem[];
  avatarGender: GenderCategory;
  silhouette: Silhouette;
  bodyProfile?: BodyProfile;
}): RenderSpec => {
  const heightScale = params.bodyProfile?.height_cm
    ? clamp(params.bodyProfile.height_cm / 170, 0.9, 1.1)
    : 1;
  const bodyScale = params.bodyProfile?.weight_kg
    ? clamp(params.bodyProfile.weight_kg / 65, 0.85, 1.15)
    : 1;
  const description = buildOutfitDescription(params.items);
  const palette = buildPalette(params.items);

  return {
    avatar_base_id: "base-01",
    avatar_gender: params.avatarGender,
    avatar_proportion_params: {
      height_scale: Number(heightScale.toFixed(2)),
      body_scale: Number(bodyScale.toFixed(2))
    },
    outfit_description: description,
    color_palette: palette,
    silhouette: params.silhouette,
    pose: "neutral_standing",
    background: "plain",
    image_data_url: buildImageDataUrl(description)
  };
};
