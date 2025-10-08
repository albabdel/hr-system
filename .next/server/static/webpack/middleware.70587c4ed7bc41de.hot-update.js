"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("middleware",{

/***/ "(middleware)/./middleware.ts":
/*!***********************!*\
  !*** ./middleware.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   middleware: () => (/* binding */ middleware)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/esm/api/server.js\");\n\n// This middleware allows all requests to pass through, effectively disabling authentication.\nfunction middleware(req) {\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next();\n}\nconst config = {\n    matcher: [\n        /*\n     * Match all request paths except for the ones starting with:\n     * - api (API routes)\n     * - _next/static (static files)\n     * - _next/image (image optimization files)\n     * - favicon.ico (favicon file)\n     * - careers (public careers page)\n     */ \"/((?!api|_next/static|_next/image|favicon.ico|careers).*)\"\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbWlkZGxld2FyZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBMkM7QUFHM0MsNkZBQTZGO0FBQ3RGLFNBQVNDLFdBQVdDLEdBQWdCO0lBQ3pDLE9BQU9GLHFEQUFZQSxDQUFDRyxJQUFJO0FBQzFCO0FBRU8sTUFBTUMsU0FBUztJQUNwQkMsU0FBUztRQUNQOzs7Ozs7O0tBT0MsR0FDRDtLQUNEO0FBQ0gsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9taWRkbGV3YXJlLnRzPzQyMmQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IHR5cGUgeyBOZXh0UmVxdWVzdCB9IGZyb20gJ25leHQvc2VydmVyJztcblxuLy8gVGhpcyBtaWRkbGV3YXJlIGFsbG93cyBhbGwgcmVxdWVzdHMgdG8gcGFzcyB0aHJvdWdoLCBlZmZlY3RpdmVseSBkaXNhYmxpbmcgYXV0aGVudGljYXRpb24uXG5leHBvcnQgZnVuY3Rpb24gbWlkZGxld2FyZShyZXE6IE5leHRSZXF1ZXN0KSB7XG4gIHJldHVybiBOZXh0UmVzcG9uc2UubmV4dCgpO1xufVxuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBtYXRjaGVyOiBbXG4gICAgLypcbiAgICAgKiBNYXRjaCBhbGwgcmVxdWVzdCBwYXRocyBleGNlcHQgZm9yIHRoZSBvbmVzIHN0YXJ0aW5nIHdpdGg6XG4gICAgICogLSBhcGkgKEFQSSByb3V0ZXMpXG4gICAgICogLSBfbmV4dC9zdGF0aWMgKHN0YXRpYyBmaWxlcylcbiAgICAgKiAtIF9uZXh0L2ltYWdlIChpbWFnZSBvcHRpbWl6YXRpb24gZmlsZXMpXG4gICAgICogLSBmYXZpY29uLmljbyAoZmF2aWNvbiBmaWxlKVxuICAgICAqIC0gY2FyZWVycyAocHVibGljIGNhcmVlcnMgcGFnZSlcbiAgICAgKi9cbiAgICAnLygoPyFhcGl8X25leHQvc3RhdGljfF9uZXh0L2ltYWdlfGZhdmljb24uaWNvfGNhcmVlcnMpLiopJyxcbiAgXSxcbn07XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwibWlkZGxld2FyZSIsInJlcSIsIm5leHQiLCJjb25maWciLCJtYXRjaGVyIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./middleware.ts\n");

/***/ })

});