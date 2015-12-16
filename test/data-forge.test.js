'use strict';


describe('data-forge', function () {
	
	var dataForge = require('../index');	
	var ArrayEnumerator = require('../src/enumerators/array');	

	var expect = require('chai').expect;
	var assert = require('chai').assert;

	var initDataFrame = function (columns, values) {
		assert.isArray(columns);
		assert.isArray(values);

		return new dataForge.LazyDataFrame(
			function () {
				return columns;
			},
			function () {
				return new ArrayEnumerator(values);
			}
		);
	};

	it('can load data async', function () {

		var someTestData = 'some-test-data';
		var promise = Promise.resolve(someTestData);
		var mockDataFrame = {};

		var mockDataSource = {
			read: function () {
				return promise;
			}
		};

		var mockDataFormat = {
			from: function (data) {
				expect(data).to.eql(someTestData);
				return mockDataFrame;
			}
		};

		return dataForge
			.from(mockDataSource)
			.as(mockDataFormat)
			.then(function (dataFrame) {
				expect(dataFrame).to.eql(mockDataFrame);
			});
	});

	it('can load data sync', function () {

		var someTestData = 'some-test-data';
		var mockDataFrame = {};

		var mockDataSource = {
			readSync: function () {
				return someTestData;
			}
		};

		var mockDataFormat = {
			from: function (data) {
				expect(data).to.eql(someTestData);
				return mockDataFrame;
			}
		};

		var dataFrame = dataForge
			.fromSync(mockDataSource)
			.as(mockDataFormat);

		expect(dataFrame).to.eql(mockDataFrame);
	});
	
	it('can merge on column', function () {

		var left = initDataFrame(
			[
				'key',
				'lval',
			],
			[
				['foo', 1],
				['foo', 2],
			]
		);
		var right = initDataFrame(
			[
				'key',
				'rval',
			],
			[
				['foo', 4],
				['foo', 5],
			]
		);

		var merged = dataForge.merge(left, right, 'key');
		expect(merged.getColumnNames()).to.eql([
			'key',
			'lval',
			'rval',
		]);
		expect(merged.getValues()).to.eql([
			['foo', 1, 4],
			['foo', 1, 5],
			['foo', 2, 4],
			['foo', 2, 5],
		]);
	});

	it('can merge on columns that have different indices', function () {

		var left = initDataFrame(
			[
				'lval',
				'key',
			],
			[
				[1, 'foo'],
				[2, 'foo'],
			]
		);
		var right = initDataFrame(
			[
				'key',
				'rval',
			],
			[
				['foo', 4],
				['foo', 5],
			]
		);

		var merged = dataForge.merge(left, right, 'key');
		expect(merged.getColumnNames()).to.eql([
			'key',
			'lval',
			'rval',
		]);
		expect(merged.getValues()).to.eql([
			['foo', 1, 4],
			['foo', 1, 5],
			['foo', 2, 4],
			['foo', 2, 5],
		]);
	});

	it('merging with column that doesnt exist in left data frame throws exception', function () {

		var left = initDataFrame(
			[
				'left-key',
				'lval',
			],
			[
				['foo', 1],
				['foo', 2],
			]
		);
		var right = initDataFrame(
			[
				'right-key',
				'rval',
			],
			[
				['foo', 4],
				['foo', 5],
			]
		);

		expect(function () {
			dataForge.merge(left, right, 'right-key');
		}).to.throw(Error);
	});

	it('merging with column that doesnt exist in right data frame throws exception', function () {

		var left = initDataFrame(
			[
				'left-key',
				'lval',
			],
			[
				['foo', 1],
				['foo', 2],
			]
		);
		var right = initDataFrame(
			[
				'right-key',
				'rval',
			],
			[
				['foo', 4],
				['foo', 5],
			]
		);

		expect(function () {
			dataForge.merge(left, right, 'left-key');
		}).to.throw(Error);
	});

	it('can concat data frames', function () { //todo: also when columns are unevan or at different indices

	 	var df1 = initDataFrame(["1", "2"], [[1, 2], [3, 4]]);
	 	var df2 = initDataFrame(["1", "2"], [[5, 6], [7, 8]]);
	 	var df3 = initDataFrame(["1", "2"], [[9, 10], [11, 12]]);

	 	var result = dataForge.concat([df1, df2, df3]);

	 	expect(result.getColumnNames()).to.eql(["1", "2"]);
	 	expect(result.getIndex().getValues()).to.eql([0, 1, 0, 1, 0, 1]);
	 	expect(result.getValues()).to.eql([
 			[1, 2],
 			[3, 4],
 			[5, 6],
 			[7, 8],
 			[9, 10],
 			[11, 12]
 		]);
	});

	it('concat can handle out of order columns', function () {

	 	var df1 = initDataFrame(["1", "2"], [[1, 2], [3, 4]]);
	 	var df2 = initDataFrame(["2", "1"], [[6, 5], [8, 7]]);

	 	var result = dataForge.concat([df1, df2]);

	 	expect(result.getColumnNames()).to.eql(["1", "2"]);
	 	expect(result.getIndex().getValues()).to.eql([0, 1, 0, 1]);
	 	expect(result.getValues()).to.eql([
 			[1, 2],
 			[3, 4],
 			[5, 6],
 			[7, 8],
 		]);
	});

	it('concat can handle uneven columns', function () {

	 	var df1 = initDataFrame(["1", "2"], [[1, 2], [3, 4]]);
	 	var df2 = initDataFrame(["2", "3"], [[6, 5], [8, 7]]);

	 	var result = dataForge.concat([df1, df2]);

	 	expect(result.getColumnNames()).to.eql(["1", "2", "3"]);
	 	expect(result.getIndex().getValues()).to.eql([0, 1, 0, 1]);
	 	expect(result.getValues()).to.eql([
 			[1, 2, undefined],
 			[3, 4, undefined],
 			[undefined, 6, 5],
 			[undefined, 8, 7],
 		]);
	});

});