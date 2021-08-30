<p align="center">
  <img src="./Chrome Store/Screenshots/Youtube Screenshot.png" width="450"/>
  </br>
</p>
<p align="center">
  <img src="./Chrome Store/Screenshots/Netflix Screenshot.png" width="450"/>
  </br>
</p>

<h1 align="center">Change Video Playback Speed</h1>

## Link To Webstore

[Available in the Chrome Webstore](https://chrome.google.com/webstore/detail/change-video-playback-spe/ncnbdjhoplchclmeanmckpmobhmodlio)

## What is it?

- **_A Chrome | Chromium Based Web Extension:_** Simple web-extension to speed up or slow down video speeds with a simple stylish slider. Has some additional features to customize the some of the styles of Netflix subtitles through a simple form component.

### Main Features

- **Adjust video playback rates:** from 0.0X - 10.0X
- **Works with most HTML5 Video:** embedded iframes including Netflix, Youtube, Amazon, Vimeo, JW Players etc...
- **Change Netflix Subtitles Styles** the font-size, font-weight, horizontal and vertical positioning, as well as font-color of the subtitles in Netflix

## Why do it?

- For the fun in learning to build a simple web-extension.
- To learn more about the browser/Chrome APIs, Web APIs, DOM rendering, and iframes.
- Moreover, someone I know wanted to watch videos at very precise playback speeds. My simple JS bookmarklets weren't cutting it for them anymore as the wanted more control. Furthermore, the bookmarklets didn't work for iframes and some embedded videos.

## Installation

#### Option 1:

Use the official extension in the Chome Webstore (pending..)

#### Option 2:

`npm install`

`npm run build`

uses webpack to create a dist folder.

**Google Chrome / Chromium Based Browser**

1. After you've created the dist folder then proceed to add the extension to Chrome otherwise it won't work.
2. In Chrome go to the extensions page (`chrome://extensions`).
3. Enable Developer Mode.
4. Drag your folder anywhere on the page to import it (do not delete the folder afterwards).

## The How

- Uses the [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- Uses Chrome Extension Manifest Version 3 with service workers
- Injects content scripts in the webpage, looks for changes in the DOM using [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to watch and find `video` tags included those inside of iframes on DOM load.
- Uses plain old JavaScript but bundles with webpack to allow for import / export modules & tree shaking.

## Privacy

This extension **DOES NOT** collect or monitor any user information.

### License

This is [MIT licensed](./LICENSE.TXT).
