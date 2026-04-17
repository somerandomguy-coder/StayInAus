import { j as e } from "./0-react-core-B_ICaWIn.js";

const JourneyChart = ({ title = "Journey" }) =>
  e.jsxs("div", {
    className: "w-full rounded-xl border border-gray-200 bg-white p-4",
    children: [
      e.jsx("div", { className: "text-sm font-semibold text-gray-900 mb-2", children: title }),
      e.jsx("div", {
        className: "h-24 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 border border-gray-100 flex items-center justify-center text-xs text-gray-500",
        children: "Journey chart is available in local demo mode.",
      }),
    ],
  });

export default JourneyChart;
