chrome.runtime.onInstalled.addListener(function() {
	chrome.action.onClicked.addListener((tab) => {
		chrome.tabs.executeScript({
			file: '/contentScripts/getHostName.js'
		});
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			let url = chrome.runtime.getURL("/pages/index/index.html?shop="+message.hostname);
			chrome.tabs.create({ url: url });
		});
	});
})