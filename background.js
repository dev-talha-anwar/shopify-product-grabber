chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		files: ['/contentScripts/getHostName.js']
		});
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		let url = chrome.runtime.getURL("/pages/index/index.html?shop="+message.hostname);
		chrome.tabs.create({ url: url });
	});
});
