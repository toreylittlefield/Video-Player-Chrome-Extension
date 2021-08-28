import RGBtoHEXColor from '../Utils/RGBtoHEXColor';
import addVideoSelector from './netflix_video';

// The default values collected on runtime
const storedDefaults = {
  verticalPosition: null,
  fontSize: null,
  fontColor: null,
  fontWeight: null,
};

let currentObserver = null;

// save of values in chrome local storage
const setSubtitlesOptionsInChromeStorage = (
  request = { payload: { verticalPosition: Number, fontColor: '', fontSize: Number, fontWeight: Number } }
) => {
  chrome.storage.local.set({
    subtitlesOptions: request.payload,
  });
};

const MutationObserverFunction = (observeSubtitles) => {
  const observer = new MutationObserver(observeSubtitles);
  observer.observe(document.body.querySelector('.VideoContainer'), {
    subtree: true,
    attributes: false,
    childList: true,
  });
  return observer;
};

// runs the mutation observe and changes the values received in the listener from subtitlesform.js
const changeSubtitlesStyle = (
  verticalPosition = 0,
  fontSize = 32,
  fontColor = 'currentColor',
  fontWeight = 'currentColor',
  disconnect = false
) => {
  if (disconnect && currentObserver !== null) {
    currentObserver.disconnect();
    return;
  }
  if (currentObserver !== null) {
    currentObserver.disconnect();
  }
  // observing
  const observeSubtitles = () => {
    // .player-timedText
    const subtitles = document.querySelector('.player-timedtext');
    if (subtitles) {
      // default vertical
      if (storedDefaults.verticalPosition === null)
        storedDefaults.verticalPosition = parseFloat(subtitles.style.bottom);
      // custom vetical style applied
      subtitles.style.bottom = `${verticalPosition}px`;

      // .player-timedtext-text-container
      const textContainers = subtitles.querySelectorAll('.player-timedtext-text-container');
      [...textContainers].forEach((container) => {
        if (container) {
          // center the subtitles
          const firstChildContainer = container;
          if (disconnect) {
            // firstChildContainer.style.left = '';
            // firstChildContainer.style.right = '';
          } else {
            firstChildContainer.style.left = '0';
            firstChildContainer.style.right = '0';
          }

          // the subtitles texts
          const styleChildren = (parentElement = {}) => {
            const subtitleSpans = parentElement.children;
            if (!subtitleSpans.length) return;
            // for (const span of [...subtitleSpans]) {
            [...subtitleSpans].forEach((el) => {
              // remaining defaults to stored
              const span = el;
              if (storedDefaults.fontSize === null) storedDefaults.fontSize = parseFloat(span.style.fontSize);
              if (storedDefaults.fontColor === null)
                storedDefaults.fontColor = RGBtoHEXColor(span.style.color);
              if (storedDefaults.fontWeight === null) storedDefaults.fontWeight = span.style.fontWeight;
              // custom styles applied
              span.style.fontSize = `${fontSize}px`;
              span.style.fontWeight = fontWeight;
              span.style.color = fontColor;
            });
          };
          // style the all the spans with the values
          styleChildren(firstChildContainer);
        }
      });
    }
  };
  currentObserver = MutationObserverFunction(observeSubtitles);
};

// listen for requests on runtime
if (!chrome.runtime.onMessage.hasListeners()) {
  addVideoSelector();
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // if (prevObserver) prevObserver.disconnect();
    if (request.message === 'update_netflix_subtitles_styles') {
      const {
        verticalPosition = 0,
        fontSize = 32,
        fontColor = 'currentColor',
        fontWeight = 'normal',
      } = request.payload;
      const waitForLoad = setInterval(() => {
        const subtitlesSelectorFound = () => document?.querySelector('.player-timedtext');
        // wait to find the subtitles which are spans in the .player-timedtext-text-container...
        if (subtitlesSelectorFound()?.firstChild) {
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
      if (isNullValues) return null;
      // update the values in the mutation observer
      changeSubtitlesStyle(verticalPosition, fontSize, fontColor, fontWeight, true);
      // save the values in chrome local storage
      setSubtitlesOptionsInChromeStorage({ payload: { verticalPosition, fontSize, fontWeight, fontColor } });
      // send the values to the subtitlesform.js
      sendResponse({
        message: 'reset_subtitles',
        payload: { verticalPosition, fontSize, fontColor, fontWeight },
      });
      // reset the stored defaults in event they need to change with a different video
      Object.keys(storedDefaults).forEach((key) => {
        storedDefaults[key] = null;
      });
    }
    return true;
  });
}
