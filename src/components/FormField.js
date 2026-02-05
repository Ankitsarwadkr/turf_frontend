import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function FormField({ label, error, children }) {
    return (_jsxs("div", { className: "space-y-1 transition-all", children: [_jsx("label", { className: `
          block text-xs font-medium
          transition-colors
          ${error ? "text-danger" : "text-text-secondary"}
        `, children: label }), _jsx("div", { className: `
          transition-all
          ${error ? "ring-1 ring-danger rounded-xl" : ""}
        `, children: children }), _jsx("div", { className: `
          min-h-[14px]
          text-xs
          transition-all
          ${error ? "text-danger opacity-100" : "opacity-0"}
        `, children: error })] }));
}
