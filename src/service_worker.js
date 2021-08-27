// set to enabled popup html
const setEnabledPopup = (tabId) => {
  chrome.action.setPopup({
    tabId,
    popup: '../src/Popup/popup.html',
  });
  chrome.action.setIcon({
    tabId,
    path: 'images/online-video_128_enabled.png',
  });
};

const updatePlaybackSpeedInCurrentTab = async (
  currentTab = { id: Number },
  request = { payload: Number },
  message = 'changePlaybackSpeed'
) => {
  if (message === 'changePlaybackSpeed') {
    console.log('message from slider.js / background.js');
    console.log({ currentTab, request, message });
  } else if (message === 'getPlayBackSpeedOnPageLoad') {
    console.log('message from on page load....');
    console.log({ currentTab, request, message });
  }
  return chrome.tabs.sendMessage(
    currentTab.id,
    {
      message,
      payload: request.payload,
    },
    (response) => {
      const { lastError = '' } = chrome.runtime;
      if (lastError) {
        console.log(lastError);
        return;
      }
      // should only run once on video load getPlayBackSpeedOnPageLoad to enable the popup
      if (response?.message === 'success' && message === 'getPlayBackSpeedOnPageLoad') {
        console.log('enabled!');
        console.log({ response, message });
        setEnabledPopup(currentTab.id);
      }
    }
  );
};

const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

const updateVideoSpeedInCurrentTabWindow = async (request) => {
  const currentTab = await getCurrentTab();
  updatePlaybackSpeedInCurrentTab(currentTab, request);
};

const regex = new RegExp('netflix', 'g');

// run when a new active tab and send store user playbackspeed to the contentScript event listener

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === 'complete' && /^http/.test(tab.url)) {
    console.log(tabId, changeInfo, tab);
    // netflix subtitles
    if (regex.test(tab.url)) {
      setEnabledPopup(tab.id);
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['./dist/netflix_subtitles.js'],
        },
        () => {
          chrome.storage.local.get('subtitlesOptions', (data) => {
            if (data) {
              chrome.tabs.sendMessage(
                tabId,
                {
                  message: 'update_netflix_subtitles_styles',
                  payload: data.subtitlesOptions,
                },
                (subResponse) => {
                  if (subResponse?.message === 'netflix subtitles styles enabled') {
                    console.log({ subTitlesMsg: subResponse.message });
                  }
                }
              );
            }
          });
        }
      );
    }
    chrome.storage.local.get('playbackspeed', (data) => {
      if (data) {
        updatePlaybackSpeedInCurrentTab(
          tab,
          {
            payload: data.playbackspeed,
          },
          'getPlayBackSpeedOnPageLoad'
        );
      }
    });
  }
});

const setOrUpdateChromeStorage = (request = { payload: Number }, type = '') => {
  chrome.storage.local.set({
    [type]: request.payload,
  });
};

chrome.runtime.onInstalled.addListener(async () => {
  setOrUpdateChromeStorage({ payload: 1 }, 'playbackspeed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // set the video speed in the video player to the value in localstorage
  if (request.message === 'foundVideo') {
    chrome.storage.local.get('playbackspeed', (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          message: 'fail',
        });
        return;
      }
      sendResponse({
        message: 'foundVideoSuccess',
        payload: data.playbackspeed,
      });
    });
    return true;
  }

  // update the videoplayback speed by moving the slider from popup in slider.js / popup.html & store value from slider in storage
  if (request.message === 'updatePlaybackSpeed') {
    sendResponse({
      message: 'success',
      payload: 'got your message slider',
    });
    setOrUpdateChromeStorage(request, 'playbackspeed');
    updateVideoSpeedInCurrentTabWindow(request);
    return true;
  }

  // when popup.html & slider.js is opened retrieve and set the storage playbackspeed value in pop.html
  if (request.message === 'getPlayBackSpeedFromStorage') {
    chrome.storage.local.get('playbackspeed', (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          message: 'fail',
        });
        return;
      }
      sendResponse({
        message: 'success',
        payload: data.playbackspeed,
      });
    });
    return true;
  }
  return true;
});
