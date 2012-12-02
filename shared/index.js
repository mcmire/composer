
/*
if (typeof define === 'undefined') {
  function define(name, definition) {
    var _require, _module
    //if (env == 'node') {
      //_require = nodeRequire
      //_module = nodeModule
      //definition(_require, _module.exports, _module)
    //} else {
      _require = composer.require
      _module = {}
      definition(_require, null, _module)
      composer[name] = _module.exports
    //}
  }
}
*/

if (typeof require === 'undefined') {
  // browser only
  function require(name) {
    var mod = composer[name.replace(/^\.\//, "")] || window[name]
    if (!mod) throw new Error("Couldn't find module '" + name + "'")
    return mod
  }
}

