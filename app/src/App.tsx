import { useState } from "react";
import { css } from "../styled-system/css";

// Slice 01 checkpoint only — not the Explorer UI. Proves that a single
// element can switch between two Panda themes at runtime while resolving
// the same Clara semantic roles, with no theme name or brand color
// referenced by the component itself. See ADR-002.
const THEME_NAMES = ["explorer", "alternate"] as const;
type ThemeName = (typeof THEME_NAMES)[number];

export function App() {
  const [theme, setTheme] = useState<ThemeName>("explorer");

  return (
    <div
      data-panda-theme={theme}
      className={css({
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4",
        padding: "8",
      })}
    >
      <p>Active theme: {theme}</p>

      {/* Typography checkpoint only — not the Explorer UI. Proves the four
          Slice 01 text styles (heading, body, label, supporting) render
          distinct, composed typography from Core-level primitives, with
          no per-theme override. See docs/foundations/token-model.md. */}
      <h1 className={css({ textStyle: "heading" })}>Heading text style</h1>
      <p className={css({ textStyle: "body" })}>
        Body text style — the default reading size for Slice 01 content.
      </p>
      <span className={css({ textStyle: "label" })}>Label text style</span>
      <p className={css({ textStyle: "supporting" })}>
        Supporting text style — smaller, for helper or secondary copy.
      </p>

      <button
        type="button"
        onClick={() =>
          setTheme((current) => (current === "explorer" ? "alternate" : "explorer"))
        }
        className={css({
          bg: "action.primary",
          color: "action.onPrimary",
          border: "none",
          borderRadius: "md",
          paddingX: "4",
          paddingY: "2",
          cursor: "pointer",
          _focusVisible: {
            outline: "2px solid",
            outlineColor: "focus.ring",
            outlineOffset: "2px",
          },
        })}
      >
        Sample element — toggle theme
      </button>
    </div>
  );
}
