import type { ComponentPropsWithoutRef } from "react";
import { css, cx } from "../../styled-system/css";

// Clara's second real component (Vertical Slice 01). Scope and rationale
// are recorded as the structured Knowledge record at
// docs/knowledge/input.json — this file should stay in sync with that
// record, not duplicate its reasoning in comments here.
//
// Input narrows exactly one native prop: `type`. The approved component
// decision is a native <input type="text">, not a textarea — but forwarding
// `type` unrestricted (as originally implemented) let a consumer render
// <Input type="email" /> or type="password", contradicting that decision
// and leaving the executable contract unable to actually guarantee it.
// Omitting `type` closes that gap. This is a narrow, component-specific
// contract correction, not a general native-prop-forwarding policy — every
// other native <input> attribute, including style and the aria-label/
// aria-labelledby override, still passes through unrestricted; see
// input.json's knownLimitations for what that implies.
//
// This is a different narrowing than Button's: Button required `children`
// to guarantee an accessible-name source. Input has no content model, so
// no equivalent exists here — Clara has not yet decided whether an
// Input-shaped component should own label association at all (see
// input.json's `unresolved`). This implementation stays a bare native
// wrapper otherwise, leaving accessible-name composition (a
// `<label htmlFor>` paired with this input's `id`) to the consumer, the
// same way the current checkpoint (app/src/App.tsx) composes it.
export type InputProps = Omit<ComponentPropsWithoutRef<"input">, "type">;

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
