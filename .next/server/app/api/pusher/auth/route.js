"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/pusher/auth/route";
exports.ids = ["app/api/pusher/auth/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("net");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("process");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:buffer");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:fs");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:http");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("node:https");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:net");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("node:process");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("node:stream/web");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:util");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpusher%2Fauth%2Froute&page=%2Fapi%2Fpusher%2Fauth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpusher%2Fauth%2Froute.ts&appDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpusher%2Fauth%2Froute&page=%2Fapi%2Fpusher%2Fauth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpusher%2Fauth%2Froute.ts&appDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_fattouh999_Documents_GitHub_New_folder_src_app_api_pusher_auth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/pusher/auth/route.ts */ \"(rsc)/./src/app/api/pusher/auth/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/pusher/auth/route\",\n        pathname: \"/api/pusher/auth\",\n        filename: \"route\",\n        bundlePath: \"app/api/pusher/auth/route\"\n    },\n    resolvedPagePath: \"/Users/fattouh999/Documents/GitHub/New-folder/src/app/api/pusher/auth/route.ts\",\n    nextConfigOutput,\n    userland: _Users_fattouh999_Documents_GitHub_New_folder_src_app_api_pusher_auth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/pusher/auth/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZwdXNoZXIlMkZhdXRoJTJGcm91dGUmcGFnZT0lMkZhcGklMkZwdXNoZXIlMkZhdXRoJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGcHVzaGVyJTJGYXV0aCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmZhdHRvdWg5OTklMkZEb2N1bWVudHMlMkZHaXRIdWIlMkZOZXctZm9sZGVyJTJGc3JjJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmZhdHRvdWg5OTklMkZEb2N1bWVudHMlMkZHaXRIdWIlMkZOZXctZm9sZGVyJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PXN0YW5kYWxvbmUmcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDOEI7QUFDM0c7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9icmllZi1zdXBwb3J0Lz84MDdmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9mYXR0b3VoOTk5L0RvY3VtZW50cy9HaXRIdWIvTmV3LWZvbGRlci9zcmMvYXBwL2FwaS9wdXNoZXIvYXV0aC9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJzdGFuZGFsb25lXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3B1c2hlci9hdXRoL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvcHVzaGVyL2F1dGhcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3B1c2hlci9hdXRoL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL1VzZXJzL2ZhdHRvdWg5OTkvRG9jdW1lbnRzL0dpdEh1Yi9OZXctZm9sZGVyL3NyYy9hcHAvYXBpL3B1c2hlci9hdXRoL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9wdXNoZXIvYXV0aC9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpusher%2Fauth%2Froute&page=%2Fapi%2Fpusher%2Fauth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpusher%2Fauth%2Froute.ts&appDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/pusher/auth/route.ts":
/*!******************************************!*\
  !*** ./src/app/api/pusher/auth/route.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   OPTIONS: () => (/* binding */ OPTIONS),\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var _lib_pusher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/pusher */ \"(rsc)/./src/lib/pusher.ts\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @clerk/nextjs/server */ \"(rsc)/./node_modules/@clerk/nextjs/dist/esm/app-router/server/auth.js\");\n/* harmony import */ var _clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @clerk/nextjs/server */ \"(rsc)/./node_modules/@clerk/nextjs/dist/esm/app-router/server/currentUser.js\");\n\n\n\n// Explicitly set the runtime to nodejs\nconst runtime = \"nodejs\";\nasync function POST(request) {\n    try {\n        // Get the current user session\n        const session = await (0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_2__.auth)();\n        const user = await (0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_3__.currentUser)();\n        // Get the socket_id and channel_name from the request\n        // Pusher sends data as application/x-www-form-urlencoded, not JSON\n        const contentType = request.headers.get(\"content-type\") || \"\";\n        let socket_id = null;\n        let channel_name = null;\n        if (contentType.includes(\"application/json\")) {\n            // Handle JSON format (for testing/future compatibility)\n            const data = await request.json();\n            socket_id = data.socket_id;\n            channel_name = data.channel_name;\n        } else {\n            // Handle form data format (what Pusher actually sends)\n            const formData = await request.formData();\n            socket_id = formData.get(\"socket_id\");\n            channel_name = formData.get(\"channel_name\");\n            // If formData is empty, try with text body (URL-encoded)\n            if (!socket_id || !channel_name) {\n                const text = await request.text();\n                const params = new URLSearchParams(text);\n                socket_id = params.get(\"socket_id\");\n                channel_name = params.get(\"channel_name\");\n            }\n        }\n        // Make sure we have the required data\n        if (!socket_id || !channel_name) {\n            console.error(\"Missing socket_id or channel_name\", {\n                socket_id,\n                channel_name\n            });\n            return new next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse(JSON.stringify({\n                error: \"Missing socket_id or channel_name\"\n            }), {\n                status: 400,\n                headers: {\n                    \"Content-Type\": \"application/json\",\n                    \"Access-Control-Allow-Origin\": \"*\",\n                    \"Access-Control-Allow-Methods\": \"POST, GET, OPTIONS\",\n                    \"Access-Control-Allow-Headers\": \"Content-Type, Authorization\"\n                }\n            });\n        }\n        // Determine which user data to include in the authentication\n        const userData = {\n            user_id: user?.id || session?.userId || \"anonymous\",\n            user_info: {\n                name: user?.firstName || \"Guest\",\n                email: user?.emailAddresses?.[0]?.emailAddress || \"guest@example.com\"\n            }\n        };\n        if (!_lib_pusher__WEBPACK_IMPORTED_MODULE_0__.pusherServer) {\n            return new next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse(JSON.stringify({\n                error: \"Pusher not configured\"\n            }), {\n                status: 503,\n                headers: {\n                    \"Content-Type\": \"application/json\",\n                    \"Access-Control-Allow-Origin\": \"*\",\n                    \"Access-Control-Allow-Methods\": \"POST, GET, OPTIONS\",\n                    \"Access-Control-Allow-Headers\": \"Content-Type, Authorization\"\n                }\n            });\n        }\n        // Authenticate the user for this channel\n        const authResponse = _lib_pusher__WEBPACK_IMPORTED_MODULE_0__.pusherServer.authorizeChannel(socket_id, channel_name, userData);\n        // Return the auth response with CORS headers\n        return new next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse(JSON.stringify(authResponse), {\n            status: 200,\n            headers: {\n                \"Content-Type\": \"application/json\",\n                \"Access-Control-Allow-Origin\": \"*\",\n                \"Access-Control-Allow-Methods\": \"POST, GET, OPTIONS\",\n                \"Access-Control-Allow-Headers\": \"Content-Type, Authorization\"\n            }\n        });\n    } catch (error) {\n        console.error(\"Error in Pusher auth endpoint:\", error);\n        return new next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse(JSON.stringify({\n            error: \"Pusher authentication failed\",\n            details: error instanceof Error ? error.message : \"Unknown error\"\n        }), {\n            status: 500,\n            headers: {\n                \"Content-Type\": \"application/json\",\n                \"Access-Control-Allow-Origin\": \"*\",\n                \"Access-Control-Allow-Methods\": \"POST, GET, OPTIONS\",\n                \"Access-Control-Allow-Headers\": \"Content-Type, Authorization\"\n            }\n        });\n    }\n}\n// Handle preflight OPTIONS requests for CORS\nasync function OPTIONS(request) {\n    return new next_server__WEBPACK_IMPORTED_MODULE_1__.NextResponse(null, {\n        status: 200,\n        headers: {\n            \"Access-Control-Allow-Origin\": \"*\",\n            \"Access-Control-Allow-Methods\": \"POST, GET, OPTIONS\",\n            \"Access-Control-Allow-Headers\": \"Content-Type, Authorization\"\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9wdXNoZXIvYXV0aC9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQTRDO0FBQ0Q7QUFDYztBQUV6RCx1Q0FBdUM7QUFDaEMsTUFBTUksVUFBVSxTQUFTO0FBRXpCLGVBQWVDLEtBQUtDLE9BQWdCO0lBQ3pDLElBQUk7UUFDRiwrQkFBK0I7UUFDL0IsTUFBTUMsVUFBVSxNQUFNTCwwREFBSUE7UUFDMUIsTUFBTU0sT0FBTyxNQUFNTCxpRUFBV0E7UUFFOUIsc0RBQXNEO1FBQ3RELG1FQUFtRTtRQUNuRSxNQUFNTSxjQUFjSCxRQUFRSSxPQUFPLENBQUNDLEdBQUcsQ0FBQyxtQkFBbUI7UUFFM0QsSUFBSUMsWUFBMkI7UUFDL0IsSUFBSUMsZUFBOEI7UUFFbEMsSUFBSUosWUFBWUssUUFBUSxDQUFDLHFCQUFxQjtZQUM1Qyx3REFBd0Q7WUFDeEQsTUFBTUMsT0FBTyxNQUFNVCxRQUFRVSxJQUFJO1lBQy9CSixZQUFZRyxLQUFLSCxTQUFTO1lBQzFCQyxlQUFlRSxLQUFLRixZQUFZO1FBQ2xDLE9BQU87WUFDTCx1REFBdUQ7WUFDdkQsTUFBTUksV0FBVyxNQUFNWCxRQUFRVyxRQUFRO1lBQ3ZDTCxZQUFZSyxTQUFTTixHQUFHLENBQUM7WUFDekJFLGVBQWVJLFNBQVNOLEdBQUcsQ0FBQztZQUU1Qix5REFBeUQ7WUFDekQsSUFBSSxDQUFDQyxhQUFhLENBQUNDLGNBQWM7Z0JBQy9CLE1BQU1LLE9BQU8sTUFBTVosUUFBUVksSUFBSTtnQkFDL0IsTUFBTUMsU0FBUyxJQUFJQyxnQkFBZ0JGO2dCQUNuQ04sWUFBWU8sT0FBT1IsR0FBRyxDQUFDO2dCQUN2QkUsZUFBZU0sT0FBT1IsR0FBRyxDQUFDO1lBQzVCO1FBQ0Y7UUFFQSxzQ0FBc0M7UUFDdEMsSUFBSSxDQUFDQyxhQUFhLENBQUNDLGNBQWM7WUFDL0JRLFFBQVFDLEtBQUssQ0FBQyxxQ0FBcUM7Z0JBQUVWO2dCQUFXQztZQUFhO1lBQzdFLE9BQU8sSUFBSVoscURBQVlBLENBQUNzQixLQUFLQyxTQUFTLENBQUM7Z0JBQ3JDRixPQUFPO1lBQ1QsSUFBSTtnQkFDRkcsUUFBUTtnQkFDUmYsU0FBUztvQkFDUCxnQkFBZ0I7b0JBQ2hCLCtCQUErQjtvQkFDL0IsZ0NBQWdDO29CQUNoQyxnQ0FBZ0M7Z0JBQ2xDO1lBQ0Y7UUFDRjtRQUVBLDZEQUE2RDtRQUM3RCxNQUFNZ0IsV0FBVztZQUNmQyxTQUFTbkIsTUFBTW9CLE1BQU1yQixTQUFTc0IsVUFBVTtZQUN4Q0MsV0FBVztnQkFDVEMsTUFBTXZCLE1BQU13QixhQUFhO2dCQUN6QkMsT0FBT3pCLE1BQU0wQixnQkFBZ0IsQ0FBQyxFQUFFLEVBQUVDLGdCQUFnQjtZQUNwRDtRQUNGO1FBRUEsSUFBSSxDQUFDbkMscURBQVlBLEVBQUU7WUFDakIsT0FBTyxJQUFJQyxxREFBWUEsQ0FBQ3NCLEtBQUtDLFNBQVMsQ0FBQztnQkFBRUYsT0FBTztZQUF3QixJQUFJO2dCQUMxRUcsUUFBUTtnQkFDUmYsU0FBUztvQkFDUCxnQkFBZ0I7b0JBQ2hCLCtCQUErQjtvQkFDL0IsZ0NBQWdDO29CQUNoQyxnQ0FBZ0M7Z0JBQ2xDO1lBQ0Y7UUFDRjtRQUVBLHlDQUF5QztRQUN6QyxNQUFNMEIsZUFBZXBDLHFEQUFZQSxDQUFDcUMsZ0JBQWdCLENBQUN6QixXQUFXQyxjQUFjYTtRQUU1RSw2Q0FBNkM7UUFDN0MsT0FBTyxJQUFJekIscURBQVlBLENBQUNzQixLQUFLQyxTQUFTLENBQUNZLGVBQWU7WUFDcERYLFFBQVE7WUFDUmYsU0FBUztnQkFDUCxnQkFBZ0I7Z0JBQ2hCLCtCQUErQjtnQkFDL0IsZ0NBQWdDO2dCQUNoQyxnQ0FBZ0M7WUFDbEM7UUFDRjtJQUNGLEVBQUUsT0FBT1ksT0FBTztRQUNkRCxRQUFRQyxLQUFLLENBQUMsa0NBQWtDQTtRQUNoRCxPQUFPLElBQUlyQixxREFBWUEsQ0FBQ3NCLEtBQUtDLFNBQVMsQ0FBQztZQUFFRixPQUFPO1lBQWdDZ0IsU0FBU2hCLGlCQUFpQmlCLFFBQVFqQixNQUFNa0IsT0FBTyxHQUFHO1FBQWdCLElBQUk7WUFDcEpmLFFBQVE7WUFDUmYsU0FBUztnQkFDUCxnQkFBZ0I7Z0JBQ2hCLCtCQUErQjtnQkFDL0IsZ0NBQWdDO2dCQUNoQyxnQ0FBZ0M7WUFDbEM7UUFDRjtJQUNGO0FBQ0Y7QUFFQSw2Q0FBNkM7QUFDdEMsZUFBZStCLFFBQVFuQyxPQUFnQjtJQUM1QyxPQUFPLElBQUlMLHFEQUFZQSxDQUFDLE1BQU07UUFDNUJ3QixRQUFRO1FBQ1JmLFNBQVM7WUFDUCwrQkFBK0I7WUFDL0IsZ0NBQWdDO1lBQ2hDLGdDQUFnQztRQUNsQztJQUNGO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9icmllZi1zdXBwb3J0Ly4vc3JjL2FwcC9hcGkvcHVzaGVyL2F1dGgvcm91dGUudHM/NzczOCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwdXNoZXJTZXJ2ZXIgfSBmcm9tICdAL2xpYi9wdXNoZXInO1xuaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IHsgYXV0aCwgY3VycmVudFVzZXIgfSBmcm9tICdAY2xlcmsvbmV4dGpzL3NlcnZlcic7XG5cbi8vIEV4cGxpY2l0bHkgc2V0IHRoZSBydW50aW1lIHRvIG5vZGVqc1xuZXhwb3J0IGNvbnN0IHJ1bnRpbWUgPSAnbm9kZWpzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xuICB0cnkge1xuICAgIC8vIEdldCB0aGUgY3VycmVudCB1c2VyIHNlc3Npb25cbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgYXV0aCgpO1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBjdXJyZW50VXNlcigpO1xuICAgIFxuICAgIC8vIEdldCB0aGUgc29ja2V0X2lkIGFuZCBjaGFubmVsX25hbWUgZnJvbSB0aGUgcmVxdWVzdFxuICAgIC8vIFB1c2hlciBzZW5kcyBkYXRhIGFzIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCwgbm90IEpTT05cbiAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlcXVlc3QuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpIHx8ICcnO1xuICAgIFxuICAgIGxldCBzb2NrZXRfaWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIGxldCBjaGFubmVsX25hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIFxuICAgIGlmIChjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAvLyBIYW5kbGUgSlNPTiBmb3JtYXQgKGZvciB0ZXN0aW5nL2Z1dHVyZSBjb21wYXRpYmlsaXR5KVxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICAgICAgc29ja2V0X2lkID0gZGF0YS5zb2NrZXRfaWQ7XG4gICAgICBjaGFubmVsX25hbWUgPSBkYXRhLmNoYW5uZWxfbmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSGFuZGxlIGZvcm0gZGF0YSBmb3JtYXQgKHdoYXQgUHVzaGVyIGFjdHVhbGx5IHNlbmRzKVxuICAgICAgY29uc3QgZm9ybURhdGEgPSBhd2FpdCByZXF1ZXN0LmZvcm1EYXRhKCk7XG4gICAgICBzb2NrZXRfaWQgPSBmb3JtRGF0YS5nZXQoJ3NvY2tldF9pZCcpIGFzIHN0cmluZztcbiAgICAgIGNoYW5uZWxfbmFtZSA9IGZvcm1EYXRhLmdldCgnY2hhbm5lbF9uYW1lJykgYXMgc3RyaW5nO1xuICAgICAgXG4gICAgICAvLyBJZiBmb3JtRGF0YSBpcyBlbXB0eSwgdHJ5IHdpdGggdGV4dCBib2R5IChVUkwtZW5jb2RlZClcbiAgICAgIGlmICghc29ja2V0X2lkIHx8ICFjaGFubmVsX25hbWUpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlcXVlc3QudGV4dCgpO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHRleHQpO1xuICAgICAgICBzb2NrZXRfaWQgPSBwYXJhbXMuZ2V0KCdzb2NrZXRfaWQnKTtcbiAgICAgICAgY2hhbm5lbF9uYW1lID0gcGFyYW1zLmdldCgnY2hhbm5lbF9uYW1lJyk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIHRoZSByZXF1aXJlZCBkYXRhXG4gICAgaWYgKCFzb2NrZXRfaWQgfHwgIWNoYW5uZWxfbmFtZSkge1xuICAgICAgY29uc29sZS5lcnJvcignTWlzc2luZyBzb2NrZXRfaWQgb3IgY2hhbm5lbF9uYW1lJywgeyBzb2NrZXRfaWQsIGNoYW5uZWxfbmFtZSB9KTtcbiAgICAgIHJldHVybiBuZXcgTmV4dFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgZXJyb3I6ICdNaXNzaW5nIHNvY2tldF9pZCBvciBjaGFubmVsX25hbWUnXG4gICAgICB9KSwge1xuICAgICAgICBzdGF0dXM6IDQwMCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdQT1NULCBHRVQsIE9QVElPTlMnLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbicsXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBEZXRlcm1pbmUgd2hpY2ggdXNlciBkYXRhIHRvIGluY2x1ZGUgaW4gdGhlIGF1dGhlbnRpY2F0aW9uXG4gICAgY29uc3QgdXNlckRhdGEgPSB7XG4gICAgICB1c2VyX2lkOiB1c2VyPy5pZCB8fCBzZXNzaW9uPy51c2VySWQgfHwgJ2Fub255bW91cycsXG4gICAgICB1c2VyX2luZm86IHtcbiAgICAgICAgbmFtZTogdXNlcj8uZmlyc3ROYW1lIHx8ICdHdWVzdCcsXG4gICAgICAgIGVtYWlsOiB1c2VyPy5lbWFpbEFkZHJlc3Nlcz8uWzBdPy5lbWFpbEFkZHJlc3MgfHwgJ2d1ZXN0QGV4YW1wbGUuY29tJyxcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIGlmICghcHVzaGVyU2VydmVyKSB7XG4gICAgICByZXR1cm4gbmV3IE5leHRSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnUHVzaGVyIG5vdCBjb25maWd1cmVkJyB9KSwge1xuICAgICAgICBzdGF0dXM6IDUwMyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdQT1NULCBHRVQsIE9QVElPTlMnLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbicsXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEF1dGhlbnRpY2F0ZSB0aGUgdXNlciBmb3IgdGhpcyBjaGFubmVsXG4gICAgY29uc3QgYXV0aFJlc3BvbnNlID0gcHVzaGVyU2VydmVyLmF1dGhvcml6ZUNoYW5uZWwoc29ja2V0X2lkLCBjaGFubmVsX25hbWUsIHVzZXJEYXRhKTtcbiAgICBcbiAgICAvLyBSZXR1cm4gdGhlIGF1dGggcmVzcG9uc2Ugd2l0aCBDT1JTIGhlYWRlcnNcbiAgICByZXR1cm4gbmV3IE5leHRSZXNwb25zZShKU09OLnN0cmluZ2lmeShhdXRoUmVzcG9uc2UpLCB7XG4gICAgICBzdGF0dXM6IDIwMCxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCwgR0VULCBPUFRJT05TJyxcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uJyxcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBQdXNoZXIgYXV0aCBlbmRwb2ludDonLCBlcnJvcik7XG4gICAgcmV0dXJuIG5ldyBOZXh0UmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1B1c2hlciBhdXRoZW50aWNhdGlvbiBmYWlsZWQnLCBkZXRhaWxzOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJyB9KSwge1xuICAgICAgc3RhdHVzOiA1MDAsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ1BPU1QsIEdFVCwgT1BUSU9OUycsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbicsXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gSGFuZGxlIHByZWZsaWdodCBPUFRJT05TIHJlcXVlc3RzIGZvciBDT1JTXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gT1BUSU9OUyhyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIHJldHVybiBuZXcgTmV4dFJlc3BvbnNlKG51bGwsIHtcbiAgICBzdGF0dXM6IDIwMCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCwgR0VULCBPUFRJT05TJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSwgQXV0aG9yaXphdGlvbicsXG4gICAgfVxuICB9KTtcbn0gIl0sIm5hbWVzIjpbInB1c2hlclNlcnZlciIsIk5leHRSZXNwb25zZSIsImF1dGgiLCJjdXJyZW50VXNlciIsInJ1bnRpbWUiLCJQT1NUIiwicmVxdWVzdCIsInNlc3Npb24iLCJ1c2VyIiwiY29udGVudFR5cGUiLCJoZWFkZXJzIiwiZ2V0Iiwic29ja2V0X2lkIiwiY2hhbm5lbF9uYW1lIiwiaW5jbHVkZXMiLCJkYXRhIiwianNvbiIsImZvcm1EYXRhIiwidGV4dCIsInBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsImNvbnNvbGUiLCJlcnJvciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzdGF0dXMiLCJ1c2VyRGF0YSIsInVzZXJfaWQiLCJpZCIsInVzZXJJZCIsInVzZXJfaW5mbyIsIm5hbWUiLCJmaXJzdE5hbWUiLCJlbWFpbCIsImVtYWlsQWRkcmVzc2VzIiwiZW1haWxBZGRyZXNzIiwiYXV0aFJlc3BvbnNlIiwiYXV0aG9yaXplQ2hhbm5lbCIsImRldGFpbHMiLCJFcnJvciIsIm1lc3NhZ2UiLCJPUFRJT05TIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/pusher/auth/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/pusher.ts":
