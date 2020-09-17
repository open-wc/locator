const metaAssets = '../meta_assets/';
let displayIconAmount = false;

chrome.runtime.onMessage.addListener(({
		msg,
		elements = [],
		displayAmount = false,
		amount = 0,
		url
	}, _, sendResponse) => {

	if (msg === 'display_amount_changed') {
		displayIconAmount = displayAmount
		if(displayAmount) {
			setIconState(new Array(amount));
		} else {
			chrome.browserAction.setBadgeText({text: ''});
		}
	}

	if (msg === 'found_new_elements') {
		const hasElements = elements.length > 0;

		if(hasElements) {
			chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
				if(tabs[0].url === url) {
					setIconState(elements);
				}
			});
		} else {
			setIconState();
		}
	}
	sendResponse(true);
	return true;
});

chrome.tabs.onSelectionChanged.addListener(() => {
	chrome.browserAction.setBadgeText({text: ''});
	getTabAndLatestElements((elements) => {
		setIconState(elements);
	});
});

chrome.tabs.onUpdated.addListener(() => {
	getTabAndLatestElements((elements) => {
		setIconState(elements);
	});
});

/**
 * @param {(elements: String[]) => void} cb
 */
function getTabAndLatestElements(cb) {
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, {msg: "get_latest"}, ({elements = []} = {}) => {
			cb(elements);
		});
	});
}

/**
 * @param {String[]} elements - Array of tagnames
 */
function setIconState(elements = []) {
	const hasElements = elements.length > 0;
	const suffix = hasElements ? '' : '_without';
	const iconVal = hasElements ? String(elements.length) : '';
	if(displayIconAmount) {
		chrome.browserAction.setBadgeText({text: iconVal});
		chrome.browserAction.setBadgeBackgroundColor({color: '#696969'});
	}
	chrome.browserAction.setIcon({
		path: `${metaAssets}icon${suffix}.png`
	});
}
