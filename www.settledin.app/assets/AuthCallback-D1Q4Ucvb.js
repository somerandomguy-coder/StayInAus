import { r as React } from "./0-react-core-B_ICaWIn.js";

const AuthCallback = () =>
  React.createElement(
    "div",
    { className: "min-h-[100dvh] flex items-center justify-center p-6" },
    React.createElement(
      "div",
      { className: "text-center space-y-2" },
      React.createElement("h1", { className: "text-2xl font-semibold" }, "Auth Callback Placeholder"),
      React.createElement("p", { className: "text-sm text-gray-600" }, "Redirecting to home..."),
      React.createElement("script", {
        dangerouslySetInnerHTML: {
          __html: "setTimeout(function(){ window.location.replace('/home'); }, 50);",
        },
      })
    )
  );

export default AuthCallback;
