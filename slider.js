// update the playback speed based on the slider changing the input
const sendUpdatedPlaybackSpeedToBackground = (newValueFromSlider) => {
  console.log({ newValueFromSlider });
  chrome.runtime.sendMessage(
    {
      message: 'updatePlaybackSpeed',
      payload: newValueFromSlider,
    },
    (response) => {
      if (response.message === 'success') {
        console.log('background to slider message:');
        console.log({ message: response.message, payload: response.payload });
      }
    }
  );
};

// let rangePercent = rangeInput.value;
const handleOnInputChange = ({ target = { value: Number } }) => {
  let rangeInput = document.querySelector('.slider-input');
  let h4Selector = document.querySelector('h4');
  const value = parseFloat(target.value);
  const fractionalValue = value / 10;
  // update the input value & the h4 text
  document.querySelector('.slider-input').value = value;
  h4Selector.innerHTML = fractionalValue + '<span></span>';
  // css updates
  rangeInput.style.filter = `hue-rotate(-${value}deg)`;
  h4Selector.firstElementChild.style.filter = `hue-rotate(-${value}deg)`;
  h4Selector.style.transform = `translateX(-50%) scale(${1 + value / 100})`;
  h4Selector.style.left = `${value}%`;
  //send message to background.js with new value
  sendUpdatedPlaybackSpeedToBackground(fractionalValue);
};

// listen for on input change events
let sliderInput = document.querySelector('.slider-input');
sliderInput.addEventListener('input', (event) => {
  handleOnInputChange(event);
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
    if (backgroundJSRes?.message === 'success') {
      console.log(
        'slider.js : chrome storage value response on popup open from background.js'
      );
      console.log({ backgroundJSRes });
      updateSliderValues(backgroundJSRes.payload);
    }
  }
);
