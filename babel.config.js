/* Babel is needed just for Jest. ts-jest transforms TypeScript 
   but does not transform ESM in node-modules. d3 is pure ESM, 
   so we need Babel to transform it (either that, or we need
   to mock our tests, which is less-than-ideal). */
export default {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }],
        "@babel/preset-typescript"
    ]
};
