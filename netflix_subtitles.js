changeSubtitlesStyle = (
  verticalPosition = 0,
  fontSize = 50,
  fontColor = 'currentColor',
  fontWeight = 'currentColor'
) => {
  console.log('%cnetflix-subtitles-styler : observer is working... ', 'color: red;');

  observeSubtitles = () => {
    // .player-timedText
    const subtitles = document.querySelector('.player-timedtext');
    if (subtitles) {
      subtitles.style.bottom = verticalPosition + 'px';

      // .player-timedtext-text-container
      const firstChildContainer = subtitles.firstChild;
      if (firstChildContainer) {
        // center the subtitles
        firstChildContainer.style.left = '0';
        firstChildContainer.style.right = '0';

        // the subtitles texts
        const subtitleSpans = firstChildContainer.children;
        if (subtitleSpans) {
          for (const span of Array.from(subtitleSpans)) {
            span.style.fontSize = fontSize + 'px';
            span.style.fontWeight = fontWeight;
            span.style.color = fontColor;
          }
        }
      }
    }
  };

  const observer = new MutationObserver(observeSubtitles);
  observer.observe(document.body.querySelector('.VideoContainer'), {
    subtree: true,
    attributes: false,
    childList: true,
  });
};

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
});
