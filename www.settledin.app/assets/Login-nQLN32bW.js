import { r as React } from "./0-react-core-B_ICaWIn.js";

const LoginPage = () =>
  React.createElement(
    "div",
    { className: "min-h-[100dvh] flex items-center justify-center p-6" },
    React.createElement(
      "div",
      { className: "max-w-md text-center space-y-3" },
      React.createElement("h1", { className: "text-2xl font-semibold" }, "Login Placeholder"),
      React.createElement(
        "p",
        { className: "text-sm text-gray-600" },
        "The original login chunk was not captured. Local demo auth should auto-sign you in."
      ),
      React.createElement("a", { className: "text-primary underline", href: "/home" }, "Go to Home")
    )
  );

export default LoginPage;
