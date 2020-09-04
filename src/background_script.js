const metaAssets = '../meta_assets/';
var selectedId = -1;

function getIconPath(hasCustomElement) {
  const suffix = hasCustomElement ? '' : '_without';
  return `${metaAssets}icon${suffix}.png`;
}

function updateIcon(customElementCount) {
  chrome.browserAction.setIcon({
    path: getIconPath(!!customElementCount),
    tabId: selectedId
  });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.msg == "customElementCount") {
    selectedId = sender.tab.id;
    updateIcon(request.value);
  }
});
