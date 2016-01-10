module.exports = {
    'string': 'text_general',
    'text': 'text_general',
    'binary': 'text_general',
    'integer': 'int',
    'float': 'float',
    'date': 'date',
    'time': 'date',
    'datetime': 'date',
    'boolean': 'boolean',
    'binary': 'text_general',
    'array': {
        type: 'text_general',
        multiValued: true
    },

    'json': {
        type: 'text_general',
        multiValued: false,
        dynamicField: '*_json',
    },
    'Point': 'location_rpt',
    'point': 'location_rpt',
    'Polygon': 'location_rpt',
    'polygon': 'location_rpt',
    'geometry': 'location_rpt',
}
