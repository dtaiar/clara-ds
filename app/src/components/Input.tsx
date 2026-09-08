import type { ComponentPropsWithoutRef } from "react";
import { css, cx } from "../../styled-system/css";

// Clara's second real component (Vertical Slice 01). Scope and rationale
// are recorded as the structured Knowledge record at
// docs/knowledge/input.json — this file should stay in sync with that
// record, not duplicate its reasoning in comments here.
//
// Unlike Button, Input does NOT narrow or add any prop. Button's
// accessible name came for free from a required `children` prop; an
// `<input>` has no content model, so there is no equivalent guarantee
// this component can make on its own. Clara has not yet decided whether
// an Input-shaped component should own label association (see
// input.json's `unresolved`) — so this implementation deliberately stays
// a bare native wrapper and leaves accessible-name composition (a
// `<label htmlFor>` paired with this input's `id`) to the consumer, the
// same way the current checkpoint (app/src/App.tsx) composes it.
export type InputProps = ComponentPropsWithoutRef<"input">;

const inputStyle = css({
  textStyle: "body",
  display: "inline-block",
  bg: "surface.default",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "md",
  paddingX: "4",
  paddingY: "2",
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "focus.ring",
    outlineOffset: "2px",
  },
});

export function Input({ className, ...props }: InputProps) {
  return <input type="text" {...props} className={cx(inputStyle, className)} />;
}
