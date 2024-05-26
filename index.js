const fs = require('fs').promises;
const transformers = require('./lib/transformers');

/**
 * Small templating plugin for Serverless CloudFormation resources.
 */
class ServerlessTemplatePlugin {

    /**
     * Initialize this plugin instance.
     */
    constructor() {
        this.configurationVariablesSources = {
            template: {
                resolve: options => {
                    return this.resolve(options);
                },
            },
        };
    }

    /**
     * Resolves the `${template(path):params}` syntax to an object.
     *
     * @param {object} options
     * @returns
     *      an object of the parsed template content.
     */
    async resolve(options) {
        // flip the params around
        let params = options.address || '';
        let address = options.params[0];
        let separator = options.params[1] || /\s+/;

        // read the file and convert to string
        let buffer = await fs.readFile(address);
        let content = buffer.toString();

        // map all the param pairs into a list of replacers
        let replacers = params.split(separator).flatMap(function (pair) {

            // skip any invalid pairs
            let parts = pair.split('=');
            if (parts.length !== 2) {
                return [];
            }

            // unpack pair
            let key = parts[0];
            let value = parts[1];

            // convert every transformer to a pattern and new value to inject
            return Object.entries(transformers).map(function ([name, modifier]) {
                return [
                    new RegExp(String.raw`\$\{${key.trim()}${name}\}`, 'g'),
                    modifier(value)
                ];
            });
        });

        // run a replace with every pattern
        for (let [pattern, value] of replacers) {
            content = content.replace(pattern, value);
        }

        // parse the content using the Serverless parser
        let parse = require('serverless/lib/utils/fs/parse');
        let parsed = parse(address, content);

        // pass back the content
        return { value: parsed  };
    }
}

// export the plugin for Serverless
module.exports = ServerlessTemplatePlugin;
