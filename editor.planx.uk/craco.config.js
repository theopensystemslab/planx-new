const CracoEsbuildPlugin = require("craco-esbuild");
const sassResourcesLoader = require("craco-sass-resources-loader");

module.exports = {
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
    },
    { plugin: sassResourcesLoader,
      options: {
        resources: [
          'src/pages/FlowEditor/floweditor.scss'
        ]
      }},
  ],
};
