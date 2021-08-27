// update the playback speed based on the slider changing the input
const sendUpdatedPlaybackSpeedToBackground = (newValueFromSlider) => {
  console.log({ newValueFromSlider });
  chrome.runtime.sendMessage(
    {
      message: 'updatePlaybackSpeed',
      payload: newValueFromSlider,
    },
    (response) => {
      const { lastError = '' } = chrome.runtime;
      if (lastError) {
        console.log(lastError);
        return;
      }
      if (response.message === 'success') {
        console.log('background to slider message:');
        console.log({ message: response.message, payload: response.payload });
      }
    }
  );
};

// let rangePercent = rangeInput.value;
const handleOnInputChange = ({ target = { value: Number } }) => {
  const rangeInput = document.querySelector('.slider-input');
  const h4Selector = document.querySelector('h4');
  const currentSpeedSelector = document.querySelector('.current-speed-container strong');
  const value = parseFloat(target.value);
  const fractionalValue = value / 10;
  // update the input value & the h4 text & current speed value
  rangeInput.value = value;
  h4Selector.innerHTML = `${fractionalValue.toFixed(1)}<span></span>`;
  currentSpeedSelector.textContent = `${fractionalValue.toFixed(1)}X`;
  // css updates
  rangeInput.style.filter = `hue-rotate(-${value}deg)`;
  h4Selector.firstElementChild.style.filter = `hue-rotate(-${value}deg)`;
  h4Selector.style.transform = `translateX(-50%) scale(${1 + value / 100})`;
  h4Selector.style.left = `${value}%`;
  // send message to background.js with new value
  sendUpdatedPlaybackSpeedToBackground(fractionalValue);
};

// listen for on input change events
const sliderInput = document.querySelector('.slider-input');
sliderInput.addEventListener('input', (event) => {
  handleOnInputChange(event);
});

const button = document.querySelector('button');
button.addEventListener('click', (event) => {
  event.preventDefault();
  // must be 10 to reset speed to 1 because of the slider range value
  const resetValue = { target: { value: 10 } };
  handleOnInputChange(resetValue);
  window.close();
});

// the slider in popup.html on open
const updateSliderValues = (payloadValue = Number) => {
  const event = { target: { value: payloadValue * 10 } };
  handleOnInputChange(event);
  return payloadValue;
};

// get the playbackspeed from local storage when the popup.html opens
chrome.runtime.sendMessage(
  {
    message: 'getPlayBackSpeedFromStorage',
    payload: null,
  },
  (backgroundJSRes) => {
    const { lastError = '' } = chrome.runtime;
    if (lastError) {
      console.log(lastError);
      return;
    }
    if (backgroundJSRes?.message === 'success') {
      console.log('slider.js : chrome storage value response on popup open from background.js');
      console.log({ backgroundJSRes });
      updateSliderValues(backgroundJSRes.payload);
    }
  }
);
