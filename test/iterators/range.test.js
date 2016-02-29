'use strict';

describe('Range iterator', function () {

	var RangeIterator = require('../../src/iterators/range.js');

	var expect = require('chai').expect;

	it('can handle empty range', function () {

		var testObject = new RangeIterator(5, 0);

		expect(testObject.moveNext()).to.eql(false);
	});

	it('can iterate range', function () {

		var testObject = new RangeIterator(5, 2);

		testObject.moveNext();
		expect(testObject.getCurrent()).to.eql(5);
		testObject.moveNext();
		expect(testObject.getCurrent()).to.eql(6);
		expect(testObject.moveNext()).to.eql(false);
	});

});