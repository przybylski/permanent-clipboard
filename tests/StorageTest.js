describe("Storage", function() {
	it("storage creation", function() {
		var storage = new Storage();
		expect(storage).not.toBe(null);
	});

	it("getting synchronized storage", function() {
		var storage = new Storage();
		expect(storage.getSynchronizedStorage()).toEqual(chrome.storage.sync);
	});

	it("getting local storage", function() {
		var storage = new Storage();
		expect(storage.getLocalStorage()).toEqual(chrome.storage.local);
	});

	it("getting default unset storage", function() {
		localStorage['storage_type'] = undefined;
		var storage = new Storage();
		expect(storage.getDefaultStorage()).toEqual(chrome.storage.sync);
	});

	it("getting set storage type", function() {
		var storage = new Storage();
		
		localStorage['storage_type'] = 'local';
		expect(storage.getDefaultStorage()).toEqual(chrome.storage.local);
		
		localStorage['storage_type'] = 'sync';
		expect(storage.getDefaultStorage()).toEqual(chrome.storage.sync);
	})
});