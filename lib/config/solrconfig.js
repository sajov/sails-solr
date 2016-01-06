module.exports = {
    "set-property": {
        "updateHandler.autoSoftCommit.maxTime": 1000,
        // "updateHandler.commitWithin.softCommit": true
        // "updateHandler.updateLog": false
        // TODO: issue https://issues.apache.org/jira/browse/SOLR-8104
        // "query.maxWarmingSearchers": 3 // solr isssue
    },
    "add-searchcomponent": {
        "name": "suggest",
        "class": "solr.SuggestComponent",
        "suggester": {
            "name": "suggest",
            "lookupImpl": "FuzzyLookupFactory",
            "dictionaryImpl": "DocumentDictionaryFactory",
            "field": "name",
            "suggestAnalyzerFieldType": "string",
            "buildOnStartup": "true",
            "buildOnOptimize": "true",
            // "buildOnCommit": "true" TODO: issue https://issues.apache.org/jira/browse/SOLR-8104
        }
    },
    "add-requesthandler": {
        "startup": "lazy",
        "name": "/suggest",
        "class": "solr.SearchHandler",
        "defaults": {
            "suggest": true,
            "suggest.count": 100,
            "suggest.dictionary": "suggest",
            "spellcheck": "on",
            "spellcheck.count": 10,
            "spellcheck.extendedResults": true,
            "spellcheck.collate": true,
            "spellcheck.maxCollations": 10,
            "spellcheck.maxCollationTries": 10,
            "spellcheck.accuracy": 0.003,
        },
        "components": ["mySpellchecker", "suggest"]
    }
}
