import { RGBtoHEXColor } from './utils';

// The default values collected on runtime
let storedDefaults = {
  verticalPosition: null,
  fontSize: null,
  fontColor: null,
  fontWeight: null,
};

// save of values in chrome local storage
const setSubtitlesOptionsInChromeStorage = (
  request = { payload: { verticalPosition: Number, fontColor: '', fontSize: Number, fontWeight: Number } }
) => {
  chrome.storage.local.set({
    subtitlesOptions: request.payload,
  });
};

// runs the mutation observe and changes the values received in the listener from subtitlesform.js
changeSubtitlesStyle = (
  verticalPosition = 0,
  fontSize = 32,
  fontColor = 'currentColor',
  fontWeight = 'currentColor',
  disconnect = false
) => {
  console.log('%cnetflix-subtitles-styler : observer is working... ', 'color: red;');

  // observing
  observeSubtitles = () => {
    // .player-timedText
    const subtitles = document.querySelector('.player-timedtext');
    if (subtitles) {
      // default vertical
      if (storedDefaults.verticalPosition === null)
        storedDefaults.verticalPosition = parseFloat(subtitles.style.bottom);
      // custom vetical style applied
      subtitles.style.bottom = verticalPosition + 'px';

      // .player-timedtext-text-container
      const firstChildContainer = subtitles.firstChild;
      if (firstChildContainer) {
        // center the subtitles
        firstChildContainer.style.left = '0';
        firstChildContainer.style.right = '0';

        // the subtitles texts
        const styleChildren = (parentElement = {}) => {
          const subtitleSpans = parentElement.children;
          if (!subtitleSpans.length) return;
          for (const span of [...subtitleSpans]) {
            // remaining defaults to stored
            if (storedDefaults.fontSize === null) storedDefaults.fontSize = parseFloat(span.style.fontSize);
            if (storedDefaults.fontColor === null) storedDefaults.fontColor = RGBtoHEXColor(span.style.color);
            if (storedDefaults.fontWeight === null) storedDefaults.fontWeight = span.style.fontWeight;
            // custom styles applied
            span.style.fontSize = fontSize + 'px';
            span.style.fontWeight = fontWeight;
            span.style.color = fontColor;
          }
        };
        // style the all the spans with the values
        styleChildren(firstChildContainer);
      }
    }
  };
  const observer = MutationObserverFunction();
};

const MutationObserverFunction = () => {
  const observer = new MutationObserver(observeSubtitles);
  observer.observe(document.body.querySelector('.VideoContainer'), {
    subtree: true,
    attributes: false,
    childList: true,
  });
  return observer;
};

// listen for requests on runtime
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'update_netflix_subtitles_styles') {
    const {
      verticalPosition = 0,
      fontSize = 32,
      fontColor = 'currentColor',
      fontWeight = 'normal',
    } = request.payload;
    console.log('Waiting for subtitles selector');
    const waitForLoad = setInterval(() => {
      const subtitlesSelectorFound = () => document?.querySelector('.player-timedtext');
      // wait to find the subtitles which are spans in the .player-timedtext-text-container...
      if (subtitlesSelectorFound()?.firstChild) {
        console.log('found subtitles...');
        changeSubtitlesStyle(verticalPosition, fontSize, fontColor, fontWeight);
        clearInterval(waitForLoad);
      }
    }, 1000);
    sendResponse({
      message: 'netflix subtitles styles enabled',
      payload: null,
    });
    return true;
  }
  // reset the subtitles to the default netflix values
  if (request.message === 'reset_subtitles') {
    // get the default values from netflix that were stored on runtime
    const { verticalPosition, fontSize, fontColor, fontWeight } = storedDefaults;
    // check if the values are null and if so do not send the message
    const isNullValues = Object.keys(storedDefaults).every((key) => storedDefaults[key] === null);
    if (isNullValues) return;
    // update the values in the mutation observer
    changeSubtitlesStyle(verticalPosition, fontSize, fontColor, fontWeight);
    // save the values in chrome local storage
    setSubtitlesOptionsInChromeStorage({ payload: { verticalPosition, fontSize, fontWeight, fontColor } });
    // send the values to the subtitlesform.js
    sendResponse({
      message: 'reset_subtitles',
      payload: { verticalPosition, fontSize, fontColor, fontWeight },
    });
    // reset the stored defaults in event they need to change with a different video
    Object.keys(storedDefaults).forEach((key) => (storedDefaults[key] = null));
  }
});
