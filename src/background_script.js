const metaAssets = '../meta_assets/';
var selectedId = -1;

function getIconPath(response) {
	const suffix = response ? '' : '_without';
	return `${metaAssets}icon${suffix}.png`;
}

function updateIcon() {
	chrome.tabs.sendMessage(selectedId, {msg: "findAll"}, (response = false) => {
		chrome.browserAction.setIcon({
			path: getIconPath(response),
			tabId: selectedId
		}, (e) => {console.log(e)});
	});
}

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == "complete" && tabId == selectedId) {
		updateIcon();
	}
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
	selectedId = tabId;
  updateIcon();
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  selectedId = tabs[0].id;
  updateIcon();
});
