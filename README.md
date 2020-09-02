> ## 🛠 Status: In Development
>
> This chrome extension is still in development, and dependant on `custom-elements.json` becoming a standardized format, and the [catalog](https://catalog.open-wc.org) being in a more mature state. You can read more about `custom-elements.json` [here](https://github.com/webcomponents/custom-elements-json/).

<p align="center">
  <img width="200" src="https://open-wc.org/hero.png"></img>
</p>

## Custom Elements Locator

[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://github.com/open-wc)

Chrome extension to find custom elements on a page, and search the catalog for extra information

<p align="center">
  <img src="./meta_assets/giphytime.gif"/
</p>

## Instructions

- Write code
- Run `npm run build`
- Go to [chrome://extensions/](chrome://extensions/)
- Toggle 'Developer mode' in top right corner
- Click 'Load unpacked' in top left corner
- Select the root folder of this project

If you are implementing and want to test repeatedly:

- Install [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)
- Running `npm run dev` will rebuild on each change in the `src` folder, and trigger a reload of the extension.
- Refresh your current tab


## [Extension on the Chrome Store](https://chrome.google.com/webstore/detail/custom-elements-locator/eccplgjbdhhakefbjfibfhocbmjpkafc)