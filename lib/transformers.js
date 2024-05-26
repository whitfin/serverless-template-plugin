const _ = require('lodash');
const delegates = [
    'camelCase',
    'capitalize',
    'escape',
    'escapeRegExp',
    'kebabCase',
    'lowerCase',
    'lowerFirst',
    'snakeCase',
    'startCase',
    'unescape',
    'upperCase',
    'upperFirst'
];

// map all delegates to lodash
for (let delegate of delegates) {
    module.exports[':' + delegate] = _[delegate];
}

// add our default transformers
module.exports[''] = value => value;
module.exports[':lower'] = value => value.toLowerCase();
module.exports[':upper'] = value => value.toUpperCase();
