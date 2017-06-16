![](http://i.imgur.com/RIvu9.png | width=50)

# <img src="http://lucene.apache.org/solr/assets/identity/Solr_Logo_on_white.png" width="100"/> sails-solr

Provides easy access to `solr` from [Sails.js](https://github.com/balderdashy/sails) & [Waterline](https://github.com/balderdashy/waterline/blob/master/README.md).

This module is a [Sails](https://github.com/balderdashy/sails)/[Waterline](https://github.com/balderdashy/waterline/blob/master/README.md) adapter, an early implementation of a rapidly-developing, tool-agnostic data standard.  Its goal is to provide a set of declarative interfaces, conventions, and best-practices for integrating with all sorts of data sources.

The main goal is a simple usage and integration of a full managed Solr.

[![Build Status](https://travis-ci.org/sajov/sails-solr.svg?branch=master)](https://travis-ci.org/sajov/sails-solr)
[![Coverage Status](https://coveralls.io/repos/sajov/sails-solr/badge.svg?branch=master&service=github)](https://coveralls.io/github/sajov/sails-solr?branch=master)
[![Dependency Status](https://david-dm.org/sajov/sails-solr.svg)](https://david-dm.org/jsdoc2md/sails-solr)

[![NPM](https://nodei.co/npm/sails-solr.png?downloads=true&stars=true)](https://nodei.co/npm/sails-solr/)

## Features
- [Waterline](https://github.com/balderdashy/waterline/blob/master/README.md) interface support for [Semantic, Migratable and Queryable](https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md)
- [Suggester](https://cwiki.apache.org/confluence/display/solr/Suggester) and [Spell checking](https://cwiki.apache.org/confluence/display/solr/Spell+Checking) for Autocomplete as Model Method and Shadow Route Action
- Catalog with Layerd Navigation (Range and Facet Filter) as Model Method and Shadow Route Action
- Solr [Config API](https://cwiki.apache.org/confluence/display/solr/Config+API) full solrconfig management
  - add, update SearchComponents
  - add, update RequestHandler
- Solr [Schema API](https://cwiki.apache.org/confluence/display/solr/Schema+API) full schema management
  - add, update fieldTypes
  - add, update Fields
  - add, update dynamicFields
  - add, update copyFields
- Multi Model at single Core
- Raw solr-hyperquest-client access

## Installation

To install this adapter, run:
```sh
$ npm install sails-solr
```


## Getting started with sails-solr
To install/start solr if you not have one running
```
make kickstart
```
> **Note**: not recommended for production systems! [Solr installation Tomcat](http://cwiki.solr.com/) for more

### Configuring Connections
Add the `solr` configuration to the `config/connections.js` file. The basic
options are as follows:

```javascript
module.exports.connections = {
  solrConnectionOne: {
    module : 'sails-solr',
    host: 'localhost',
    port: 8983,
    core: 'schemaless',
    schema: true,
    migrate: 'drop'
  }
};
```

> **Note**: you can define multiple solr connections/cores.
> By default sails-solr will run multiple models inside one core `manageCores`. [Connection Options](#connection-options)

### Configuring Models
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

### Usage
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


### Special Adapter Interfaces
#### Autocompleter
search suggestion and spellchecked phrase. Known as "Did You Mean: `foo`?"
```
  // as sails request  see hooks and blueprint
  // http://localhost:1337/user/suggest/foa

  // in node
  User.suggest('foa', console);

  //response
  {
  "responseHeader": {
    "status": 0,
    "QTime": 1
  },
  "spellcheck": {
    "suggestions": [
      "foa",
      {
        "numFound": 1,
        "startOffset": 0,
        "endOffset": 9,
        "origFreq": 0,
        "suggestion": [
          {
            "word": "foo",
            "freq": 1
          }
        ]
      }
    ],
    "correctlySpelled": false,
    "collations": [
      "collation",
      "foo"
    ]
  },
  "suggest": {
    "suggest": {
      "foa": {
        "numFound": 2,
        "suggestions": [
          {
            "term": "foo",
            "weight": 0,
            "payload": ""
          },{
            "term": "foo bar",
            "weight": 0,
            "payload": ""
          }
        ]
      }
    }
  }
}
```

#### Layerd Navigation
Well known as filter. `facet` for `strings` and `min,max,avg`  for `ìnteger` to build Options and Range Slider Elemets. [Query Methods](https://github.com/balderdashy/waterline-docs/blob/master/queries/query-methods.md)
```
  // as sails request  see hooks and blueprint
  // http://localhost:1337/user/catalog/?name="*"&limit=3&sort=age asc&skip=0

  // in node
  User.catalog({name:'foo'},console);

  //response
  {
  "responseHeader":{
    "status":0,
    "QTime":1,
    "params":{
      "q":"*:*",
      "indent":"true",
      "stats":"true",
      "sort":"percent asc",
      "rows":"100",
      "wt":"json",
      "stats.field":["age",
        "percent"]}},
  "response":{"numFound":13,"start":0,"docs":[
      {
        "name":"foo",
        "age":10,
        "color":"blue",
        "createdAt":"2015-12-30T23:32:24.755Z",
        "updatedAt":"2015-12-30T23:32:24.755Z",
        "id":"612bb75f-be0f-496b-ba51-8e79ee786c50"},
      {
        "name":"bar",
        "age":20,
        "color":"yellow",
        "createdAt":"2015-12-30T23:15:09.859Z",
        "updatedAt":"2015-12-30T23:15:09.859Z",
        "id":"517a4917-b3b8-4ea0-a3fd-acd41497b6e0"},
      {
        "name":"john",
        "age":30,
        "color":"black",
        "createdAt":"2015-12-30T23:15:10.859Z",
        "updatedAt":"2015-12-30T23:15:10.859Z",
        "id":"515a4917-b3b8-4ea0-a3fd-acd4149432fd"},
  },
  "facet_counts": {
    "facet_queries": {},
    "facet_fields": {
        "name": [
        {
          "blue":1},
        {
          "yellow":1},
        {
          "black":1},
      ]
    },
    "facet_dates": {},
    "facet_ranges": {},
    "facet_intervals": {},
    "facet_heatmaps": {}
  },
  "stats":{
    "stats_fields":{
      "age":{
        "min":10.0,
        "max":30.0,
        "count":3,
        "missing":0,
        "sum":60.0,
        "sumOfSquares":100,
        "mean":20,
        "stddev":10}}}}
```

## Supported Waterline Interfaces
| Type       | Methods                                 | Build         |
|:-----------|:----------------------------------------|:--------------|
| Semantic   | create, createEach, find, count, update, destroy | [![Build Status](https://travis-ci.org/sajov/sails-solr.svg?branch=master)](https://travis-ci.org/sajov/sails-solr)    |
| Migratable | define, describe, drop, alter, addAttributes, remove, attributes, addIndex, removeIndex                      | [![Build Status](https://travis-ci.org/sajov/sails-solr.svg?branch=master)](https://travis-ci.org/sajov/sails-solr) |
| Queryable  | where, limit, sort, skip, select        | [![Build Status](https://travis-ci.org/sajov/sails-solr.svg?branch=master)](https://travis-ci.org/sajov/sails-solr) |
> **Note**: See [Waterline Documentation](https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md)


## Special Adapter Interfaces
| Type       | Methods                                 | Build         |
|:-----------|:----------------------------------------|:--------------|
| Suggest    | suggest. Return on Object with suggestions and spellecked the requestet term or phrase | [![Build Status](https://travis-ci.org/sajov/sails-solr.svg?branch=master)](https://travis-ci.org/sajov/sails-solr) |
| Catalog   | catalog. Return an Object with matching results and Layered Navigation as `facet` and `stats` | [![Build Status](https://travis-ci.org/sajov/sails-solr.svg?branch=master)](https://travis-ci.org/sajov/sails-solr) |

## Advanced Configuration
### Connection Options
| Params               | Default     | Description                       |
|:---------------------|:------------|:----------------------------------|
| host                 | 'localhost' |                                   |
| port                 | '8983'      |                                   |
| core                 | 'schemaless'|                                   |
| solrconfig           | [object](https://github.com/sajov/sails-solr/blob/develop/lib/config/solrconfig.js)| set properties, add and update searchcomponent and requesthandler. [Config API](https://cwiki.apache.org/confluence/display/solr/Config+API#ConfigAPI-CommandsforCommonProperties)   |
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


### Model Options
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


### Field Type Map
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
| point                | point        |


> **Note**: You can even define your custom mapping as `fieldTypeMap:` inside
> connection settings and as model option.
> If you want a field type explicit mapping use `fieldType` as additional
> fieldTypeMapattribute

### Solr default field attributes
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

> **Note**: You can even define your custom field attribute default as `schemaDefaultFieldAttributes:` inside
> connection settings and as model option.
> If you want a field attribute explicit you can add this attribute as an additional option inside the Model attribute settings

## Running the tests
```sh
$ npm test
```


## TODO:
* more test
* documentation
* cleanup and refactoring
* build an e-commerce like demo application with autocomplete and layerd navigation


## More Resources
- [Solr](https://cwiki.apache.org/confluence/display/solr/Apache+Solr+Reference+Guide)
- [Waterline](https://github.com/balderdashy/waterline)
- [Sails](http://sailsjs.org/)


## License
**[MIT](./LICENSE)**





