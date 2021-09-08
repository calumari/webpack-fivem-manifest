const { defaults } = require('lodash');
const path = require('path');

const defaultOptions = {
  itemsFromCompilation: compilation => Object.keys(compilation.assets),
  output: '../fxmanifest.lua',
};

function ResourceManifestPlugin(options) {
  defaults(this, options, defaultOptions);
}

const pluginName = 'fivem-manifest-plugin';

ResourceManifestPlugin.prototype.apply = function(compiler) {
  const { itemsFromCompilation, output } = this;
  compiler.hooks.emit.tap(pluginName, compilation => {
    const assets = itemsFromCompilation(compilation);
    const result = format(
      assets,
      compilation.options.output.path.split('\\').pop(),
    );
    compilation.assets[output] = {
      source: () => Buffer.from(result),
      size: () => Buffer.byteLength(result),
    };
  });
};

function format(assets, path) {
  return `
  name 'resource name'
  fx_version 'cerulean'
  games { 'gta5', 'rdr3 }
  
  shared_scripts { 'config.lua' }
  client_scripts { 'client.lua' }
  server_scripts { 'server.lua' }
  
  ui_page "${path}/index.html"

files{${assets.map(asset => `"${path}/${asset}"`).join(',')}}
  `;
}

module.exports = ResourceManifestPlugin;
