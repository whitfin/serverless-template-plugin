# Serverless Template Plugin

[![Build Status](https://img.shields.io/github/actions/workflow/status/whitfin/serverless-template-plugin/ci.yml?branch=main)](https://github.com/whitfin/serverless-template-plugin/actions) [![Published Version](https://img.shields.io/npm/v/serverless-template-plugin.svg)](https://npmjs.com/package/serverless-template-plugin) [![Published Downloads](https://img.shields.io/npm/dt/serverless-template-plugin)](https://npmjs.com/package/serverless-template-plugin)

This repository contains a very small [Serverless](https://serverless.com) plugin
to enable re-use of small template files in larger CloudFormation templates.

This project is deliberately small, but things will be added as they're found to
be useful. Rather than using a templating engine, we use short replacements to
keep the CloudFormation template easy to understand.

## Installation

This plugin is available via npm, so it can be installed as usual:

```bash
$ npm i --save-dev serverless-template-plugin
```

There's no need to include it in your production bundle, so make sure it's saved
inside the development dependencies. Once installed, make sure to add it to your
Serverless plugins list:

```yaml
plugins:
  - serverless-template-plugin
```

The location within the plugin list shouldn't matter, as it's not reacting to
any specific Serverless events.

## Usage

The idea is to allow (minimal) templating via find/replace of values to avoid
having to continuously redefine them inside templates. This is done by including
a template file via the `template(path):replacements` syntax.

Replacements are separated by a spec in the form `param1=1 param2=2 param3=3`,
which leaves your template fairly easy to understand. You can then access these
replacements in your templated file via `${value}`.

```yaml
# Import file.yml and replace param1, param2 and param3
- template(./file.yml):param1=1 param2=2 param3=3}

# JSON is also supported in the same way as YAML
- template(./file.json):param1=1 param2=2 param3=3}

# If you want to use something that isn't a space
- template(./file.yml,&):param1=1&param2=2&param3=3}

# Whitespace is trimmed to allow better readability
- template(./file.yml,;):param1=1; param2=2; param3=3}
```

Just like the Serverless `file` directive, this plugin works with both `yml`
and `json` files. This is determined by the file extension provided, so please
make sure they match correctly.

## Simple Example

A really basic example to demonstrate how this should be used is the idea of
defining a database cluster with several instances. Typically this would
require that you write the same CloudFormation block multiple times, but now
it can be compressed:

```yaml
# templates/database-instance.yml
Resources:
  DatabaseInstance${id}:
    Type: AWS::DocDB::DBInstance
    Properties:
    DBClusterIdentifier: !Ref DatabaseCluster
    DBInstanceClass: db.t4g.medium

# serverless.yml
resources:
  # Create the database cluster
  - Resources:
      DatabaseCluster:
        Type: AWS::DocDB::DBCluster
        Properties:
          DBClusterIdentifier: ${self:service}-${sls:stage}-db
          MasterUsername: guy
          MasterUserPassword: fieri

  # Create 5 database instances inside our cluster
  - ${template(templates/database-instance.yml):id=1}
  - ${template(templates/database-instance.yml):id=2}
  - ${template(templates/database-instance.yml):id=3}
  - ${template(templates/database-instance.yml):id=4}
  - ${template(templates/database-instance.yml):id=5}
```

As you can see, this cuts down on a fair chunk of templating. It also makes
it much easier to keep things in sync; in cases where you might change the
instance class, you now only have to change it in a single place.

## Transformers

This plugin comes with some minimal string transformation to allow you to
tweak the replacement. These transformers can be accessed via the syntax
`${value:transfomer}` and are optional. Pretty much all of these transformers
are provided by [lodash](https://lodash.com) so you can check the docs there
for further details on how they work. The current list of transformers is
shown below:

| Transformer             | Description                                                        |
|-------------------------|--------------------------------------------------------------------|
| `${value:camel}`        | Converts the value to camelCase                                    |
| `${value:capitalize}`   | Converts the first letter to upper case and the rest to lower case |
| `${value:escape}`       | Converts HTML characters to HTML entities                          |
| `${value:escapeRegExp}` | Converts RegExp special characters to their escaped form           |
| `${value:kebab}`        | Converts the value to kebab-case                                   |
| `${value:lower}`        | Converts the value to lower case                                   |
| `${value:lowerFirst}`   | Converts the first character in the value to lower case            |
| `${value:lowerWords}`   | Converts the value to lower case separated by spaces               |
| `${value:pascal}`       | Converts the value to PascalCase                                   |
| `${value:snake}`        | Converts the value to snake_case                                   |
| `${value:start}`        | Converts the value to Start Case                                   |
| `${value:unescape}`     | Converts HTML entities to their corresponding characters           |
| `${value:upper}`        | Converts the value to UPPER CASE                                   |
| `${value:upperFirst}`   | Converts the first character in the value to upper case            |
| `${value:upperWords}`   | Converts the value to UPPER CASE separated by spaces               |

These can be added easily, so feel free to file PRs for things which can be
useful when creating templates.

## Compatibility

This plugin uses some Serverless internals for parsing of inputs, so it's
tied to the version of Serverless in use. I'm not sure of the exact range
of compatibility so please file an issue if it appears to not work with
your version of Serverless.
