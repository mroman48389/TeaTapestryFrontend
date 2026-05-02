/* Babel is needed just for Jest. ts-jest transforms TypeScript 
   but does not transform ESM in node-modules. d3 is pure ESM, 
   so we need Babel to transform it (either that, or we need
   to mock our tests, which is less-than-ideal).
   
   This file must be a .cjs file because we are using type: module
   in package.json, and Jest does not support ESM Babel config
   files. */
// export default {
//     presets: [
//         ["@babel/preset-env", { targets: { node: "curSrent" } }],
//         ["@babel/preset-react", { runtime: "automatic" }],
//         "@babel/preset-typescript"
//     ]
// };

module.exports = {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }],
        "@babel/preset-typescript"
    ],
};
