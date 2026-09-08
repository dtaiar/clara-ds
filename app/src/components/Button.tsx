import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { css, cx } from "../../styled-system/css";

// Clara's first real component (Vertical Slice 01). Scope and rationale are
// recorded as the structured Knowledge record at docs/knowledge/button.json
// — this file should stay in sync with that record, not duplicate its
// reasoning in comments here.
//
// `children` is narrowed to required: the approved scope is a visible
// text-label Button, and native <button> otherwise permits an empty/
// label-less button, which is out of scope (no icon-only usage). Every
// other native <button> attribute — including style, aria-label, and
// aria-labelledby — still passes through unrestricted; see button.json's
// knownLimitations for what that implies.
export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode;
};

const buttonStyle = css({
  textStyle: "label",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "action.primary",
  color: "action.onPrimary",
  border: "none",
  borderRadius: "md",
  paddingX: "4",
  paddingY: "2",
  cursor: "pointer",
  _hover: {
    bg: "action.primaryHover",
  },
  _active: {
    bg: "action.primaryPressed",
  },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "focus.ring",
    outlineOffset: "2px",
  },
});

export function Button({ className, ...props }: ButtonProps) {
  return <button type="button" {...props} className={cx(buttonStyle, className)} />;
}
