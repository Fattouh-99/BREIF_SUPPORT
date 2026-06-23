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
exports.id = "app/api/notifications/route";
exports.ids = ["app/api/notifications/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fnotifications%2Froute&page=%2Fapi%2Fnotifications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnotifications%2Froute.ts&appDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fnotifications%2Froute&page=%2Fapi%2Fnotifications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnotifications%2Froute.ts&appDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_fattouh999_Documents_GitHub_New_folder_src_app_api_notifications_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/notifications/route.ts */ \"(rsc)/./src/app/api/notifications/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"standalone\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/notifications/route\",\n        pathname: \"/api/notifications\",\n        filename: \"route\",\n        bundlePath: \"app/api/notifications/route\"\n    },\n    resolvedPagePath: \"/Users/fattouh999/Documents/GitHub/New-folder/src/app/api/notifications/route.ts\",\n    nextConfigOutput,\n    userland: _Users_fattouh999_Documents_GitHub_New_folder_src_app_api_notifications_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/notifications/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZub3RpZmljYXRpb25zJTJGcm91dGUmcGFnZT0lMkZhcGklMkZub3RpZmljYXRpb25zJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGbm90aWZpY2F0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRmZhdHRvdWg5OTklMkZEb2N1bWVudHMlMkZHaXRIdWIlMkZOZXctZm9sZGVyJTJGc3JjJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmZhdHRvdWg5OTklMkZEb2N1bWVudHMlMkZHaXRIdWIlMkZOZXctZm9sZGVyJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PXN0YW5kYWxvbmUmcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDZ0M7QUFDN0c7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9icmllZi1zdXBwb3J0Lz80NmE3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9mYXR0b3VoOTk5L0RvY3VtZW50cy9HaXRIdWIvTmV3LWZvbGRlci9zcmMvYXBwL2FwaS9ub3RpZmljYXRpb25zL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcInN0YW5kYWxvbmVcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvbm90aWZpY2F0aW9ucy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL25vdGlmaWNhdGlvbnNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL25vdGlmaWNhdGlvbnMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvZmF0dG91aDk5OS9Eb2N1bWVudHMvR2l0SHViL05ldy1mb2xkZXIvc3JjL2FwcC9hcGkvbm90aWZpY2F0aW9ucy9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvbm90aWZpY2F0aW9ucy9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fnotifications%2Froute&page=%2Fapi%2Fnotifications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnotifications%2Froute.ts&appDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/notifications/route.ts":
/*!********************************************!*\
  !*** ./src/app/api/notifications/route.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./src/lib/prisma.ts\");\n/* harmony import */ var _lib_pusher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/pusher */ \"(rsc)/./src/lib/pusher.ts\");\n/* harmony import */ var _clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @clerk/nextjs/server */ \"(rsc)/./node_modules/@clerk/nextjs/dist/esm/app-router/server/currentUser.js\");\n/* harmony import */ var _lib_api_response__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/api-response */ \"(rsc)/./src/lib/api-response.ts\");\n\n\n\n\n// Explicitly set the runtime to nodejs\nconst runtime = \"nodejs\";\nasync function GET() {\n    try {\n        const user = await (0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_3__.currentUser)();\n        if (!user) {\n            return _lib_api_response__WEBPACK_IMPORTED_MODULE_2__.ApiError.Unauthorized();\n        }\n        // First get the user's ID from our database using their Clerk ID\n        const dbUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.user.findUnique({\n            where: {\n                clerkId: user.id\n            },\n            select: {\n                id: true\n            }\n        });\n        if (!dbUser) {\n            return _lib_api_response__WEBPACK_IMPORTED_MODULE_2__.ApiError.NotFound(\"User not found\");\n        }\n        const notifications = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.notification.findMany({\n            where: {\n                userId: dbUser.id\n            },\n            orderBy: {\n                createdAt: \"desc\"\n            }\n        });\n        return (0,_lib_api_response__WEBPACK_IMPORTED_MODULE_2__.successResponse)(notifications);\n    } catch (error) {\n        console.error(\"Failed to fetch notifications:\", error);\n        return _lib_api_response__WEBPACK_IMPORTED_MODULE_2__.ApiError.InternalError(\"Failed to fetch notifications\");\n    }\n}\nasync function POST(req) {\n    try {\n        const user = await (0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_3__.currentUser)();\n        if (!user) {\n            return _lib_api_response__WEBPACK_IMPORTED_MODULE_2__.ApiError.Unauthorized();\n        }\n        const { type, message } = await req.json();\n        const dbUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.user.findUnique({\n            where: {\n                clerkId: user.id\n            },\n            select: {\n                id: true,\n                domains: {\n                    take: 1,\n                    select: {\n                        id: true\n                    }\n                }\n            }\n        });\n        if (!dbUser) {\n            return _lib_api_response__WEBPACK_IMPORTED_MODULE_2__.ApiError.NotFound(\"User not found\");\n        }\n        const notification = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.notification.create({\n            data: {\n                type,\n                message,\n                userId: dbUser.id,\n                domainId: dbUser.domains[0]?.id\n            }\n        });\n        // Trigger Pusher event for real-time notification\n        await _lib_pusher__WEBPACK_IMPORTED_MODULE_1__.pusherServer.trigger(`user-${dbUser.id}`, \"notification\", notification);\n        return (0,_lib_api_response__WEBPACK_IMPORTED_MODULE_2__.successResponse)(notification);\n    } catch (error) {\n        console.error(\"Failed to create notification:\", error);\n        return _lib_api_response__WEBPACK_IMPORTED_MODULE_2__.ApiError.InternalError(\"Failed to create notification\");\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9ub3RpZmljYXRpb25zL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBcUM7QUFDTTtBQUNPO0FBQ1k7QUFFOUQsdUNBQXVDO0FBQ2hDLE1BQU1LLFVBQVUsU0FBUztBQUV6QixlQUFlQztJQUNwQixJQUFJO1FBQ0YsTUFBTUMsT0FBTyxNQUFNTCxpRUFBV0E7UUFDOUIsSUFBSSxDQUFDSyxNQUFNO1lBQ1QsT0FBT0gsdURBQVFBLENBQUNJLFlBQVk7UUFDOUI7UUFFQSxpRUFBaUU7UUFDakUsTUFBTUMsU0FBUyxNQUFNVCwrQ0FBTUEsQ0FBQ08sSUFBSSxDQUFDRyxVQUFVLENBQUM7WUFDMUNDLE9BQU87Z0JBQUVDLFNBQVNMLEtBQUtNLEVBQUU7WUFBQztZQUMxQkMsUUFBUTtnQkFBRUQsSUFBSTtZQUFLO1FBQ3JCO1FBRUEsSUFBSSxDQUFDSixRQUFRO1lBQ1gsT0FBT0wsdURBQVFBLENBQUNXLFFBQVEsQ0FBQztRQUMzQjtRQUVBLE1BQU1DLGdCQUFnQixNQUFNaEIsK0NBQU1BLENBQUNpQixZQUFZLENBQUNDLFFBQVEsQ0FBQztZQUN2RFAsT0FBTztnQkFDTFEsUUFBUVYsT0FBT0ksRUFBRTtZQUNuQjtZQUNBTyxTQUFTO2dCQUNQQyxXQUFXO1lBQ2I7UUFDRjtRQUVBLE9BQU9sQixrRUFBZUEsQ0FBQ2E7SUFDekIsRUFBRSxPQUFPTSxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxrQ0FBa0NBO1FBQ2hELE9BQU9sQix1REFBUUEsQ0FBQ29CLGFBQWEsQ0FBQztJQUNoQztBQUNGO0FBRU8sZUFBZUMsS0FBS0MsR0FBWTtJQUNyQyxJQUFJO1FBQ0YsTUFBTW5CLE9BQU8sTUFBTUwsaUVBQVdBO1FBQzlCLElBQUksQ0FBQ0ssTUFBTTtZQUNULE9BQU9ILHVEQUFRQSxDQUFDSSxZQUFZO1FBQzlCO1FBRUEsTUFBTSxFQUFFbUIsSUFBSSxFQUFFQyxPQUFPLEVBQUUsR0FBRyxNQUFNRixJQUFJRyxJQUFJO1FBRXhDLE1BQU1wQixTQUFTLE1BQU1ULCtDQUFNQSxDQUFDTyxJQUFJLENBQUNHLFVBQVUsQ0FBQztZQUMxQ0MsT0FBTztnQkFBRUMsU0FBU0wsS0FBS00sRUFBRTtZQUFDO1lBQzFCQyxRQUFRO2dCQUNORCxJQUFJO2dCQUNKaUIsU0FBUztvQkFDUEMsTUFBTTtvQkFDTmpCLFFBQVE7d0JBQUVELElBQUk7b0JBQUs7Z0JBQ3JCO1lBQ0Y7UUFDRjtRQUVBLElBQUksQ0FBQ0osUUFBUTtZQUNYLE9BQU9MLHVEQUFRQSxDQUFDVyxRQUFRLENBQUM7UUFDM0I7UUFFQSxNQUFNRSxlQUFlLE1BQU1qQiwrQ0FBTUEsQ0FBQ2lCLFlBQVksQ0FBQ2UsTUFBTSxDQUFDO1lBQ3BEQyxNQUFNO2dCQUNKTjtnQkFDQUM7Z0JBQ0FULFFBQVFWLE9BQU9JLEVBQUU7Z0JBQ2pCcUIsVUFBVXpCLE9BQU9xQixPQUFPLENBQUMsRUFBRSxFQUFFakI7WUFDL0I7UUFDRjtRQUVBLGtEQUFrRDtRQUNsRCxNQUFNWixxREFBWUEsQ0FBQ2tDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRTFCLE9BQU9JLEVBQUUsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCSTtRQUVoRSxPQUFPZCxrRUFBZUEsQ0FBQ2M7SUFDekIsRUFBRSxPQUFPSyxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxrQ0FBa0NBO1FBQ2hELE9BQU9sQix1REFBUUEsQ0FBQ29CLGFBQWEsQ0FBQztJQUNoQztBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYnJpZWYtc3VwcG9ydC8uL3NyYy9hcHAvYXBpL25vdGlmaWNhdGlvbnMvcm91dGUudHM/YmJjNSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBwcmlzbWEgfSBmcm9tICdAL2xpYi9wcmlzbWEnXG5pbXBvcnQgeyBwdXNoZXJTZXJ2ZXIgfSBmcm9tICdAL2xpYi9wdXNoZXInXG5pbXBvcnQgeyBjdXJyZW50VXNlciB9IGZyb20gJ0BjbGVyay9uZXh0anMvc2VydmVyJ1xuaW1wb3J0IHsgc3VjY2Vzc1Jlc3BvbnNlLCBBcGlFcnJvciB9IGZyb20gJ0AvbGliL2FwaS1yZXNwb25zZSdcblxuLy8gRXhwbGljaXRseSBzZXQgdGhlIHJ1bnRpbWUgdG8gbm9kZWpzXG5leHBvcnQgY29uc3QgcnVudGltZSA9ICdub2RlanMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICB0cnkge1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBjdXJyZW50VXNlcigpXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICByZXR1cm4gQXBpRXJyb3IuVW5hdXRob3JpemVkKClcbiAgICB9XG5cbiAgICAvLyBGaXJzdCBnZXQgdGhlIHVzZXIncyBJRCBmcm9tIG91ciBkYXRhYmFzZSB1c2luZyB0aGVpciBDbGVyayBJRFxuICAgIGNvbnN0IGRiVXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgd2hlcmU6IHsgY2xlcmtJZDogdXNlci5pZCB9LFxuICAgICAgc2VsZWN0OiB7IGlkOiB0cnVlIH1cbiAgICB9KVxuXG4gICAgaWYgKCFkYlVzZXIpIHtcbiAgICAgIHJldHVybiBBcGlFcnJvci5Ob3RGb3VuZCgnVXNlciBub3QgZm91bmQnKVxuICAgIH1cblxuICAgIGNvbnN0IG5vdGlmaWNhdGlvbnMgPSBhd2FpdCBwcmlzbWEubm90aWZpY2F0aW9uLmZpbmRNYW55KHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIHVzZXJJZDogZGJVc2VyLmlkLFxuICAgICAgfSxcbiAgICAgIG9yZGVyQnk6IHtcbiAgICAgICAgY3JlYXRlZEF0OiAnZGVzYycsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKG5vdGlmaWNhdGlvbnMpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGZldGNoIG5vdGlmaWNhdGlvbnM6JywgZXJyb3IpXG4gICAgcmV0dXJuIEFwaUVycm9yLkludGVybmFsRXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBub3RpZmljYXRpb25zJylcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB1c2VyID0gYXdhaXQgY3VycmVudFVzZXIoKVxuICAgIGlmICghdXNlcikge1xuICAgICAgcmV0dXJuIEFwaUVycm9yLlVuYXV0aG9yaXplZCgpXG4gICAgfVxuXG4gICAgY29uc3QgeyB0eXBlLCBtZXNzYWdlIH0gPSBhd2FpdCByZXEuanNvbigpXG5cbiAgICBjb25zdCBkYlVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcbiAgICAgIHdoZXJlOiB7IGNsZXJrSWQ6IHVzZXIuaWQgfSxcbiAgICAgIHNlbGVjdDogeyBcbiAgICAgICAgaWQ6IHRydWUsXG4gICAgICAgIGRvbWFpbnM6IHtcbiAgICAgICAgICB0YWtlOiAxLFxuICAgICAgICAgIHNlbGVjdDogeyBpZDogdHJ1ZSB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKCFkYlVzZXIpIHtcbiAgICAgIHJldHVybiBBcGlFcnJvci5Ob3RGb3VuZCgnVXNlciBub3QgZm91bmQnKVxuICAgIH1cblxuICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGF3YWl0IHByaXNtYS5ub3RpZmljYXRpb24uY3JlYXRlKHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdHlwZSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgdXNlcklkOiBkYlVzZXIuaWQsXG4gICAgICAgIGRvbWFpbklkOiBkYlVzZXIuZG9tYWluc1swXT8uaWQsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICAvLyBUcmlnZ2VyIFB1c2hlciBldmVudCBmb3IgcmVhbC10aW1lIG5vdGlmaWNhdGlvblxuICAgIGF3YWl0IHB1c2hlclNlcnZlci50cmlnZ2VyKGB1c2VyLSR7ZGJVc2VyLmlkfWAsICdub3RpZmljYXRpb24nLCBub3RpZmljYXRpb24pXG5cbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKG5vdGlmaWNhdGlvbilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIG5vdGlmaWNhdGlvbjonLCBlcnJvcilcbiAgICByZXR1cm4gQXBpRXJyb3IuSW50ZXJuYWxFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBub3RpZmljYXRpb24nKVxuICB9XG59ICJdLCJuYW1lcyI6WyJwcmlzbWEiLCJwdXNoZXJTZXJ2ZXIiLCJjdXJyZW50VXNlciIsInN1Y2Nlc3NSZXNwb25zZSIsIkFwaUVycm9yIiwicnVudGltZSIsIkdFVCIsInVzZXIiLCJVbmF1dGhvcml6ZWQiLCJkYlVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJjbGVya0lkIiwiaWQiLCJzZWxlY3QiLCJOb3RGb3VuZCIsIm5vdGlmaWNhdGlvbnMiLCJub3RpZmljYXRpb24iLCJmaW5kTWFueSIsInVzZXJJZCIsIm9yZGVyQnkiLCJjcmVhdGVkQXQiLCJlcnJvciIsImNvbnNvbGUiLCJJbnRlcm5hbEVycm9yIiwiUE9TVCIsInJlcSIsInR5cGUiLCJtZXNzYWdlIiwianNvbiIsImRvbWFpbnMiLCJ0YWtlIiwiY3JlYXRlIiwiZGF0YSIsImRvbWFpbklkIiwidHJpZ2dlciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/notifications/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/api-response.ts":
/*!*********************************!*\
  !*** ./src/lib/api-response.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ApiError: () => (/* binding */ ApiError),\n/* harmony export */   cachePresets: () => (/* binding */ cachePresets),\n/* harmony export */   cachedSuccessResponse: () => (/* binding */ cachedSuccessResponse),\n/* harmony export */   corsHeaders: () => (/* binding */ corsHeaders),\n/* harmony export */   errorResponse: () => (/* binding */ errorResponse),\n/* harmony export */   successResponse: () => (/* binding */ successResponse)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n/**\n * Standard CORS headers for API responses\n */ const corsHeaders = {\n    \"Access-Control-Allow-Origin\": \"*\",\n    \"Access-Control-Allow-Methods\": \"GET, POST, PUT, DELETE, OPTIONS\",\n    \"Access-Control-Allow-Headers\": \"Content-Type, Authorization\"\n};\n/**\n * Cache control presets for API responses\n */ const cachePresets = {\n    // No caching\n    noStore: {\n        \"Cache-Control\": \"no-store, no-cache, must-revalidate, proxy-revalidate\",\n        \"Pragma\": \"no-cache\",\n        \"Expires\": \"0\"\n    },\n    // Short cache for dynamic data that updates frequently\n    short: {\n        \"Cache-Control\": \"public, max-age=60, s-maxage=60, stale-while-revalidate=300\"\n    },\n    // Medium cache for data that updates occasionally\n    medium: {\n        \"Cache-Control\": \"public, max-age=300, s-maxage=600, stale-while-revalidate=1800\"\n    },\n    // Long cache for data that rarely changes\n    long: {\n        \"Cache-Control\": \"public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400\"\n    }\n};\n/**\n * Creates a standardized success response\n * \n * @param data - The data to return in the response\n * @param status - HTTP status code (default: 200)\n * @param headers - Additional headers to include\n * @returns NextResponse with standardized success format\n */ function successResponse(data, status = 200, headers = {}) {\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data, {\n        status,\n        headers: {\n            ...corsHeaders,\n            ...headers\n        }\n    });\n}\n/**\n * Creates a cached success response with appropriate cache headers\n * \n * @param data - The data to return in the response\n * @param cacheType - Cache preset to use (short, medium, long)\n * @param status - HTTP status code (default: 200)\n * @param headers - Additional headers to include\n * @returns NextResponse with standardized success format and caching\n */ function cachedSuccessResponse(data, cacheType = \"short\", status = 200, headers = {}) {\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data, {\n        status,\n        headers: {\n            ...corsHeaders,\n            ...cachePresets[cacheType],\n            ...headers\n        }\n    });\n}\n/**\n * Creates a standardized error response\n * \n * @param message - The error message\n * @param status - HTTP status code (default: 500)\n * @param details - Additional error details (optional)\n * @param headers - Additional headers to include\n * @returns NextResponse with standardized error format\n */ function errorResponse(message, status = 500, details = null, headers = {}) {\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: message,\n        ...details && {\n            details\n        }\n    }, {\n        status,\n        headers: {\n            ...corsHeaders,\n            ...cachePresets.noStore,\n            ...headers\n        }\n    });\n}\n/**\n * Common error responses\n */ const ApiError = {\n    Unauthorized: (details)=>{\n        const res = errorResponse(\"Unauthorized\", 401, details);\n        return Object.assign(res, {\n            response: ()=>res\n        });\n    },\n    NotFound: (message = \"Resource not found\", details)=>{\n        const res = errorResponse(message, 404, details);\n        return Object.assign(res, {\n            response: ()=>res\n        });\n    },\n    BadRequest: (message = \"Bad request\", details)=>{\n        const res = errorResponse(message, 400, details);\n        return Object.assign(res, {\n            response: ()=>res\n        });\n    },\n    Forbidden: (message = \"Forbidden\", details)=>{\n        const res = errorResponse(message, 403, details);\n        return Object.assign(res, {\n            response: ()=>res\n        });\n    },\n    InternalError: (details)=>{\n        const res = errorResponse(\"Internal server error\", 500, details);\n        return Object.assign(res, {\n            response: ()=>res\n        });\n    },\n    ServiceUnavailable: (details)=>{\n        const res = errorResponse(\"Service temporarily unavailable\", 503, details);\n        return Object.assign(res, {\n            response: ()=>res\n        });\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2FwaS1yZXNwb25zZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQTBDO0FBSTFDOztDQUVDLEdBQ00sTUFBTUMsY0FBYztJQUN6QiwrQkFBK0I7SUFDL0IsZ0NBQWdDO0lBQ2hDLGdDQUFnQztBQUNsQyxFQUFDO0FBRUQ7O0NBRUMsR0FDTSxNQUFNQyxlQUFlO0lBQzFCLGFBQWE7SUFDYkMsU0FBUztRQUNQLGlCQUFpQjtRQUNqQixVQUFVO1FBQ1YsV0FBVztJQUNiO0lBQ0EsdURBQXVEO0lBQ3ZEQyxPQUFPO1FBQ0wsaUJBQWlCO0lBQ25CO0lBQ0Esa0RBQWtEO0lBQ2xEQyxRQUFRO1FBQ04saUJBQWlCO0lBQ25CO0lBQ0EsMENBQTBDO0lBQzFDQyxNQUFNO1FBQ0osaUJBQWlCO0lBQ25CO0FBQ0YsRUFBQztBQUVEOzs7Ozs7O0NBT0MsR0FDTSxTQUFTQyxnQkFDZEMsSUFBUyxFQUNUQyxTQUFTLEdBQUcsRUFDWkMsVUFBdUIsQ0FBQyxDQUFDO0lBRXpCLE9BQU9WLHFEQUFZQSxDQUFDVyxJQUFJLENBQUNILE1BQU07UUFDN0JDO1FBQ0FDLFNBQVM7WUFBRSxHQUFHVCxXQUFXO1lBQUUsR0FBR1MsT0FBTztRQUFDO0lBQ3hDO0FBQ0Y7QUFFQTs7Ozs7Ozs7Q0FRQyxHQUNNLFNBQVNFLHNCQUNkSixJQUFTLEVBQ1RLLFlBQXVDLE9BQU8sRUFDOUNKLFNBQVMsR0FBRyxFQUNaQyxVQUF1QixDQUFDLENBQUM7SUFFekIsT0FBT1YscURBQVlBLENBQUNXLElBQUksQ0FBQ0gsTUFBTTtRQUM3QkM7UUFDQUMsU0FBUztZQUNQLEdBQUdULFdBQVc7WUFDZCxHQUFHQyxZQUFZLENBQUNXLFVBQVU7WUFDMUIsR0FBR0gsT0FBTztRQUNaO0lBQ0Y7QUFDRjtBQUVBOzs7Ozs7OztDQVFDLEdBQ00sU0FBU0ksY0FDZEMsT0FBZSxFQUNmTixTQUFTLEdBQUcsRUFDWk8sVUFBd0IsSUFBSSxFQUM1Qk4sVUFBdUIsQ0FBQyxDQUFDO0lBRXpCLE9BQU9WLHFEQUFZQSxDQUFDVyxJQUFJLENBQ3RCO1FBQ0VNLE9BQU9GO1FBQ1AsR0FBSUMsV0FBVztZQUFFQTtRQUFRLENBQUM7SUFDNUIsR0FDQTtRQUNFUDtRQUNBQyxTQUFTO1lBQUUsR0FBR1QsV0FBVztZQUFFLEdBQUdDLGFBQWFDLE9BQU87WUFBRSxHQUFHTyxPQUFPO1FBQUM7SUFDakU7QUFFSjtBQUVBOztDQUVDLEdBQ00sTUFBTVEsV0FBVztJQUN0QkMsY0FBYyxDQUFDSDtRQUNiLE1BQU1JLE1BQU1OLGNBQWMsZ0JBQWdCLEtBQUtFO1FBQy9DLE9BQU9LLE9BQU9DLE1BQU0sQ0FBQ0YsS0FBSztZQUN4QkcsVUFBVSxJQUFNSDtRQUNsQjtJQUNGO0lBRUFJLFVBQVUsQ0FBQ1QsVUFBVSxvQkFBb0IsRUFBRUM7UUFDekMsTUFBTUksTUFBTU4sY0FBY0MsU0FBUyxLQUFLQztRQUN4QyxPQUFPSyxPQUFPQyxNQUFNLENBQUNGLEtBQUs7WUFDeEJHLFVBQVUsSUFBTUg7UUFDbEI7SUFDRjtJQUVBSyxZQUFZLENBQUNWLFVBQVUsYUFBYSxFQUFFQztRQUNwQyxNQUFNSSxNQUFNTixjQUFjQyxTQUFTLEtBQUtDO1FBQ3hDLE9BQU9LLE9BQU9DLE1BQU0sQ0FBQ0YsS0FBSztZQUN4QkcsVUFBVSxJQUFNSDtRQUNsQjtJQUNGO0lBRUFNLFdBQVcsQ0FBQ1gsVUFBVSxXQUFXLEVBQUVDO1FBQ2pDLE1BQU1JLE1BQU1OLGNBQWNDLFNBQVMsS0FBS0M7UUFDeEMsT0FBT0ssT0FBT0MsTUFBTSxDQUFDRixLQUFLO1lBQ3hCRyxVQUFVLElBQU1IO1FBQ2xCO0lBQ0Y7SUFFQU8sZUFBZSxDQUFDWDtRQUNkLE1BQU1JLE1BQU1OLGNBQWMseUJBQXlCLEtBQUtFO1FBQ3hELE9BQU9LLE9BQU9DLE1BQU0sQ0FBQ0YsS0FBSztZQUN4QkcsVUFBVSxJQUFNSDtRQUNsQjtJQUNGO0lBRUFRLG9CQUFvQixDQUFDWjtRQUNuQixNQUFNSSxNQUFNTixjQUFjLG1DQUFtQyxLQUFLRTtRQUNsRSxPQUFPSyxPQUFPQyxNQUFNLENBQUNGLEtBQUs7WUFDeEJHLFVBQVUsSUFBTUg7UUFDbEI7SUFDRjtBQUNGLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9icmllZi1zdXBwb3J0Ly4vc3JjL2xpYi9hcGktcmVzcG9uc2UudHM/YTUwZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcblxuZXhwb3J0IHR5cGUgRXJyb3JEZXRhaWxzID0gc3RyaW5nIHwgUmVjb3JkPHN0cmluZywgYW55PiB8IG51bGxcblxuLyoqXG4gKiBTdGFuZGFyZCBDT1JTIGhlYWRlcnMgZm9yIEFQSSByZXNwb25zZXNcbiAqL1xuZXhwb3J0IGNvbnN0IGNvcnNIZWFkZXJzID0ge1xuICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJyxcbiAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uJyxcbn1cblxuLyoqXG4gKiBDYWNoZSBjb250cm9sIHByZXNldHMgZm9yIEFQSSByZXNwb25zZXNcbiAqL1xuZXhwb3J0IGNvbnN0IGNhY2hlUHJlc2V0cyA9IHtcbiAgLy8gTm8gY2FjaGluZ1xuICBub1N0b3JlOiB7XG4gICAgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tc3RvcmUsIG5vLWNhY2hlLCBtdXN0LXJldmFsaWRhdGUsIHByb3h5LXJldmFsaWRhdGUnLFxuICAgICdQcmFnbWEnOiAnbm8tY2FjaGUnLFxuICAgICdFeHBpcmVzJzogJzAnLFxuICB9LFxuICAvLyBTaG9ydCBjYWNoZSBmb3IgZHluYW1pYyBkYXRhIHRoYXQgdXBkYXRlcyBmcmVxdWVudGx5XG4gIHNob3J0OiB7XG4gICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTYwLCBzLW1heGFnZT02MCwgc3RhbGUtd2hpbGUtcmV2YWxpZGF0ZT0zMDAnLFxuICB9LFxuICAvLyBNZWRpdW0gY2FjaGUgZm9yIGRhdGEgdGhhdCB1cGRhdGVzIG9jY2FzaW9uYWxseVxuICBtZWRpdW06IHtcbiAgICAnQ2FjaGUtQ29udHJvbCc6ICdwdWJsaWMsIG1heC1hZ2U9MzAwLCBzLW1heGFnZT02MDAsIHN0YWxlLXdoaWxlLXJldmFsaWRhdGU9MTgwMCcsXG4gIH0sIFxuICAvLyBMb25nIGNhY2hlIGZvciBkYXRhIHRoYXQgcmFyZWx5IGNoYW5nZXNcbiAgbG9uZzoge1xuICAgICdDYWNoZS1Db250cm9sJzogJ3B1YmxpYywgbWF4LWFnZT0zNjAwLCBzLW1heGFnZT04NjQwMCwgc3RhbGUtd2hpbGUtcmV2YWxpZGF0ZT04NjQwMCcsXG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RhbmRhcmRpemVkIHN1Y2Nlc3MgcmVzcG9uc2VcbiAqIFxuICogQHBhcmFtIGRhdGEgLSBUaGUgZGF0YSB0byByZXR1cm4gaW4gdGhlIHJlc3BvbnNlXG4gKiBAcGFyYW0gc3RhdHVzIC0gSFRUUCBzdGF0dXMgY29kZSAoZGVmYXVsdDogMjAwKVxuICogQHBhcmFtIGhlYWRlcnMgLSBBZGRpdGlvbmFsIGhlYWRlcnMgdG8gaW5jbHVkZVxuICogQHJldHVybnMgTmV4dFJlc3BvbnNlIHdpdGggc3RhbmRhcmRpemVkIHN1Y2Nlc3MgZm9ybWF0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzUmVzcG9uc2UoXG4gIGRhdGE6IGFueSwgXG4gIHN0YXR1cyA9IDIwMCwgXG4gIGhlYWRlcnM6IEhlYWRlcnNJbml0ID0ge31cbik6IE5leHRSZXNwb25zZSB7XG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihkYXRhLCB7XG4gICAgc3RhdHVzLFxuICAgIGhlYWRlcnM6IHsgLi4uY29yc0hlYWRlcnMsIC4uLmhlYWRlcnMgfSxcbiAgfSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgY2FjaGVkIHN1Y2Nlc3MgcmVzcG9uc2Ugd2l0aCBhcHByb3ByaWF0ZSBjYWNoZSBoZWFkZXJzXG4gKiBcbiAqIEBwYXJhbSBkYXRhIC0gVGhlIGRhdGEgdG8gcmV0dXJuIGluIHRoZSByZXNwb25zZVxuICogQHBhcmFtIGNhY2hlVHlwZSAtIENhY2hlIHByZXNldCB0byB1c2UgKHNob3J0LCBtZWRpdW0sIGxvbmcpXG4gKiBAcGFyYW0gc3RhdHVzIC0gSFRUUCBzdGF0dXMgY29kZSAoZGVmYXVsdDogMjAwKVxuICogQHBhcmFtIGhlYWRlcnMgLSBBZGRpdGlvbmFsIGhlYWRlcnMgdG8gaW5jbHVkZVxuICogQHJldHVybnMgTmV4dFJlc3BvbnNlIHdpdGggc3RhbmRhcmRpemVkIHN1Y2Nlc3MgZm9ybWF0IGFuZCBjYWNoaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWNoZWRTdWNjZXNzUmVzcG9uc2UoXG4gIGRhdGE6IGFueSxcbiAgY2FjaGVUeXBlOiBrZXlvZiB0eXBlb2YgY2FjaGVQcmVzZXRzID0gJ3Nob3J0JyxcbiAgc3RhdHVzID0gMjAwLFxuICBoZWFkZXJzOiBIZWFkZXJzSW5pdCA9IHt9XG4pOiBOZXh0UmVzcG9uc2Uge1xuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oZGF0YSwge1xuICAgIHN0YXR1cyxcbiAgICBoZWFkZXJzOiB7IFxuICAgICAgLi4uY29yc0hlYWRlcnMsIFxuICAgICAgLi4uY2FjaGVQcmVzZXRzW2NhY2hlVHlwZV0sIFxuICAgICAgLi4uaGVhZGVycyBcbiAgICB9LFxuICB9KVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzdGFuZGFyZGl6ZWQgZXJyb3IgcmVzcG9uc2VcbiAqIFxuICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgZXJyb3IgbWVzc2FnZVxuICogQHBhcmFtIHN0YXR1cyAtIEhUVFAgc3RhdHVzIGNvZGUgKGRlZmF1bHQ6IDUwMClcbiAqIEBwYXJhbSBkZXRhaWxzIC0gQWRkaXRpb25hbCBlcnJvciBkZXRhaWxzIChvcHRpb25hbClcbiAqIEBwYXJhbSBoZWFkZXJzIC0gQWRkaXRpb25hbCBoZWFkZXJzIHRvIGluY2x1ZGVcbiAqIEByZXR1cm5zIE5leHRSZXNwb25zZSB3aXRoIHN0YW5kYXJkaXplZCBlcnJvciBmb3JtYXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yUmVzcG9uc2UoXG4gIG1lc3NhZ2U6IHN0cmluZyxcbiAgc3RhdHVzID0gNTAwLFxuICBkZXRhaWxzOiBFcnJvckRldGFpbHMgPSBudWxsLFxuICBoZWFkZXJzOiBIZWFkZXJzSW5pdCA9IHt9XG4pOiBOZXh0UmVzcG9uc2Uge1xuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAge1xuICAgICAgZXJyb3I6IG1lc3NhZ2UsXG4gICAgICAuLi4oZGV0YWlscyAmJiB7IGRldGFpbHMgfSksXG4gICAgfSxcbiAgICB7XG4gICAgICBzdGF0dXMsXG4gICAgICBoZWFkZXJzOiB7IC4uLmNvcnNIZWFkZXJzLCAuLi5jYWNoZVByZXNldHMubm9TdG9yZSwgLi4uaGVhZGVycyB9LFxuICAgIH1cbiAgKVxufVxuXG4vKipcbiAqIENvbW1vbiBlcnJvciByZXNwb25zZXNcbiAqL1xuZXhwb3J0IGNvbnN0IEFwaUVycm9yID0ge1xuICBVbmF1dGhvcml6ZWQ6IChkZXRhaWxzPzogRXJyb3JEZXRhaWxzKSA9PiB7XG4gICAgY29uc3QgcmVzID0gZXJyb3JSZXNwb25zZSgnVW5hdXRob3JpemVkJywgNDAxLCBkZXRhaWxzKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihyZXMsIHtcbiAgICAgIHJlc3BvbnNlOiAoKSA9PiByZXNcbiAgICB9KTtcbiAgfSxcbiAgXG4gIE5vdEZvdW5kOiAobWVzc2FnZSA9ICdSZXNvdXJjZSBub3QgZm91bmQnLCBkZXRhaWxzPzogRXJyb3JEZXRhaWxzKSA9PiB7XG4gICAgY29uc3QgcmVzID0gZXJyb3JSZXNwb25zZShtZXNzYWdlLCA0MDQsIGRldGFpbHMpO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHJlcywge1xuICAgICAgcmVzcG9uc2U6ICgpID0+IHJlc1xuICAgIH0pO1xuICB9LFxuICBcbiAgQmFkUmVxdWVzdDogKG1lc3NhZ2UgPSAnQmFkIHJlcXVlc3QnLCBkZXRhaWxzPzogRXJyb3JEZXRhaWxzKSA9PiB7XG4gICAgY29uc3QgcmVzID0gZXJyb3JSZXNwb25zZShtZXNzYWdlLCA0MDAsIGRldGFpbHMpO1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHJlcywge1xuICAgICAgcmVzcG9uc2U6ICgpID0+IHJlc1xuICAgIH0pO1xuICB9LFxuXG4gIEZvcmJpZGRlbjogKG1lc3NhZ2UgPSAnRm9yYmlkZGVuJywgZGV0YWlscz86IEVycm9yRGV0YWlscykgPT4ge1xuICAgIGNvbnN0IHJlcyA9IGVycm9yUmVzcG9uc2UobWVzc2FnZSwgNDAzLCBkZXRhaWxzKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihyZXMsIHtcbiAgICAgIHJlc3BvbnNlOiAoKSA9PiByZXNcbiAgICB9KTtcbiAgfSxcbiAgXG4gIEludGVybmFsRXJyb3I6IChkZXRhaWxzPzogRXJyb3JEZXRhaWxzKSA9PiB7XG4gICAgY29uc3QgcmVzID0gZXJyb3JSZXNwb25zZSgnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgNTAwLCBkZXRhaWxzKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihyZXMsIHtcbiAgICAgIHJlc3BvbnNlOiAoKSA9PiByZXNcbiAgICB9KTtcbiAgfSxcbiAgXG4gIFNlcnZpY2VVbmF2YWlsYWJsZTogKGRldGFpbHM/OiBFcnJvckRldGFpbHMpID0+IHtcbiAgICBjb25zdCByZXMgPSBlcnJvclJlc3BvbnNlKCdTZXJ2aWNlIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlJywgNTAzLCBkZXRhaWxzKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihyZXMsIHtcbiAgICAgIHJlc3BvbnNlOiAoKSA9PiByZXNcbiAgICB9KTtcbiAgfVxufSAiXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiY29yc0hlYWRlcnMiLCJjYWNoZVByZXNldHMiLCJub1N0b3JlIiwic2hvcnQiLCJtZWRpdW0iLCJsb25nIiwic3VjY2Vzc1Jlc3BvbnNlIiwiZGF0YSIsInN0YXR1cyIsImhlYWRlcnMiLCJqc29uIiwiY2FjaGVkU3VjY2Vzc1Jlc3BvbnNlIiwiY2FjaGVUeXBlIiwiZXJyb3JSZXNwb25zZSIsIm1lc3NhZ2UiLCJkZXRhaWxzIiwiZXJyb3IiLCJBcGlFcnJvciIsIlVuYXV0aG9yaXplZCIsInJlcyIsIk9iamVjdCIsImFzc2lnbiIsInJlc3BvbnNlIiwiTm90Rm91bmQiLCJCYWRSZXF1ZXN0IiwiRm9yYmlkZGVuIiwiSW50ZXJuYWxFcnJvciIsIlNlcnZpY2VVbmF2YWlsYWJsZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/api-response.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/prisma.ts":
/*!***************************!*\
  !*** ./src/lib/prisma.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   client: () => (/* binding */ client),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\n// Make sure DATABASE_URL is available\nif (!process.env.DATABASE_URL) {\n    console.error(\"DATABASE_URL is not defined, setting fallback for build process\");\n    // Set a placeholder URL for build processes that doesn't expose credentials\n    process.env.DATABASE_URL = \"postgresql://placeholder_user:placeholder_password@placeholder_host/placeholder_db?sslmode=require\";\n}\nconst globalForPrisma = global;\n// Initialize with logging in dev mode to debug connection issues\nconst prismaOptions =  true ? {\n    log: [\n        {\n            level: \"query\",\n            emit: \"event\"\n        },\n        {\n            level: \"info\",\n            emit: \"stdout\"\n        },\n        {\n            level: \"warn\",\n            emit: \"stdout\"\n        },\n        {\n            level: \"error\",\n            emit: \"stdout\"\n        }\n    ]\n} : 0;\nconst prisma = globalForPrisma.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient(prismaOptions);\nconst client = prisma;\nif (true) globalForPrisma.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3ByaXNtYS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFxRDtBQVFyRCxzQ0FBc0M7QUFDdEMsSUFBSSxDQUFDQyxRQUFRQyxHQUFHLENBQUNDLFlBQVksRUFBRTtJQUM3QkMsUUFBUUMsS0FBSyxDQUFDO0lBQ2QsNEVBQTRFO0lBQzVFSixRQUFRQyxHQUFHLENBQUNDLFlBQVksR0FBRztBQUM3QjtBQUVBLE1BQU1HLGtCQUFrQkM7QUFFeEIsaUVBQWlFO0FBQ2pFLE1BQU1DLGdCQUE0Q1AsS0FBeUIsR0FDdkU7SUFBRVEsS0FBSztRQUNMO1lBQUVDLE9BQU87WUFBU0MsTUFBTTtRQUFRO1FBQ2hDO1lBQUVELE9BQU87WUFBUUMsTUFBTTtRQUFTO1FBQ2hDO1lBQUVELE9BQU87WUFBUUMsTUFBTTtRQUFTO1FBQ2hDO1lBQUVELE9BQU87WUFBU0MsTUFBTTtRQUFTO0tBQ2xDO0FBQUEsSUFDRCxDQUFFO0FBRUMsTUFBTUMsU0FBU04sZ0JBQWdCTSxNQUFNLElBQUksSUFBSVosd0RBQVlBLENBQUNRLGVBQXNDO0FBQ2hHLE1BQU1LLFNBQVNELE9BQU07QUFFNUIsSUFBSVgsSUFBeUIsRUFBY0ssZ0JBQWdCTSxNQUFNLEdBQUdBO0FBRXBFLGlFQUFlQSxNQUFNQSxFQUFBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYnJpZWYtc3VwcG9ydC8uL3NyYy9saWIvcHJpc21hLnRzPzAxZDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50LCBQcmlzbWEgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcblxuLy8gRGVmaW5lIGV4dGVuZGVkIGNsaWVudCB0eXBlIHRoYXQgaW5jbHVkZXMgb3VyIG1vZGVsc1xuaW50ZXJmYWNlIEV4dGVuZGVkUHJpc21hQ2xpZW50IGV4dGVuZHMgUHJpc21hQ2xpZW50IHtcbiAgY3VzdG9tZXJGZWVkYmFjazogYW55O1xuICBuZXdzbGV0dGVyU3Vic2NyaWJlcjogYW55O1xufVxuXG4vLyBNYWtlIHN1cmUgREFUQUJBU0VfVVJMIGlzIGF2YWlsYWJsZVxuaWYgKCFwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwpIHtcbiAgY29uc29sZS5lcnJvcignREFUQUJBU0VfVVJMIGlzIG5vdCBkZWZpbmVkLCBzZXR0aW5nIGZhbGxiYWNrIGZvciBidWlsZCBwcm9jZXNzJyk7XG4gIC8vIFNldCBhIHBsYWNlaG9sZGVyIFVSTCBmb3IgYnVpbGQgcHJvY2Vzc2VzIHRoYXQgZG9lc24ndCBleHBvc2UgY3JlZGVudGlhbHNcbiAgcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMID0gJ3Bvc3RncmVzcWw6Ly9wbGFjZWhvbGRlcl91c2VyOnBsYWNlaG9sZGVyX3Bhc3N3b3JkQHBsYWNlaG9sZGVyX2hvc3QvcGxhY2Vob2xkZXJfZGI/c3NsbW9kZT1yZXF1aXJlJztcbn1cblxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsIGFzIHVua25vd24gYXMgeyBwcmlzbWE6IEV4dGVuZGVkUHJpc21hQ2xpZW50IH1cblxuLy8gSW5pdGlhbGl6ZSB3aXRoIGxvZ2dpbmcgaW4gZGV2IG1vZGUgdG8gZGVidWcgY29ubmVjdGlvbiBpc3N1ZXNcbmNvbnN0IHByaXNtYU9wdGlvbnM6IFByaXNtYS5QcmlzbWFDbGllbnRPcHRpb25zID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJ1xuICA/IHsgbG9nOiBbXG4gICAgICB7IGxldmVsOiAncXVlcnknLCBlbWl0OiAnZXZlbnQnIH0sXG4gICAgICB7IGxldmVsOiAnaW5mbycsIGVtaXQ6ICdzdGRvdXQnIH0sXG4gICAgICB7IGxldmVsOiAnd2FybicsIGVtaXQ6ICdzdGRvdXQnIH0sXG4gICAgICB7IGxldmVsOiAnZXJyb3InLCBlbWl0OiAnc3Rkb3V0JyB9LFxuICAgIF19XG4gIDoge307XG5cbmV4cG9ydCBjb25zdCBwcmlzbWEgPSBnbG9iYWxGb3JQcmlzbWEucHJpc21hIHx8IG5ldyBQcmlzbWFDbGllbnQocHJpc21hT3B0aW9ucykgYXMgRXh0ZW5kZWRQcmlzbWFDbGllbnRcbmV4cG9ydCBjb25zdCBjbGllbnQgPSBwcmlzbWFcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWFcblxuZXhwb3J0IGRlZmF1bHQgcHJpc21hXG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwicHJvY2VzcyIsImVudiIsIkRBVEFCQVNFX1VSTCIsImNvbnNvbGUiLCJlcnJvciIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbCIsInByaXNtYU9wdGlvbnMiLCJsb2ciLCJsZXZlbCIsImVtaXQiLCJwcmlzbWEiLCJjbGllbnQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/prisma.ts\n");

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
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/node-fetch-native","vendor-chunks/next","vendor-chunks/@clerk","vendor-chunks/@peculiar","vendor-chunks/asn1js","vendor-chunks/webcrypto-core","vendor-chunks/tslib","vendor-chunks/pvtsutils","vendor-chunks/pvutils","vendor-chunks/deepmerge","vendor-chunks/map-obj","vendor-chunks/no-case","vendor-chunks/lower-case","vendor-chunks/snake-case","vendor-chunks/dot-case","vendor-chunks/node-fetch","vendor-chunks/pusher-js","vendor-chunks/tweetnacl","vendor-chunks/pusher","vendor-chunks/event-target-shim","vendor-chunks/abort-controller","vendor-chunks/tweetnacl-util","vendor-chunks/is-base64"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fnotifications%2Froute&page=%2Fapi%2Fnotifications%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fnotifications%2Froute.ts&appDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Ffattouh999%2FDocuments%2FGitHub%2FNew-folder&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=standalone&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();