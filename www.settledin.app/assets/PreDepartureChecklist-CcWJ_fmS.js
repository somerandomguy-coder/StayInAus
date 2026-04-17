import { r as React } from "./0-react-core-B_ICaWIn.js";

const PreDepartureChecklist = () =>
  React.createElement(
    "div",
    { className: "min-h-[100dvh] flex items-center justify-center p-6" },
    React.createElement(
      "div",
      { className: "text-center space-y-2" },
      React.createElement("h1", { className: "text-2xl font-semibold" }, "Pre-departure Placeholder"),
      React.createElement(
        "p",
        { className: "text-sm text-gray-600" },
        "Captured bundle does not include this original route chunk."
      )
    )
  );

export default PreDepartureChecklist;
