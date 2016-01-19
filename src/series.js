'use strict';

//
// Implements a time series data structure.
//

var BaseSeries = require('./baseseries');
var LazyIndex = require('./lazyindex');
var ArrayIterator = require('./iterators/array');

var assert = require('chai').assert;
var E = require('linq');
var inherit = require('./inherit');

/**
 * Represents a time series.
 */
var Series = function (name, values, index) {
	assert.isString(name, "Expected 'name' parameter to Series constructor be a string.");
	assert.isArray(values, "Expected 'values' parameter to Series constructor be an array.");

	if (index) {
		assert.isObject(index, "Expected 'index' parameter to Series constructor to be an object.");
	}

	var self = this;
	self._name = name;
	self._values = values;	
	self._index = index || 
		new LazyIndex(
			"__index___",
			function () {
				return new ArrayIterator(E.range(0, values.length).toArray());
			}
		);
};

var parent = inherit(Series, BaseSeries);

/**
 * Retreive the name of the series.
 */
Series.prototype.getName = function () {
	var self = this;
	return self._name;
}

/**
 * Get an iterator for the iterating the values of the series.
 */
Series.prototype.getIterator = function () {
	var self = this;
	return new ArrayIterator(self._values);
};

/**
 * Retreive the index of the series.
 */
Series.prototype.getIndex = function () {
	var self = this;
	return self._index;
};

module.exports = Series;