import { defineConfig } from "@pandacss/dev";

// Clara semantic theme contract vs. Panda theme mechanism: see
// decisions/ADR-002-theme-architecture-slice-01.md at the repo root.
//
// `theme.extend` below is Clara Core: it declares the semantic roles
// (action.primary, action.onPrimary, focus.ring) that Clara components
// consume, with neutral, non-brand placeholder values. Each entry under
// `themes` is a Panda implementation detail — it resolves those same
// roles to a distinct visual expression. Components must reference the
// semantic role names, never a theme name or a raw color value.
export default defineConfig({
  preflight: true,

  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  theme: {
    extend: {
      tokens: {
        colors: {
          neutral: {
            0: { value: "#ffffff" },
            900: { value: "#111111" },
          },
        },
      },
      semanticTokens: {
        colors: {
          action: {
            // Core default: neutral, not a brand color. Every theme below
            // overrides this — the base value exists only so the token
            // is declared and typed before a theme is applied.
            primary: { value: "{colors.neutral.900}" },
            onPrimary: { value: "{colors.neutral.0}" },
          },
          focus: {
            ring: { value: "{colors.neutral.900}" },
          },
        },
      },
    },
  },

  // Top-level and a sibling of `theme` — NOT nested inside it. Panda's
  // config type (`ThemeVariantsMap`) only recognizes `themes` at the root
  // of the config; nested under `theme.themes` it is silently ignored and
  // no theme conditions or artifacts are generated at all (confirmed by
  // inspecting @pandacss/types — see ADR-002's implementation note).
  //
  // Slice 01 theme names are deliberately neutral and temporary (see
  // ADR-002) — not brand names, not color names.
  themes: {
    explorer: {
      tokens: {
        colors: {
          accent: { value: "#F5A623" },
        },
      },
      semanticTokens: {
        colors: {
          action: {
            primary: { value: "{colors.accent}" },
            onPrimary: { value: "{colors.neutral.900}" },
          },
          focus: {
            ring: { value: "{colors.accent}" },
          },
        },
      },
    },
    alternate: {
      tokens: {
        colors: {
          accent: { value: "#5B5BD6" },
        },
      },
      semanticTokens: {
        colors: {
          action: {
            primary: { value: "{colors.accent}" },
            onPrimary: { value: "{colors.neutral.0}" },
          },
          focus: {
            ring: { value: "{colors.accent}" },
          },
        },
      },
    },
  },

  // Panda implementation detail (see ADR-002): declaring a theme under
  // `themes` above only makes it available as a JS module. Its CSS is
  // only emitted into the generated stylesheet if it is also listed here.
  staticCss: {
    themes: ["explorer", "alternate"],
  },

  outdir: "styled-system",
});
