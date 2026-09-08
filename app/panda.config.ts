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

  // Panda infrastructure only — no theme vocabulary. See
  // decisions/ADR-003-panda-token-vocabulary-ownership.md. Without this,
  // Panda silently auto-adds `@pandacss/preset-panda`, which ships its own
  // opinionated theme (a 26-family color palette, a 0–96 spacing scale, a
  // full type scale, etc.) merged in alongside Clara's primitives below.
  // `@pandacss/preset-base` alone still provides Panda's utilities,
  // conditions, and layout patterns (stack/hstack/grid/etc.) — none of
  // that is theme vocabulary, all of it is retained.
  presets: ["@pandacss/preset-base"],

  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  theme: {
    extend: {
      tokens: {
        colors: {
          neutral: {
            0: { value: "#ffffff" },
            // Added for Input (Vertical Slice 01, second Clara Knowledge
            // experiment): a resting border needs a value visible against
            // `neutral.0` without the harshness of `neutral.900`. No prior
            // component needed a third neutral stop — Button has no
            // border. Placeholder-quality value (same caveat as the Button
            // hover/pressed colors in docs/foundations/token-model.md):
            // not a validated contrast pair, just the smallest new
            // primitive this component's border demonstrably requires.
            300: { value: "#d4d4d4" },
            // Added for the Explorer entry surface's suggestion controls
            // (app/src/App.tsx): a real, mouse-clickable secondary control
            // (same category of demonstrated need as Button's hover/pressed
            // addition) needs a hover background distinct from both
            // `neutral.0` (resting) and `neutral.300` (border) — `300` is
            // already a mid-tone boundary color, too strong to reuse as a
            // subtle fill. Placeholder-quality value, same caveat as the
            // other neutral stops above.
            100: { value: "#f5f5f5" },
            900: { value: "#111111" },
          },
        },
        // Spacing primitives (Level 1) — see ADR-003 and
        // docs/foundations/token-model.md. Only the three values the
        // Slice 01 checkpoint actually demonstrates (App.tsx: container
        // gap/padding, button paddingX/paddingY). Resolved values match
        // what Panda's default preset previously supplied for these same
        // keys, so this is a vocabulary-ownership change, not a visual
        // one. Do not add more until a real surface need justifies it.
        spacing: {
          2: { value: "0.5rem" },
          4: { value: "1rem" },
          8: { value: "2rem" },
        },
        // Radius — migration requirement only, not a Clara radius model.
        // `md` is the single value the existing checkpoint's button
        // (`borderRadius: "md"`) depends on; without it, dropping
        // preset-panda leaves that utility unresolved and Panda emits
        // invalid CSS (`border-radius: md`) with no build error. See
        // ADR-003. A real radius scale is out of scope for this change.
        radii: {
          md: { value: "0.375rem" },
        },
        // Typography primitives (Level 1). A single neutral system font
        // stack — Clara has not approved a brand typeface, so this is a
        // placeholder in the same spirit as the neutral color primitives
        // above, not a font decision. Sizes/weights/line-heights are the
        // smallest scale that distinguishes the four roles Slice 01's
        // entry surface needs (heading, body, label, supporting text);
        // see docs/foundations/token-model.md.
        fonts: {
          sans: {
            value:
              "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          },
        },
        fontSizes: {
          sm: { value: "0.875rem" },
          md: { value: "1rem" },
          xl: { value: "1.5rem" },
        },
        fontWeights: {
          regular: { value: "400" },
          medium: { value: "500" },
          bold: { value: "700" },
        },
        lineHeights: {
          tight: { value: "1.2" },
          normal: { value: "1.5" },
        },
      },
      semanticTokens: {
        colors: {
          action: {
            // Core default: neutral, not a brand color. Every theme below
            // overrides this — the base value exists only so the token
            // is declared and typed before a theme is applied.
            primary: { value: "{colors.neutral.900}" },
            // Hover/pressed: added for the Button component. Named in
            // docs/foundations/token-model.md's Level 2 vocabulary but not
            // implemented until Button gave a real interactive element that
            // demonstrated the need (a clickable primary action needs mouse
            // feedback, not only the keyboard-only focus-visible ring). See
            // the "Button interaction states" decision in that document.
            primaryHover: { value: "{colors.neutral.900}" },
            primaryPressed: { value: "{colors.neutral.900}" },
            onPrimary: { value: "{colors.neutral.0}" },
          },
          focus: {
            ring: { value: "{colors.neutral.900}" },
          },
          // surface.* / border.* — added for Input, the first Clara
          // component that needs a container background and a resting
          // boundary. `token-model.md` documents a wider conceptual
          // Surface/Border/Text vocabulary (surface.subtle/raised,
          // border.subtle/strong, text.primary/secondary/muted/inverse);
          // only the two roles Input's own recipe actually consumes are
          // declared here. The rest remains undecided — do not treat this
          // as the full vocabulary being adopted. See
          // docs/knowledge/input.json for the reasoning, including why
          // `text.*` was deliberately NOT added in this pass.
          //
          // Declared once at Core level, not per-theme: a form field's
          // background/border are neutral UI chrome, not a brand-identity
          // role like `action.primary` — no need demonstrated yet for a
          // theme to override these.
          surface: {
            default: { value: "{colors.neutral.0}" },
            // `subtle` was already named conceptually in
            // docs/foundations/token-model.md's Level 2 vocabulary but left
            // unimplemented until a real interactive element demonstrated
            // the need — the Explorer entry surface's suggestion controls
            // (app/src/App.tsx), which are real secondary actions a mouse
            // user clicks and therefore need hover feedback, the same
            // reasoning already used for Button's hover/pressed tokens.
            // Declared once at Core level, matching `surface.default`: this
            // is neutral UI chrome, not a brand-identity role.
            subtle: { value: "{colors.neutral.100}" },
          },
          border: {
            default: { value: "{colors.neutral.300}" },
          },
        },
      },
      // Semantic typography roles (Level 2), implemented as Panda text
      // styles composed from the primitives above rather than as
      // semanticTokens — see docs/foundations/token-model.md, "Typography:
      // semantic styles, not only sizes", and the implementation decision
      // it left open. A text style bundles several CSS properties
      // (family/size/weight/line-height) as one named, atomic role;
      // components should consume `textStyle: "heading"` etc., never the
      // primitives directly. Declared once at Core level (not per theme):
      // Slice 01 has not demonstrated a need for per-theme typefaces, so
      // both themes resolve the same four roles identically. `display` is
      // deferred — the entry surface (docs/slices/01-intent-first-discovery.md)
      // only calls for heading, body, label, and supporting text.
      textStyles: {
        heading: {
          value: {
            fontFamily: "{fonts.sans}",
            fontSize: "{fontSizes.xl}",
            fontWeight: "{fontWeights.bold}",
            lineHeight: "{lineHeights.tight}",
          },
        },
        body: {
          value: {
            fontFamily: "{fonts.sans}",
            fontSize: "{fontSizes.md}",
            fontWeight: "{fontWeights.regular}",
            lineHeight: "{lineHeights.normal}",
          },
        },
        label: {
          value: {
            fontFamily: "{fonts.sans}",
            fontSize: "{fontSizes.sm}",
            fontWeight: "{fontWeights.medium}",
            lineHeight: "{lineHeights.normal}",
          },
        },
        supporting: {
          value: {
            fontFamily: "{fonts.sans}",
            fontSize: "{fontSizes.sm}",
            fontWeight: "{fontWeights.regular}",
            lineHeight: "{lineHeights.normal}",
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
            // Hover/pressed: accent darkened ~15% / ~30% (uniform RGB
            // scaling), same placeholder-quality methodology as the accent
            // values themselves — not a validated contrast pair. See the
            // Button interaction-states decision in
            // docs/foundations/token-model.md.
            primaryHover: { value: "#D08D1E" },
            primaryPressed: { value: "#AC7419" },
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
            primaryHover: { value: "#4D4DB6" },
            primaryPressed: { value: "#404096" },
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
