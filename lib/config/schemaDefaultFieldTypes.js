module.exports = {
    'string_keyword_new': {
        'name': 'string_keyword',
        'class': 'solr.TextField',
        'analyzer': {
            'tokenizer': {
                'class': 'solr.LowerCaseTokenizerFactory'
            },
            'filters': [
                // {'class':'solr.ASCIIFoldingFilterFactory'},
                // {'class':'solr.LowerCaseFilterFactory'},
                // {'class':'solr.ReversedWildcardFilterFactory'}
            ]
        }
    },
    'string_keyword': {
        'name': 'string_keyword',
        'class': 'solr.TextField',
        'analyzer': {
            'tokenizer': {
                'class': 'solr.KeywordTokenizerFactory'
            },
            'filters': [{
                'class': 'solr.LowerCaseFilterFactory',
            }]
        }
    }
}