/*!***************************!*\
  !*** ./src/lib/pusher.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   pusherClient: () => (/* binding */ pusherClient),\n/* harmony export */   pusherServer: () => (/* binding */ pusherServer)\n/* harmony export */ });\n/* harmony import */ var pusher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pusher */ \"(rsc)/./node_modules/pusher/lib/pusher.js\");\n/* harmony import */ var pusher__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pusher__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var pusher_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! pusher-js */ \"(rsc)/./node_modules/pusher-js/dist/node/pusher.js\");\n/* harmony import */ var pusher_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(pusher_js__WEBPACK_IMPORTED_MODULE_1__);\n\n\n// Debug function to log environment variable status\nconst debugEnvVars = ()=>{\n    console.log(\"[PUSHER DEBUG] Environment variables check:\", {\n        PUSHER_APP_ID: process.env.PUSHER_APP_ID ? \"SET\" : \"MISSING\",\n        NEXT_PUBLIC_PUSHER_APP_KEY:  true ? \"SET\" : 0,\n        PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET ? \"SET\" : \"MISSING\",\n        NEXT_PUBLIC_PUSHER_APP_CLUSTER:  true ? \"SET\" : 0,\n        NODE_ENV: \"development\"\n    });\n};\n// Check if Pusher credentials are available\nconst isPusherConfigured = ()=>{\n    const hasRequiredVars = !!( true && process.env.PUSHER_APP_ID && process.env.PUSHER_APP_SECRET);\n    if (!hasRequiredVars && \"development\" === \"development\") {\n        debugEnvVars();\n    }\n    return hasRequiredVars;\n};\n// Get environment variables with validation - only log errors if really missing\nconst getEnvVar = (name, suppressWarnings = false)=>{\n    const value = process.env[name];\n    if (!value && !suppressWarnings) {\n        // Only log error if we're not in a configured state\n        if (!isPusherConfigured()) {\n            console.error(`Missing required environment variable: ${name}`);\n            if (true) {\n                console.warn(`Please add ${name} to your .env.local file`);\n            }\n        }\n    }\n    return value || \"\";\n};\n// Server-side Pusher instance - only create if properly configured\nlet pusherServer = null;\nif (isPusherConfigured()) {\n    try {\n        pusherServer = new (pusher__WEBPACK_IMPORTED_MODULE_0___default())({\n            appId: process.env.PUSHER_APP_ID,\n            key: \"d47e3b1cd4cd92d68dd9\",\n            secret: process.env.PUSHER_APP_SECRET,\n            cluster: \"eu\",\n            useTLS: true\n        });\n        console.log(\"[PUSHER DEBUG] Server-side Pusher configured successfully\");\n    } catch (error) {\n        console.error(\"[PUSHER DEBUG] Failed to initialize Pusher server:\", error);\n        pusherServer = null;\n    }\n} else {\n    console.warn(\"[PUSHER DEBUG] Pusher server not configured - missing environment variables\");\n}\n\n// Only initialize client-side Pusher if running in browser and properly configured\nlet pusherClient = null;\nif (false) {}\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3B1c2hlci50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBaUM7QUFDRztBQUVwQyxvREFBb0Q7QUFDcEQsTUFBTUUsZUFBZTtJQUNuQkMsUUFBUUMsR0FBRyxDQUFDLCtDQUErQztRQUN6REMsZUFBZUMsUUFBUUMsR0FBRyxDQUFDRixhQUFhLEdBQUcsUUFBUTtRQUNuREcsNEJBQTRCRixLQUFzQyxHQUFHLFFBQVE7UUFDN0VHLG1CQUFtQkgsUUFBUUMsR0FBRyxDQUFDRSxpQkFBaUIsR0FBRyxRQUFRO1FBQzNEQyxnQ0FBZ0NKLEtBQTBDLEdBQUcsUUFBUTtRQUNyRkssVUFWSjtJQVdFO0FBQ0Y7QUFFQSw0Q0FBNEM7QUFDNUMsTUFBTUMscUJBQXFCO0lBQ3pCLE1BQU1DLGtCQUFrQixDQUFDLENBQ3ZCUCxDQUFBQSxLQUMwQyxJQUMxQ0EsUUFBUUMsR0FBRyxDQUFDRixhQUFhLElBQ3pCQyxRQUFRQyxHQUFHLENBQUNFLGlCQUFpQjtJQUcvQixJQUFJLENBQUNJLG1CQUFtQlAsa0JBQXlCLGVBQWU7UUFDOURKO0lBQ0Y7SUFFQSxPQUFPVztBQUNUO0FBRUEsZ0ZBQWdGO0FBQ2hGLE1BQU1DLFlBQVksQ0FBQ0MsTUFBY0MsbUJBQTRCLEtBQUs7SUFDaEUsTUFBTUMsUUFBUVgsUUFBUUMsR0FBRyxDQUFDUSxLQUFLO0lBRS9CLElBQUksQ0FBQ0UsU0FBUyxDQUFDRCxrQkFBa0I7UUFDL0Isb0RBQW9EO1FBQ3BELElBQUksQ0FBQ0osc0JBQXNCO1lBQ3pCVCxRQUFRZSxLQUFLLENBQUMsQ0FBQyx1Q0FBdUMsRUFBRUgsS0FBSyxDQUFDO1lBQzlELElBQUlULElBQXlCLEVBQWU7Z0JBQzFDSCxRQUFRZ0IsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFSixLQUFLLHdCQUF3QixDQUFDO1lBQzNEO1FBQ0Y7SUFDRjtJQUVBLE9BQU9FLFNBQVM7QUFDbEI7QUFFQSxtRUFBbUU7QUFDbkUsSUFBSUcsZUFBb0M7QUFFeEMsSUFBSVIsc0JBQXNCO0lBQ3hCLElBQUk7UUFDRlEsZUFBZSxJQUFJcEIsK0NBQVlBLENBQUM7WUFDOUJxQixPQUFPZixRQUFRQyxHQUFHLENBQUNGLGFBQWE7WUFDaENpQixLQUFLaEIsc0JBQXNDO1lBQzNDaUIsUUFBUWpCLFFBQVFDLEdBQUcsQ0FBQ0UsaUJBQWlCO1lBQ3JDZSxTQUFTbEIsSUFBMEM7WUFDbkRtQixRQUFRO1FBQ1Y7UUFDQXRCLFFBQVFDLEdBQUcsQ0FBQztJQUNkLEVBQUUsT0FBT2MsT0FBTztRQUNkZixRQUFRZSxLQUFLLENBQUMsc0RBQXNEQTtRQUNwRUUsZUFBZTtJQUNqQjtBQUNGLE9BQU87SUFDTGpCLFFBQVFnQixJQUFJLENBQUM7QUFDZjtBQUV3QjtBQUV4QixtRkFBbUY7QUFDbkYsSUFBSU8sZUFBb0M7QUFFeEMsSUFBSSxLQUFrQixFQUFhLEVBaUVsQztBQUV1QiIsInNvdXJjZXMiOlsid2VicGFjazovL2JyaWVmLXN1cHBvcnQvLi9zcmMvbGliL3B1c2hlci50cz80Njk2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQdXNoZXJTZXJ2ZXIgZnJvbSAncHVzaGVyJ1xuaW1wb3J0IFB1c2hlckNsaWVudCBmcm9tICdwdXNoZXItanMnXG5cbi8vIERlYnVnIGZ1bmN0aW9uIHRvIGxvZyBlbnZpcm9ubWVudCB2YXJpYWJsZSBzdGF0dXNcbmNvbnN0IGRlYnVnRW52VmFycyA9ICgpID0+IHtcbiAgY29uc29sZS5sb2coJ1tQVVNIRVIgREVCVUddIEVudmlyb25tZW50IHZhcmlhYmxlcyBjaGVjazonLCB7XG4gICAgUFVTSEVSX0FQUF9JRDogcHJvY2Vzcy5lbnYuUFVTSEVSX0FQUF9JRCA/ICdTRVQnIDogJ01JU1NJTkcnLFxuICAgIE5FWFRfUFVCTElDX1BVU0hFUl9BUFBfS0VZOiBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19QVVNIRVJfQVBQX0tFWSA/ICdTRVQnIDogJ01JU1NJTkcnLFxuICAgIFBVU0hFUl9BUFBfU0VDUkVUOiBwcm9jZXNzLmVudi5QVVNIRVJfQVBQX1NFQ1JFVCA/ICdTRVQnIDogJ01JU1NJTkcnLFxuICAgIE5FWFRfUFVCTElDX1BVU0hFUl9BUFBfQ0xVU1RFUjogcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfUFVTSEVSX0FQUF9DTFVTVEVSID8gJ1NFVCcgOiAnTUlTU0lORycsXG4gICAgTk9ERV9FTlY6IHByb2Nlc3MuZW52Lk5PREVfRU5WXG4gIH0pO1xufTtcblxuLy8gQ2hlY2sgaWYgUHVzaGVyIGNyZWRlbnRpYWxzIGFyZSBhdmFpbGFibGVcbmNvbnN0IGlzUHVzaGVyQ29uZmlndXJlZCA9ICgpID0+IHtcbiAgY29uc3QgaGFzUmVxdWlyZWRWYXJzID0gISEoXG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfUFVTSEVSX0FQUF9LRVkgJiZcbiAgICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19QVVNIRVJfQVBQX0NMVVNURVIgJiZcbiAgICBwcm9jZXNzLmVudi5QVVNIRVJfQVBQX0lEICYmXG4gICAgcHJvY2Vzcy5lbnYuUFVTSEVSX0FQUF9TRUNSRVRcbiAgKTtcbiAgXG4gIGlmICghaGFzUmVxdWlyZWRWYXJzICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgZGVidWdFbnZWYXJzKCk7XG4gIH1cbiAgXG4gIHJldHVybiBoYXNSZXF1aXJlZFZhcnM7XG59O1xuXG4vLyBHZXQgZW52aXJvbm1lbnQgdmFyaWFibGVzIHdpdGggdmFsaWRhdGlvbiAtIG9ubHkgbG9nIGVycm9ycyBpZiByZWFsbHkgbWlzc2luZ1xuY29uc3QgZ2V0RW52VmFyID0gKG5hbWU6IHN0cmluZywgc3VwcHJlc3NXYXJuaW5nczogYm9vbGVhbiA9IGZhbHNlKSA9PiB7XG4gIGNvbnN0IHZhbHVlID0gcHJvY2Vzcy5lbnZbbmFtZV07XG4gIFxuICBpZiAoIXZhbHVlICYmICFzdXBwcmVzc1dhcm5pbmdzKSB7XG4gICAgLy8gT25seSBsb2cgZXJyb3IgaWYgd2UncmUgbm90IGluIGEgY29uZmlndXJlZCBzdGF0ZVxuICAgIGlmICghaXNQdXNoZXJDb25maWd1cmVkKCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYE1pc3NpbmcgcmVxdWlyZWQgZW52aXJvbm1lbnQgdmFyaWFibGU6ICR7bmFtZX1gKTtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAgICAgICBjb25zb2xlLndhcm4oYFBsZWFzZSBhZGQgJHtuYW1lfSB0byB5b3VyIC5lbnYubG9jYWwgZmlsZWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIHZhbHVlIHx8ICcnO1xufTtcblxuLy8gU2VydmVyLXNpZGUgUHVzaGVyIGluc3RhbmNlIC0gb25seSBjcmVhdGUgaWYgcHJvcGVybHkgY29uZmlndXJlZFxubGV0IHB1c2hlclNlcnZlcjogUHVzaGVyU2VydmVyIHwgbnVsbCA9IG51bGw7XG5cbmlmIChpc1B1c2hlckNvbmZpZ3VyZWQoKSkge1xuICB0cnkge1xuICAgIHB1c2hlclNlcnZlciA9IG5ldyBQdXNoZXJTZXJ2ZXIoe1xuICAgICAgYXBwSWQ6IHByb2Nlc3MuZW52LlBVU0hFUl9BUFBfSUQhLFxuICAgICAga2V5OiBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19QVVNIRVJfQVBQX0tFWSEsXG4gICAgICBzZWNyZXQ6IHByb2Nlc3MuZW52LlBVU0hFUl9BUFBfU0VDUkVUISxcbiAgICAgIGNsdXN0ZXI6IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1BVU0hFUl9BUFBfQ0xVU1RFUiEsXG4gICAgICB1c2VUTFM6IHRydWUsXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1tQVVNIRVIgREVCVUddIFNlcnZlci1zaWRlIFB1c2hlciBjb25maWd1cmVkIHN1Y2Nlc3NmdWxseScpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tQVVNIRVIgREVCVUddIEZhaWxlZCB0byBpbml0aWFsaXplIFB1c2hlciBzZXJ2ZXI6JywgZXJyb3IpO1xuICAgIHB1c2hlclNlcnZlciA9IG51bGw7XG4gIH1cbn0gZWxzZSB7XG4gIGNvbnNvbGUud2FybignW1BVU0hFUiBERUJVR10gUHVzaGVyIHNlcnZlciBub3QgY29uZmlndXJlZCAtIG1pc3NpbmcgZW52aXJvbm1lbnQgdmFyaWFibGVzJyk7XG59XG5cbmV4cG9ydCB7IHB1c2hlclNlcnZlciB9O1xuXG4vLyBPbmx5IGluaXRpYWxpemUgY2xpZW50LXNpZGUgUHVzaGVyIGlmIHJ1bm5pbmcgaW4gYnJvd3NlciBhbmQgcHJvcGVybHkgY29uZmlndXJlZFxubGV0IHB1c2hlckNsaWVudDogUHVzaGVyQ2xpZW50IHwgbnVsbCA9IG51bGw7XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICBjb25zdCBwdXNoZXJBcHBLZXkgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19QVVNIRVJfQVBQX0tFWTtcbiAgY29uc3QgcHVzaGVyQ2x1c3RlciA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1BVU0hFUl9BUFBfQ0xVU1RFUjtcbiAgXG4gIGlmIChwdXNoZXJBcHBLZXkgJiYgcHVzaGVyQ2x1c3RlciAmJiBwdXNoZXJBcHBLZXkgIT09ICdrZXlfcGxhY2Vob2xkZXInKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIENvbmZpZ3VyZSBQdXNoZXJDbGllbnQgdG8gdXNlIFdlYlNvY2tldCBvbmx5IGFuZCBkaXNhYmxlIGNsaWVudC1zaWRlIHRyaWdnZXJpbmdcbiAgICAgIHB1c2hlckNsaWVudCA9IG5ldyBQdXNoZXJDbGllbnQoXG4gICAgICAgIHB1c2hlckFwcEtleSwgXG4gICAgICAgIHtcbiAgICAgICAgICBjbHVzdGVyOiBwdXNoZXJDbHVzdGVyLFxuICAgICAgICAgIGZvcmNlVExTOiB0cnVlLFxuICAgICAgICAgIC8vIElNUE9SVEFOVDogT25seSBlbmFibGUgV2ViU29ja2V0IHRyYW5zcG9ydCB0byBhdm9pZCBDT1JTIGlzc3VlcyB3aXRoIFhIUlxuICAgICAgICAgIGVuYWJsZWRUcmFuc3BvcnRzOiBbJ3dzJywgJ3dzcyddLFxuICAgICAgICAgIGRpc2FibGVTdGF0czogdHJ1ZSxcbiAgICAgICAgICAvLyBVc2Ugc3RhbmRhcmQgUHVzaGVyIGhvc3RzIGluc3RlYWQgb2YgY3VzdG9tIGhvc3RzXG4gICAgICAgICAgLy8gUmVtb3ZlIHVuZGVmaW5lZCB3c0hvc3QgYW5kIHdzUG9ydCB0byB1c2UgUHVzaGVyJ3MgZGVmYXVsdCBpbmZyYXN0cnVjdHVyZVxuICAgICAgICAgIC8vIERvbid0IGF0dGVtcHQgdG8gdHJpZ2dlciBldmVudHMgZnJvbSB0aGUgY2xpZW50IC0gdXNlIHNlcnZlci1zaWRlIG9ubHlcbiAgICAgICAgICB1c2VyQXV0aGVudGljYXRpb246IHtcbiAgICAgICAgICAgIGVuZHBvaW50OiAnL2FwaS9wdXNoZXIvYXV0aC91c2VyJyxcbiAgICAgICAgICAgIHRyYW5zcG9ydDogJ2FqYXgnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBDaGFubmVsIGF1dGhlbnRpY2F0aW9uIHNldHRpbmdzXG4gICAgICAgICAgY2hhbm5lbEF1dGhvcml6YXRpb246IHtcbiAgICAgICAgICAgIGVuZHBvaW50OiAnL2FwaS9wdXNoZXIvYXV0aCcsXG4gICAgICAgICAgICB0cmFuc3BvcnQ6ICdhamF4JyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdbUFVTSEVSIERFQlVHXSBDbGllbnQtc2lkZSBQdXNoZXIgY29uZmlndXJlZCBzdWNjZXNzZnVsbHknKTtcblxuICAgICAgLy8gQWRkIERFQlVHIEVWRU5UIExPR0dJTkcgLSBMb2cgYWxsIHJlY2VpdmVkIGV2ZW50cyBmb3IgZGVidWdnaW5nXG4gICAgICBwdXNoZXJDbGllbnQuY29ubmVjdGlvbi5iaW5kKCdtZXNzYWdlJywgKHBhcmFtczogYW55KSA9PiB7XG4gICAgICAgIGlmIChwYXJhbXMgJiYgcGFyYW1zLmV2ZW50KSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYFtQVVNIRVIgREVCVUddIEV2ZW50IHJlY2VpdmVkOiAke3BhcmFtcy5ldmVudH1gLCBwYXJhbXMuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICAvLyBBZGQgY29ubmVjdGlvbiBlcnJvciBoYW5kbGluZ1xuICAgICAgcHVzaGVyQ2xpZW50LmNvbm5lY3Rpb24uYmluZCgnZXJyb3InLCAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUFVTSEVSIERFQlVHXSBDb25uZWN0aW9uIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgaWYgKGVycm9yLnR5cGUgPT09ICdQdXNoZXJFcnJvcicgJiYgZXJyb3IuZGF0YT8uY29kZSA9PT0gNDAwMSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1B1c2hlciBjb25maWd1cmF0aW9uIGVycm9yOiBDaGVjayB5b3VyIGFwcCBrZXkgYW5kIGNsdXN0ZXIgc2V0dGluZ3MnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHB1c2hlckNsaWVudC5jb25uZWN0aW9uLmJpbmQoJ3N0YXRlX2NoYW5nZScsIChzdGF0ZXM6IGFueSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW1BVU0hFUiBERUJVR10gQ29ubmVjdGlvbiBzdGF0ZSBjaGFuZ2VkOiAke3N0YXRlcy5wcmV2aW91c30gLT4gJHtzdGF0ZXMuY3VycmVudH1gKTtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tQVVNIRVIgREVCVUddIEZhaWxlZCB0byBpbml0aWFsaXplIFB1c2hlciBjbGllbnQ6JywgZXJyb3IpO1xuICAgICAgcHVzaGVyQ2xpZW50ID0gbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZGVidWdFbnZWYXJzKCk7XG4gICAgY29uc29sZS53YXJuKCdbUFVTSEVSIERFQlVHXSBQdXNoZXIgY2xpZW50IG5vdCBjb25maWd1cmVkLiBFbnZpcm9ubWVudCB2YXJpYWJsZXMgbm90IGF2YWlsYWJsZSBpbiBicm93c2VyLicpO1xuICB9XG59XG5cbmV4cG9ydCB7IHB1c2hlckNsaWVudCB9OyAiXSwibmFtZXMiOlsiUHVzaGVyU2VydmVyIiwiUHVzaGVyQ2xpZW50IiwiZGVidWdFbnZWYXJzIiwiY29uc29sZSIsImxvZyIsIlBVU0hFUl9BUFBfSUQiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfUFVTSEVSX0FQUF9LRVkiLCJQVVNIRVJfQVBQX1NFQ1JFVCIsIk5FWFRfUFVCTElDX1BVU0hFUl9BUFBfQ0xVU1RFUiIsIk5PREVfRU5WIiwiaXNQdXNoZXJDb25maWd1cmVkIiwiaGFzUmVxdWlyZWRWYXJzIiwiZ2V0RW52VmFyIiwibmFtZSIsInN1cHByZXNzV2FybmluZ3MiLCJ2YWx1ZSIsImVycm9yIiwid2FybiIsInB1c2hlclNlcnZlciIsImFwcElkIiwia2V5Iiwic2VjcmV0IiwiY2x1c3RlciIsInVzZVRMUyIsInB1c2hlckNsaWVudCIsInB1c2hlckFwcEtleSIsInB1c2hlckNsdXN0ZXIiLCJmb3JjZVRMUyIsImVuYWJsZWRUcmFuc3BvcnRzIiwiZGlzYWJsZVN0YXRzIiwidXNlckF1dGhlbnRpY2F0aW9uIiwiZW5kcG9pbnQiLCJ0cmFuc3BvcnQiLCJoZWFkZXJzIiwiY2hhbm5lbEF1dGhvcml6YXRpb24iLCJjb25uZWN0aW9uIiwiYmluZCIsInBhcmFtcyIsImV2ZW50IiwiZGF0YSIsInR5cGUiLCJjb2RlIiwic3RhdGVzIiwicHJldmlvdXMiLCJjdXJyZW50Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/pusher.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/node-fetch-native","vendor-chunks/next","vendor-chunks/@clerk","vendor-chunks/@peculiar","vendor-chunks/asn1js","vendor-chunks/webcrypto-core","vendor-chunks/tslib","vendor-chunks/pvtsutils","vendor-chunks/pvutils","vendor-chunks/deepmerge","vendor-chunks/map-obj","vendor-chunks/no-case","vendor-chunks/lower-case","vendor-chunks/snake-case","vendor-chunks/dot-case","vendor-chunks/node-fetch","vendor-chunks/pusher-js","vendor-chunks/tweetnacl","vendor-chunks/pusher","vendor-chunks/event-target-shim","vendor-chunks/abort-controller","vendor-chunks/tweetnacl-util","vendor-chunks/is-base64"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fpusher%2Fauth%2Froute&page=%2Fapi%2Fpusher%2Fauth%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fpusher%2Fauth%2Froute.ts&appDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();