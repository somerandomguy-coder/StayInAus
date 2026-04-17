import { r as React } from "./0-react-core-B_ICaWIn.js";

const SettleInLogo = (props = {}) =>
  React.createElement(
    "span",
    {
      ...props,
      style: {
        fontWeight: 700,
        letterSpacing: "0.02em",
        ...(props.style || {}),
      },
    },
    "Settledin"
  );

export { SettleInLogo, SettleInLogo as S, SettleInLogo as default };
