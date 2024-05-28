const _ = require('lodash');

// add our default transformers
module.exports[''] = value => value;
module.exports[':lower'] = value => value.toLowerCase();
module.exports[':upper'] = value => value.toUpperCase();
module.exports[':pascal'] = value => _.upperFirst(_.camelCase(value));

// delegate function for _
function delegate(from, to) {
    module.exports[':' + from] = _[to || from];
}

// straight delegates
delegate('capitalize');
delegate('escape');
delegate('escapeRegExp');
delegate('lowerFirst');
delegate('unescape');
delegate('upperFirst');

// shorthand for case types
delegate('camel', 'camelCase');
delegate('kebab', 'kebabCase');
delegate('snake', 'snakeCase');
delegate('start', 'startCase');

// cleaner naming for this library
delegate('lowerWords', 'lowerCase');
delegate('upperWords', 'upperCase');

// backwards compat
delegate('camelCase');
delegate('kebabCase');
delegate('lowerCase');
delegate('snakeCase');
delegate('startCase');
delegate('upperCase');
