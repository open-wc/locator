const metaAssets = '../meta_assets/';
var selectedId = -1;

function getIconPath(response) {
	const suffix = response.length ? '' : '_without';
	return `${metaAssets}icon${suffix}.png`;
}

function updateIcon() {
	chrome.tabs.sendMessage(selectedId, {msg: "findAll"}, (response = []) => {
		chrome.browserAction.setIcon({
			path: getIconPath(response),
			tabId: selectedId
		});
	});
}

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == "complete" && tabId == selectedId)
    updateIcon();
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  selectedId = tabId;
  updateIcon();
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  selectedId = tabs[0].id;
  updateIcon();
});
