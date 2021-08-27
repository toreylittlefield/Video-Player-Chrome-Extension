// if the video is found send message to background.js and retrieve playbackrate value from chrome storage if it exists
const updatePlayBackRateBG = (videoElement = {}) => {
  chrome.runtime.sendMessage(
    {
      message: 'foundVideo',
      payload: videoElement.playbackRate,
    },
    (response) => {
      const { lastError = '' } = chrome.runtime;
      if (lastError) {
        console.log(lastError);
        return;
      }
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

const setThePlaybackRate = (videoElement = {}, request = { payload: Number }) => {
  if (videoElement) {
    const videoEl = videoElement;
    videoEl.playbackRate = request.payload;
    videoEl.dataset.CustomPlaybackRate = videoElement.playbackRate;
  }
};

const setThePlaybackRateNetflix = (videoElement = {}, request = { payload: Number }) => {
  if (videoElement) {
    const videoEl = document.querySelector('[data--custom-playback-rate]') || document.querySelector('video');
    videoEl.playbackRate = request.payload;
    videoEl.dataset.CustomPlaybackRate = videoElement.playbackRate;
  }
};

// hack to check if the default playback speed is overiding our user playback speed from chrome on page load
const setAndCheckVideoPlayBackRate = (request = { payload: Number }, videoElement = {}) => {
  if (request.payload === undefined || !videoElement) return true;
  const currentPlayBackRate = videoElement.playbackRate;
  const payload = Number(request.payload);
  if (currentPlayBackRate !== payload) {
    const videoEl = videoElement;
    videoEl.playbackRate = payload;
    videoEl.dataset.CustomPlaybackRate = videoElement.playbackRate;
    return false;
  }
  return true;
};

const attachVideoListener = (parent = {}, isNetflix = false) => {
  let videoElement = parent.querySelector('video');

  if (!videoElement) return false;
  const sendRequest = { request: { payload: videoElement.playbackRate } };
  if (!isNetflix) {
    setThePlaybackRate(videoElement, sendRequest.request);
  } else {
    setThePlaybackRateNetflix(videoElement, sendRequest.request);
  }

  // listen to messages to update the playback speed value based on slider & chrome storage
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'changePlaybackSpeed' || request.message === 'getPlayBackSpeedOnPageLoad') {
      if (
        document.location.hostname === 'www.netflix.com' &&
        request.message === 'getPlayBackSpeedOnPageLoad'
      ) {
        console.count('location and message');
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
      else if (request.message === 'getPlayBackSpeedOnPageLoad') {
        // hack to set an interval in case the default video play back speed overrides our user playback speed store in chome local storage
        const timeout = setTimeout(() => {
          const intervalTimer = setInterval(() => {
            if (setAndCheckVideoPlayBackRate(request, videoElement)) clearInterval(intervalTimer);
          }, 500);
          clearTimeout(timeout);
        }, 500);
      }
      // from the slider to background and passed here
      if (request.message === 'changePlaybackSpeed' && document.location.hostname === 'www.netflix.com') {
        setThePlaybackRateNetflix(videoElement, request);
      } else if (request.message === 'changePlaybackSpeed') {
        setThePlaybackRate(videoElement, request);
      }
      sendResponse({
        message: 'success',
        payload: videoElement.playbackRate,
      });
      return true;
    }
    // sendResponse({});
    return true;
  });
  // send message to chrome background.js and retrieve the playbackrate
  updatePlayBackRateBG(videoElement);
  return true;
};

export { updatePlayBackRateBG, setAndCheckVideoPlayBackRate, setThePlaybackRate, attachVideoListener };
