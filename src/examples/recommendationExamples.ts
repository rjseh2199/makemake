import type { Recommendation } from "../contracts/agentTypes";

export const exampleDaily: Recommendation = {
  persona_mix: [
    { persona_id: "P03", weight: 0.6, reason: "Matches casual mood and palette." },
    { persona_id: "P07", weight: 0.4, reason: "Adds relaxed, easy movement." }
  ],
  cards: [
    {
      label: "Most Loved",
      outfit_items: {
        top: {
          id: "top-1",
          category: "top",
          color: "white",
          season: "all",
          condition: "good"
        },
        bottom: {
          id: "bottom-1",
          category: "bottom",
          color: "navy",
          season: "all",
          condition: "good"
        },
        shoes: {
          id: "shoes-1",
          category: "shoes",
          color: "white",
          season: "all",
          condition: "good"
        }
      },
      render_spec: {
        avatar_base_id: "base-01",
        avatar_gender: "female",
        avatar_proportion_params: { height_scale: 1, body_scale: 1 },
        outfit_description: "white top, navy bottom, white shoes",
        color_palette: ["white", "navy"],
        silhouette: "oversized",
        pose: "neutral_standing",
        background: "plain",
        image_data_url: "data:image/svg+xml;utf8,<svg></svg>"
      },
      ui_tags: ["comfortable", "familiar"]
    },
    {
      label: "Iconic",
      outfit_items: {
        top: {
          id: "top-1",
          category: "top",
          color: "white",
          season: "all",
          condition: "good"
        },
        bottom: {
          id: "bottom-1",
          category: "bottom",
          color: "navy",
          season: "all",
          condition: "good"
        },
        shoes: {
          id: "shoes-1",
          category: "shoes",
          color: "white",
          season: "all",
          condition: "good"
        }
      },
      render_spec: {
        avatar_base_id: "base-01",
        avatar_gender: "female",
        avatar_proportion_params: { height_scale: 1, body_scale: 1 },
        outfit_description: "white top, navy bottom, white shoes",
        color_palette: ["white", "navy"],
        silhouette: "oversized",
        pose: "neutral_standing",
        background: "plain",
        image_data_url: "data:image/svg+xml;utf8,<svg></svg>"
      },
      ui_tags: ["signature", "polished"]
    }
  ],
  purchase_suggestions: []
};

export const exampleWeekly: Recommendation = {
  persona_mix: [
    { persona_id: "P01", weight: 0.5, reason: "Clean palette for weekly needs." },
    { persona_id: "P06", weight: 0.5, reason: "Adds structure without discomfort." }
  ],
  cards: [
    {
      label: "Most Loved",
      outfit_items: {
        top: {
          id: "top-2",
          category: "top",
          color: "offwhite",
          season: "all",
          condition: "good"
        },
        bottom: {
          id: "bottom-2",
          category: "bottom",
          color: "charcoal",
          season: "all",
          condition: "good"
        },
        shoes: {
          id: "shoes-2",
          category: "shoes",
          color: "black",
          season: "all",
          condition: "good"
        }
      },
      render_spec: {
        avatar_base_id: "base-01",
        avatar_gender: "female",
        avatar_proportion_params: { height_scale: 1, body_scale: 1 },
        outfit_description: "offwhite top, charcoal bottom, black shoes",
        color_palette: ["offwhite", "charcoal", "black"],
        silhouette: "straight",
        pose: "neutral_standing",
        background: "plain",
        image_data_url: "data:image/svg+xml;utf8,<svg></svg>"
      },
      ui_tags: ["comfortable", "clean"]
    },
    {
      label: "Iconic",
      outfit_items: {
        top: {
          id: "top-2",
          category: "top",
          color: "offwhite",
          season: "all",
          condition: "good"
        },
        bottom: {
          id: "bottom-2",
          category: "bottom",
          color: "charcoal",
          season: "all",
          condition: "good"
        },
        shoes: {
          id: "shoes-2",
          category: "shoes",
          color: "black",
          season: "all",
          condition: "good"
        }
      },
      render_spec: {
        avatar_base_id: "base-01",
        avatar_gender: "female",
        avatar_proportion_params: { height_scale: 1, body_scale: 1 },
        outfit_description: "offwhite top, charcoal bottom, black shoes",
        color_palette: ["offwhite", "charcoal", "black"],
        silhouette: "classic_relaxed",
        pose: "neutral_standing",
        background: "plain",
        image_data_url: "data:image/svg+xml;utf8,<svg></svg>"
      },
      ui_tags: ["signature", "polished"]
    }
  ],
  purchase_suggestions: []
};

export const exampleQuiz: Recommendation = {
  persona_mix: [
    { persona_id: "P18", weight: 0.6, reason: "Neutral base with a single accent." },
    { persona_id: "P10", weight: 0.4, reason: "Soft, relaxed fit preference." }
  ],
  cards: [
    {
      label: "Most Loved",
      outfit_items: {
        top: {
          id: "top-3",
          category: "top",
          color: "gray",
          season: "all",
          condition: "good"
        },
        bottom: {
          id: "bottom-3",
          category: "bottom",
          color: "olive",
          season: "all",
          condition: "good"
        },
        shoes: {
          id: "shoes-3",
          category: "shoes",
          color: "white",
          season: "all",
          condition: "good"
        }
      },
      render_spec: {
        avatar_base_id: "base-01",
        avatar_gender: "non-binary",
        avatar_proportion_params: { height_scale: 1, body_scale: 1 },
        outfit_description: "gray top, olive bottom, white shoes",
        color_palette: ["gray", "olive", "white"],
        silhouette: "oversized",
        pose: "neutral_standing",
        background: "plain",
        image_data_url: "data:image/svg+xml;utf8,<svg></svg>"
      },
      ui_tags: ["comfortable", "clean"]
    },
    {
      label: "Iconic",
      outfit_items: {
        top: {
          id: "top-3",
          category: "top",
          color: "gray",
          season: "all",
          condition: "good"
        },
        bottom: {
          id: "bottom-3",
          category: "bottom",
          color: "olive",
          season: "all",
          condition: "good"
        },
        shoes: {
          id: "shoes-3",
          category: "shoes",
          color: "white",
          season: "all",
          condition: "good"
        }
      },
      render_spec: {
        avatar_base_id: "base-01",
        avatar_gender: "non-binary",
        avatar_proportion_params: { height_scale: 1, body_scale: 1 },
        outfit_description: "gray top, olive bottom, white shoes",
        color_palette: ["gray", "olive", "white"],
        silhouette: "relaxed",
        pose: "neutral_standing",
        background: "plain",
        image_data_url: "data:image/svg+xml;utf8,<svg></svg>"
      },
      ui_tags: ["signature", "polished"]
    }
  ],
  purchase_suggestions: []
};
