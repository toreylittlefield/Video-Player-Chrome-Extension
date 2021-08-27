import { attachVideoListener } from './control_video';

const attachToVideo = () => {
  const videoElement = () => document.querySelector('video');
  const intervalTimer = setInterval(() => {
    if (videoElement()) {
      console.count('video found');
      attachVideoListener(window.document.body, true);
      console.log('adding listeners for netflix...');
      console.log(videoElement());
      clearInterval(intervalTimer);
    }
  }, 1000);
};

const addVideoSelector = () => {
  attachToVideo();
};

export default addVideoSelector;
