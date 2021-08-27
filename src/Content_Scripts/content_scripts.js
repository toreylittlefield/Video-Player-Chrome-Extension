// if the video is found send message to background.js and retrieve playbackrate value from chrome storage if it exists
const sendRunTimeMessageToBackgroundJSAndUpdatePlaybackRate = (videoElement = {}) => {
  chrome.runtime.sendMessage(
    {
      message: 'foundVideo',
      payload: videoElement.playbackRate,
    },
    (response) => {
      if (response?.message === 'foundVideoSuccess') {
        if (response.payload !== null) {
          const videoEl = videoElement;
          videoEl.playbackRate = response.payload;
          videoEl.dataset.CustomPlaybackRate = videoEl.playbackRate;
        }
      }
    }
  );
};

// hack to check if the default playback speed is overiding our user playback speed from chrome on page load
const setAndCheckVideoPlayBackRate = (request = { payload: Number }, videoElement = {}) => {
  if (request.payload === undefined || !videoElement) return true;
  const currentPlayBackRate = videoElement.playbackRate;
  const payload = Number(request.payload);
  if (currentPlayBackRate !== payload) {
    const videoEl = videoElement;
    videoEl.playbackRate = payload;
    return false;
  }
  return true;
};

const setThePlaybackRate = (videoElement = {}, request = { payload: Number }) => {
  if (videoElement) {
    const videoEl = videoElement;
    videoEl.playbackRate = request.payload;
    videoEl.dataset.CustomPlaybackRate = videoElement.playbackRate;
  }
};

const addListenerToVideoTagAndSendVideoFoundMessage = (parent = {}) => {
  let videoElement = parent.querySelector('video');

  if (!videoElement) return false;
  const sendRequest = { request: { payload: videoElement.playbackRate } };
  setThePlaybackRate(videoElement, sendRequest.request);

  console.log('adding video listeners...');
  // listen to messages to update the playback speed value based on slider & chrome storage
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'changePlaybackSpeed' || request.message === 'getPlayBackSpeedOnPageLoad') {
      if (
        document.location.hostname === 'www.netflix.com' &&
        request.message === 'getPlayBackSpeedOnPageLoad'
      ) {
        // hacky way to deal with updating video tag when netflix because of React??
        const timeout = setTimeout(() => {
          const intervalTimer = setInterval(() => {
            videoElement = document.querySelector('video');
            if (videoElement && setAndCheckVideoPlayBackRate(request, videoElement))
              clearInterval(intervalTimer);
          }, 500);
          clearTimeout(timeout);
        }, 500);
      }
      // should only occur once per page load event...
      if (request.message === 'getPlayBackSpeedOnPageLoad') {
        // hack to set an interval in case the default video play back speed overrides our user playback speed store in chome local storage
        const timeout = setTimeout(() => {
          const intervalTimer = setInterval(() => {
            if (setAndCheckVideoPlayBackRate(request, videoElement)) clearInterval(intervalTimer);
          }, 500);
          clearTimeout(timeout);
        }, 500);
      }
      // from the slider to background and passed here
      if (request.message === 'changePlaybackSpeed') {
        setThePlaybackRate(videoElement, request);
      }
      sendResponse({
        message: 'success',
        payload: videoElement.playbackRate,
      });
      return true;
    }
    sendResponse({});
    return true;
  });
  // send message to chrome background.js and retrieve the playbackrate
  console.log('found video and sending message...');
  sendRunTimeMessageToBackgroundJSAndUpdatePlaybackRate(videoElement);
  return true;
};

const checkForVideoInChildNodes = (node = {}, parent = {}) => {
  // // jw-video jw-reset parent className for the typical  jw-player
  // node.className === 'jw-video jw-reset'
  if (node.nodeName === 'VIDEO' || node.nodeName === 'AUDIO') {
    addListenerToVideoTagAndSendVideoFoundMessage(parent);
    // recurse over any child nodes
  } else if (node.children !== undefined) {
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      checkForVideoInChildNodes(child, child.parentNode || parent);
    }
  }
};

// mutation observer for each document in the window to find VIDEO or IFRAMES
const mutate = (document) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutationRecord) => {
      // added nodes
      Array.from(mutationRecord.addedNodes)
        .filter((addedNode) => addedNode.nodeName === 'VIDEO' || addedNode.nodeName === 'IFRAME')
        .forEach((videoNode) => {
          checkForVideoInChildNodes(videoNode, videoNode.parentNode ?? mutationRecord.target);
        });
    });
  });
  observer.observe(document, { childList: true, subtree: true });
};

// Find IFrames
const getIframeDocs = () => {
  const iframeTags = document.getElementsByTagName('iframe');
  const filterIframes = Array.from(iframeTags)
    .filter((iframe) => iframe.contentDocument)
    .map((iframe) => iframe.contentDocument);
  return filterIframes;
};

const getAllDocs = () => {
  const iframes = getIframeDocs();
  const docs = Array.from([document, ...iframes]);
  return docs;
};

const checkIfMatchesURL = async () => {
  console.log('checking url...');
  const regex = new RegExp('netflix', 'g');
  if (regex.test(document.location.orgin) || regex.test(document.URL)) {
    // setup listeners no need to run mutation observer
    console.log(document.location.origin);
    const videoElement = () => document.querySelector('video');
    const intervalTimer = setInterval(() => {
      if (videoElement()) {
        console.log('adding listeners for netflix...');
        addListenerToVideoTagAndSendVideoFoundMessage(window.document.body);
        clearInterval(intervalTimer);
      }
    }, 1000);

    return true;
  }
  return false;
};
(async function init() {
  const isMatchedURL = await checkIfMatchesURL();
  if (!isMatchedURL && window.document) {
    console.log('Running Mutation Observer');
    const allDocsOnPage = getAllDocs();
    allDocsOnPage.forEach(mutate);
  }
})();
