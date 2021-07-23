// if the video is found send message to background.js and retrieve playbackrate value from chrome storage if it exists
const sendRunTimeMessageToBackgroundJSAndUpdatePlaybackRate = (
  videoElement = {}
) => {
  chrome.runtime.sendMessage(
    {
      message: 'foundVideo',
      payload: videoElement.playbackRate,
    },
    (response) => {
      if (response?.message === 'foundVideoSuccess') {
        if (response.payload !== null) {
          videoElement.playbackRate = response.payload;
        }
      }
    }
  );
};

// hack to check if the default playback speed is overiding our user playback speed from chrome on page load
const setAndCheckVideoPlayBackRate = (
  request = { payload: Number },
  videoElement = {}
) => {
  if (request.payload === undefined) return true;
  const currentPlayBackRate = videoElement.playbackRate;
  const payload = Number(request.payload);
  if (currentPlayBackRate !== payload) {
    videoElement.playbackRate = payload;
    return false;
  }
  return true;
};

function checkForVideoInChildNodes(node, parent, added) {
  // Only proceed with supposed removal if node is missing from DOM
  if (!added && document.body.contains(node)) {
    return;
  }
  if (
    node.nodeName === 'VIDEO' ||
    node.nodeName === 'AUDIO'
    //  &&
    // // jw-video jw-reset parent className for the typical  jw-player
    // node.className === 'jw-video jw-reset'
  ) {
    if (added) {
      const span = document.createElement('div');
      span.textContent = 'SECRET CODE 1234';
      span.className = 'secret-code';
      let shadow = span.attachShadow({
        mode: 'open',
      });

      shadow.innerHTML = `
      <span></span>
          `;
      parent.prepend(span);
      const videoElement = parent.querySelector('video');
      if (videoElement) {
        videoElement.dataset.CustomPlaybackRate = videoElement.playbackRate;

        // listen to messages to update the playback speed value based on slider & chrome storage
        chrome.runtime.onMessage.addListener(
          (request, sender, sendResponse) => {
            if (request.message === 'changePlaybackSpeed') {
              if (videoElement) {
                videoElement.playbackRate = request.payload;
              }
              sendResponse({
                message: 'success',
                payload: videoElement.playbackRate,
              });
              return true;
            }
            if (request.message === 'getPlayBackSpeedOnPageLoad') {
              if (videoElement) {
                videoElement.playbackRate = request.payload;

                // hack to set an interval in case the default video play back speed overrides our user playback speed store in chome local storage
                const timeout = setTimeout(() => {
                  const intervalTimer = setInterval(() => {
                    if (setAndCheckVideoPlayBackRate(request, videoElement))
                      clearInterval(intervalTimer);
                  }, 500);
                  clearTimeout(timeout);
                }, 500);
              }
              sendResponse({
                message: 'success',
                payload: videoElement.playbackRate,
              });
              return true;
            }
          }
        );

        // send message to chrome background.js and retrieve the playbackrate
        sendRunTimeMessageToBackgroundJSAndUpdatePlaybackRate(videoElement);
      }
    } else {
      // removed nodes
    }
  } else if (node.children !== undefined) {
    for (var i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      checkForVideoInChildNodes(child, child.parentNode || parent, added);
    }
  }
}

const mutate = (document) => {
  var observer = new MutationObserver((mutations) => {
    mutations.forEach((mutationRecord) => {
      // added nodes
      Array.from(mutationRecord.addedNodes)
        .filter((addedNode) => {
          return (
            addedNode.nodeName === 'VIDEO' || addedNode.nodeName === 'IFRAME'
          );
        })
        .forEach((videoNode) => {
          checkForVideoInChildNodes(
            videoNode,
            videoNode.parentNode || mutationRecord.target,
            true
          );
        });
      // removed nodes
      Array.from(mutationRecord.removedNodes)
        .filter((addedNode) => {
          return (
            addedNode.nodeName === 'VIDEO' || addedNode.nodeName === 'IFRAME'
          );
        })
        .forEach((videoNode) => {
          checkForVideoInChildNodes(
            videoNode,
            videoNode.parentNode || mutationRecord.target,
            true
          );
        });
    });
  });
  observer.observe(document, { childList: true, subtree: true });
};

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

const checkForTheExistingShadowClass = () => {
  const foundShadowElements = document.querySelectorAll('.secret-code');
  if (!foundShadowElements) return;
  let parentElementOfShadows = [];
  foundShadowElements.forEach((shadow) =>
    parentElementOfShadows.push(shadow.parentElement)
  );
  return parentElementOfShadows;
};

const getVideoElementsFromParentElements = (parentElements) => {
  parentElements.forEach((parent) => {
    const videoPlayerElement = parent.querySelector('video');
    if (videoPlayerElement) {
      sendRunTimeMessageToBackgroundJSAndUpdatePlaybackRate(videoPlayerElement);
    }
  });
};

(async function init() {
  if (window.document) {
    const ourShadowElements = checkForTheExistingShadowClass();
    if (ourShadowElements.length > 0) {
      getVideoElementsFromParentElements(ourShadowElements);
    } else {
      const allDocsOnPage = getAllDocs();
      allDocsOnPage.forEach(mutate);
    }
  }
})();
