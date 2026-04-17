import { j as e } from "./0-react-core-B_ICaWIn.js";

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function daysBetween(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

const CourseProgressWidget = ({
  courseStartDate,
  courseEndDate,
  visaType,
  variant = "default",
  showTitle = true,
}) => {
  const start = toDate(courseStartDate);
  const end = toDate(courseEndDate);
  const now = new Date();

  let percent = 0;
  let status = "Course not set";

  if (start && end) {
    const total = Math.max(1, daysBetween(start, end));
    const elapsed = clamp(daysBetween(start, now), 0, total);
    percent = Math.round((elapsed / total) * 100);

    if (now < start) {
      status = "Not started";
    } else if (now > end) {
      status = "Completed";
    } else {
      status = "In progress";
    }
  }

  const compact = variant === "compact";
  const containerClass = compact
    ? "w-full rounded-lg border border-gray-200 bg-white p-3"
    : "w-full rounded-xl border border-gray-200 bg-white p-4";

  return e.jsxs("div", {
    className: containerClass,
    children: [
      showTitle && e.jsx("div", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Course Progress" }),
      e.jsxs("div", {
        className: "flex items-center justify-between text-xs text-gray-600 mb-2",
        children: [e.jsx("span", { children: status }), e.jsxs("span", { children: [percent, "%"] })],
      }),
      e.jsx("div", {
        className: "h-2 w-full rounded-full bg-gray-200 overflow-hidden",
        children: e.jsx("div", {
          className: "h-full rounded-full bg-indigo-500 transition-all duration-500",
          style: { width: `${percent}%` },
        }),
      }),
      visaType
        ? e.jsxs("div", {
            className: "mt-2 text-[11px] text-gray-500",
            children: ["Visa subclass: ", String(visaType)],
          })
        : null,
    ],
  });
};

export default CourseProgressWidget;
