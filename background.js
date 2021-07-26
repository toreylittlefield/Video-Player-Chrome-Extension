// set to enabled popup html
const setEnabledPopup = (tabId) => {
  chrome.action.setPopup({
    tabId: tabId,
    popup: 'popup.html',
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
  return await chrome.tabs.sendMessage(
    currentTab.id,
    {
      message: message,
      payload: request.payload,
    },
    (response) => {
      // should only run once on video load getPlayBackSpeedOnPageLoad to enable the popup
      if (response?.message === 'success' && message === 'getPlayBackSpeedOnPageLoad') {
        console.log('enabled!');
        console.log({ response, message });
        setEnabledPopup(currentTab.id);
      }
    }
  );
};

const updateVideoSpeedInCurrentTabWindow = async (request) => {
  const currentTab = await getCurrentTab();
  updatePlaybackSpeedInCurrentTab(currentTab, request);
};

let regex = new RegExp('netflix', 'g');

const checkForVideo = () => document.querySelector('video')?.playbackRate ?? null;

// run when a new active tab and send store user playbackspeed to the contentScript event listener
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === 'complete' && /^http/.test(tab.url)) {
    // netflix
    if (regex.test(tab.url)) {
      console.log({ tabId, changeInfo, tab });
      setEnabledPopup(tab.id);
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ['netflix_subtitles.js'],
        },
        () => {
          chrome.tabs.sendMessage(
            tabId,
            {
              message: 'update_netflix_subtitles_styles',
              payload: {
                verticalPosition: 0,
                fontSize: 70,
                fontColor: '#FFF',
                fontWeight: 'normal',
              },
            },
            (subResponse) => {
              if (subResponse?.message === 'netflix subtitles styles enabled') {
                console.log({ subTitlesMsg: subResponse.message });
              }
            }
          );
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
        // }
      }
    });
  }
});

const getCurrentTab = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

const setOrUpdateChromeStorage = (request = { payload: Number }) => {
  chrome.storage.local.set({
    playbackspeed: request.payload,
  });
};

chrome.runtime.onInstalled.addListener(async () => {
  setOrUpdateChromeStorage({ payload: 1 });
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
    setOrUpdateChromeStorage(request);
    updateVideoSpeedInCurrentTabWindow(request);
    return;
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

  // if (request.message === 'isNetFlix') {
  //   console.log('isNetflix');
  //   console.log({ isNetlfix: request.message });
  //   let queryOptions = { active: true, currentWindow: true };
  //   chrome.tabs.query(queryOptions, (tabs) => {
  //     if (tabs) {
  //       const [currentTab] = tabs;
  //       console.log(currentTab);
  //       console.log({ currentTabURL: currentTab.url });
  //       if (regex.test(currentTab?.url)) {
  //         console.log('sending back success message to popup.html for netflix form...');
  //         sendResponse({
  //           message: 'success',
  //           payload: true,
  //         });
  //       }
  //     }
  //   });
  //   return true;
  // }
});
