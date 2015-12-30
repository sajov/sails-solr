![](http://i.imgur.com/RIvu9.png | width=50)

# <img src="http://lucene.apache.org/solr/assets/identity/Solr_Logo_on_white.png"width="100"/> waterline-solr

Provides easy access to `solr` from Sails.js & Waterline.

This module is a Waterline/Sails adapter, an early implementation of a rapidly-developing, tool-agnostic data standard.  Its goal is to provide a set of declarative interfaces, conventions, and best-practices for integrating with all sorts of data sources.  Not just databases-- external APIs, proprietary web services, or even hardware.

Strict adherence to an adapter specification enables the (re)use of built-in generic test suites, standardized documentation, reasonable expectations around the API for your users, and overall, a more pleasant development experience for everyone.


## Table of Contents

* [Installation](#installation)
* [Getting Started](introduction/getting-started-with-waterline-solr.md)
* [Supported Interfaces](#supported-interfaces)
* [Special Interfaces](#special-interfaces)
* [Models](models/models.md)
  * [Data types & attribute properties](models/data-types-attributes.md)
  * [Configuration](models/configuration.md)
* [Queries](queries/query.md)
  * [Query Language](queries/query-language.md)
  * [Query Methods](queries/query-methods.md)
* [How Solr is used](#how-solr-is-used)
* [Testing](testing/testing.md)
* [Integration](integration/integration.md)
  * [Sails](integration/sails.md)
* [Examples](examples/examples.md)
* [Roadmap](ROADMAP.md)
* [Contributing](CONTRIBUTING.md)

### Installation

To install this adapter, run:
```sh
$ npm install waterline-solr
```


### Getting started with waterline-solr
To install/start solr if you not have one running
```
make kickstart
```
> **Note**: not recommended for production systems! see [Solr installation Tomcat](http://cwiki.solr.com/) for more

#### Configuring Connections
Add the `solr` configuration to the `config/connections.js` file. The basic
options are as follows:

```javascript
module.exports.connections = {
  solrConnectionOne: {
    module : 'waterline-solr',
    host: 'localhost',
    port: 8983,
    core: 'schemaless',
    schema: true,
    migrate: 'drop'
  }
};
```

> **Note**: you can define multiple solr connections/cores.
> By default waterline-solr will run multiple models inside one core `manageCores`. [Connection Options](#connection-options)

#### Configuring Models
And then change default model configuration to the config/models.js:
```
module.exports.models = {
  connection: 'solrConnectionOne',
  attributes: {
    name:'string'
    ...
  }
};
```
> **Note**: you can add more model based configuartion [Model Options](#model-options) / [Connection Options](#connection-options)

#### Usage
create a user:
```
  User.create({name:'foo'},console)
```
find a user:
```
  User.find({name:'foo'},console);
  User.findOne({name:'foo'},console);
  User.findByName('foo',console);
```
> **Note**: See Waterline Documentation [Query Language](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-language.md) and [Query Methods](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-methods.md)


#### Special Adapter Interfaces
search suggestion for Autocompleter:
```
  User.suggest({name:'foo'},console);
```

spellcheck given phrase. Known as "Did You Mean: `foo`?":
```
  User.spellcheck({name:'foo'},console);
```

get Layerd Navigaten. Well known as filter. You get `facet` elements for `strings` and `min,max,avg` to build `range slider elemets. [Query Methods](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-methods.md)
```
  User.layerdnav({name:'foo'},console);
```

### Supported Interfaces
> Implements:
> - [Semantic](https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md#semantic-interface)
>   - .create()
>   - .createEach()
>   - .find()
>   - .count()
>   - .update()
>   - .destroy()
> - [Queryable](https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md#migratable-interface)[![Build Status](https://travis-ci.org/balderdashy/waterline-schema.svg?branch=master)](https://travis-ci.org/balderdashy/waterline-schema)
> - [Migratable](https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md#migratable-interface)
>   - .define()
>   - .describe()
>   - .drop()
> - [Iterable](https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md#iterable-interface)
>   - .stream()
> - Non-standard
>   - .query()

### Special Interfaces
> Suggest:
>   - .suggest()
>   - .createEach()
>   - 
> Spellcheck:
>   - .spellcheck()
> Layered Navigation:
>   - .layerdnavigation()

| Repo          |  Build Status (edge)                  |  Latest Stable Version   |
|---------------|---------------------------------------|--------------------------|
| [**solr-hyperquest-client**](http://github.com/sajov/solr-hyperquest-client) | [![Build Status](https://travis-ci.org/sajov/solr-hyperquest-client.svg?branch=master)](https://travis-ci.org/sajov/solr-hyperquest-client) | [![Coverage Status](https://coveralls.io/repos/sajov/solr-hyperquest-client/badge.svg?branch=master&service=github)](https://coveralls.io/github/sajov/solr-hyperquest-client?branch=master)
[![Dependency Status](https://david-dm.org/sajov/solr-hyperquest-client.svg)](https://david-dm.org/jsdoc2md/solr-hyperquest-client) |



## Connection Options
| Params               | Default     | Description                       |
|:---------------------|:------------|:----------------------------------|
| host                 | 'localhost' |                                   |
| port                 | '8983'      |                                   |
| core                 | 'schemaless'|                                   |
| manageCores          | true        | create cores if not exists [CoreAdmin](https://cwiki.apache.org/confluence/display/solr/CoreAdmin+API)                                  |
| schema               | true       | allow `migrate` [drop, alter](https://github.com/balderdashy/sails-docs/blob/master/concepts/ORM/model-settings.md#migrate) schema [manage schema](https://cwiki.apache.org/confluence/display/solr/Managed+Schema+Definition+in+SolrConfig)                                  |
| single               | false       |  force `manageCores` to create a core for each model                                 |
| fieldTypeMap         | fieldTypes  |  [Field Type Map](#field-type-map)                                 |
| useFqParam           | true        |  force query mapping as `fq=name:foo` param                                |
| schemaDefaultFieldTypes| {}|                                   |
| debugAdapter         | false       |                                   |
| debugCollection      | false       |                                   |
| debugQuery           | false       |                                   |
| debugSolr            | false       |                                   |


## Model Options
```
{
  attributes: {
    first_name: {
      type:'string'
      // Overwrite per Field
      schemaDefaultFieldAttributes: {
        indexed: true,
        type: 'text_de'
      }
    }
  }
  // Overwrite per Model
  schemaDefaultFieldAttributes: {
    indexed: false
  }
}
```


## Field Type Map
The following table represents mappings between Sails/Waterline model data types and Solr field types:

| Sails/Waterline Type | Solr Type    |
|:---------------------|:-------------|
| string               | text_general |
| text                 | text_general |
| binary               | text_general |
| integer              | int          |
| float                | float        |
| date                 | date         |
| time                 | date         |
| datetime             | date         |
| boolean              | boolean      |
| binary               | text_general |
| array                | text_general |
| json                 | text_general |


> **Note**: You can even define your custom mapping as `fieldTypeMap:` inside
> connection settings and as model option.
> If you want a field type explicit mapping use `fieldType` as additional 
> fieldTypeMapattribute

## Solr default field attributes
The following table represents Solr field attributes:

| Solr Field Attributes    | Default      |
|:-------------------------|:-------------|
| name                     | newField     |
| type                     | text_general |
| indexed                  | true         |
| stored                   | true         |
| docValues                | false        |
| sortMissingFirst         | false        |
| sortMissingLast          | false        |
| multiValued              | false        |
| omitNorms                | true         |
| omitTermFreqAndPositions | false        |
| omitPositions            | false        |
| termVectors              | true         |
| termPositions            | false        |
| termOffsets              | false        |
| termPayloads             | false        |
| required                 | false        |
| dynamicField             | false        |
| json                     | text_general |
| json                     | text_general |
| json                     | text_general |


> **Note**: You can even define your custom field attribute default as `schemaDefaultFieldAttributes:` inside
> connection settings and as model option.
> If you want a field attribute explicit you can add this attribute as an additional option inside the Model attribute settings

### Sails/Waterline Model 
```
{
  attributes: {
    first_name: {
      type:'string'
      // Overwrite per Field
      schemaDefaultFieldAttributes: {
        indexed: true,
        type: 'text_de'
      }
    }
  }
  // Overwrite per Model
  schemaDefaultFieldAttributes: {
    indexed: false
  }
}
```



### 4.4. Use of indexes
Apache Cassandra require index on a column that is used in `where` clause of
`select` statement and unlike other database it will produce and exception if
the index is missing.

Sails/Waterline allows to set `index` or `unique` properties on model
attributes. The `waterline-solr` adapter will respect these attributes and it
will create indexes for attributes with `index` or `unique` attributes set to
`true`.

> **Note**: that solr have no notion of `unique` constraint and
> the uniqueness has to be enforced either by Sails/Waterline core or in your
> own code. The `unique` attribute property is considered an alias for `index`
> and both are treated in the exactly same way.

### 4.5. Search criteria
Sole only supports subset of operation in selection criteria in
comparison to relational databases and this section describes what is currently
supported.


#### 4.5.1. Key Pairs
This is an exact match criteria and it is declared as follows:

```javascript
Model.find({firstName: 'Joe', lastName: 'Doe'});
```

Created request params:

```
params: {
      q: "*:*",
      fq: [
        firstName:Joe,
        lastName:Doe
      ]
}
```
Please also refer to [Use of Indexes](#44-use-of-indexes) above.


#### 4.5.2. Modified Pair
This criteria:

```javascript
Model.find({age: {'>': 18, 'lessThanOrEqual': 65});
```
Created request params:
```
params: {
      q: "*:*",
      fq: [
        age:[18 TO 65]
      ]
}
```
Please also refer to [Use of Indexes](#44-use-of-indexes) above.
and supported operations are as follows:

| Operation              | Shorthand | Supported |
|:-----------------------|:---------:|:---------:|
| `'lessThan'`           |  `'<'`    |    Yes    |
| `'lessThanOrEqual'`    |  `'<='`   |    Yes    |
| `'greaterThan'`        |  `'>'`    |    Yes    |
| `'greaterThanOrEqual'` |  `'>='`   |    Yes    |
| `'not'`                |  `'!'`    |  **No**   |
| `'like'`               |  `none`   |  **No**   |
| `'contains'`           |  `none`   |  **No**   |
| `'startsWith'`         |  `none`   |  **No**   |
| `'endsWith'`           |  `none`   |  **No**   |
| `'between'`            |  `none`   |  **Solr** |

    
#### 4.5.3. In Pairs
This criteria:

```javascript
Model.find({title: ['Mr', 'Mrs']});
```
Created request params:
```
params: {
      q: title:(Mr Mrs),
}
```
> **Note:** that `IN` criterion works differently in Apache Cassandra. It is
> subject of [certain limitations] and is considered a pattern to be avoided.

[certain limitations]: http://www.datastax.com/documentation/cql/3.1/cql/cql_reference/select_r.html?scroll=reference_ds_d35_v2q_xj__selectIN


#### 4.5.4. Not-In Pair
**Not supported** since Apache Cassandra does not support `NOT IN` criterion,
so this construct:

```javascript
Model.find({name: {'!': ['Walter', 'Skyler']}});
```

will cause adapter to throw an exception.


#### 4.5.5. Or Pairs
**Not supported** since Apache Cassandra has no `OR` criterion, so this construct:

```javascript
Model.find({
  or : [
    {name: 'walter'},
    {occupation: 'teacher'}
  ]
});
```

will cause the adapter to throw an exception.

#### 4.5.6. Limit, Sort, Skip
Only `limit` is curently implemented and works as expected. `sort` and `skip` are
not supported and silently ignored if provided.





>TODO:
>Specify the interfaces this adapter will support.
>e.g. `This adapter implements the [semantic]() and [queryable]() interfaces.`
> For more information, check out this repository's [FAQ](./FAQ.md) and the [adapter interface reference](https://github.com/balderdashy/sails-docs/blob/master/adapter-specification.md) in the Sails docs.


### Development

Check out **Connections** in the Sails docs, or see the `config/connections.js` file in a new Sails project for information on setting up adapters.

## Getting started
It's usually pretty easy to add your own adapters for integrating with proprietary systems or existing open APIs.  For most things, it's as easy as `require('some-module')` and mapping the appropriate methods to match waterline semantics.  To get started:

1. Fork this repository
2. Set up your `README.md` and `package.json` file.  Sails.js adapter module names are of the form sails-*, where * is the name of the datastore or service you're integrating with.
3. Build your adapter.




### Running the tests

Configure the interfaces you plan to support (and targeted version of Sails/Waterline) in the adapter's `package.json` file:

```javascript
{
  //...
  "sails": {
  	"adapter": {
	    "sailsVersion": "~0.10.0",
	    "implements": [
	      "semantic",
	      "queryable"
	    ]
	  }
  }
}
```

In your adapter's directory, run:

```sh
$ npm test
```


## Publish your adapter

> You're welcome to write proprietary adapters and use them any way you wish--
> these instructions are for releasing an open-source adapter.

1. Create a [new public repo](https://github.com/new) and add it as a remote (`git remote add origin git@github.com:yourusername/sails-youradaptername.git)
2. Make sure you attribute yourself as the author and set the license in the package.json to "MIT".
3. Run the tests one last time.
4. Do a [pull request to sails-docs](https://github.com/balderdashy/sails-docs/compare/) adding your repo to `data/adapters.js`.  Please let us know about any special instructions for usage/testing.
5. We'll update the documentation with information about your new adapter
6. Then everyone will adore you with lavish praises.  Mike might even send you jelly beans.

7. Run `npm version patch`
8. Run `git push && git push --tags`
9. Run `npm publish`



 -->
### Questions?

See [`FAQ.md`](./FAQ.md).



### More Resources

- [Solr](http://stackoverflow.com/questions/tagged/sails.js)
- [solr-hyperquest-client](http://webchat.freenode.net/) (IRC channel)
- [Waterline](https://twitter.com/sailsjs)
- [Sails](https://github.com/balderdashy/sails-docs/blob/master/FAQ.md#are-there-professional-support-options)


### License

**[MIT](./LICENSE)**



