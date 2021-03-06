
const Storage = require("../src/storage.js");

global.chrome = require('sinon-chrome');
var expect = require('chai').expect;


describe("Storage", function() {

	var storage;

	beforeEach(function() {
		storage = new Storage();
	});

	afterEach(function() {
		chrome.flush();
	});

	it("storage creation", function() {
		expect(storage).to.not.be.null;
	});

	it("getting synchronized storage", function() {
		expect(storage.getSynchronizedStorage()).to.deep.equal(chrome.storage.sync);
	});

	it("getting local storage", function() {
		expect(storage.getLocalStorage()).to.deep.equal(chrome.storage.local);
	});

	it("getting default unset storage", function() {
		localStorage['storage_type'] = undefined;
		expect(storage.getDefaultStorage()).to.deep.equal(chrome.storage.sync);
	});
	
	it("getting set storage type", function() {
		
		localStorage['storage_type'] = 'local';
		expect(storage.getDefaultStorage()).to.deep.equal(chrome.storage.local);
		
		localStorage['storage_type'] = 'sync';
		expect(storage.getDefaultStorage()).to.deep.equal(chrome.storage.sync);
	})

	it("get data from storage", function() {

		localStorage['storage_type'] = 'local';

		var requestedDataWithDefaults = {a: 1, b: "string"};
		chrome.storage.local.get.onFirstCall().callsArgWith(1, requestedDataWithDefaults);

		storage.getData(storage, {}, function(context, data, error) {
				expect(context).to.deep.equal(storage);
				expect(data).to.deep.equal(requestedDataWithDefaults);
				expect(error).to.be.null;
			});
	});

	it("failed to get data from storage", function() {
		localStorage['storage_type'] = 'local';

		var requestedDataWithDefaults = {a: 1, b: 'string'};
		var errorStr = 'failed to get';
		chrome.runtime.lastError = errorStr;
		chrome.storage.local.get.onFirstCall().callsArgWith(1, null);

		storage.getData(storage, {}, function(context, data, error) {
				expect(context).to.deep.equal(storage);
				expect(data).to.be.null;
				expect(error).to.equal(errorStr);
			});
	});

	it("save data to storage", function() {
		localStorage['storage_type'] = 'local';

		var dataToSave = {a:1, b:'string'};
		chrome.storage.local.set.onFirstCall().callsArg(1);

		storage.saveData(storage, dataToSave, function(context, error) {
			expect(context).to.deep.equal(storage);
			expect(error).to.be.undefined;
		});
	});

	it("failed saving to storage", function() {
		localStorage['storage_type'] = 'local';

		var dataToSave = {a:1, b:'string'};
		var errorStr = 'failed to set';
		chrome.runtime.lastError = errorStr;
		chrome.storage.local.set.onFirstCall().callsArg(1);

		storage.saveData(storage, dataToSave, function(context, error) {
			expect(context).to.deep.equal(storage);
			expect(error).to.equal(errorStr);
		});
	})

});