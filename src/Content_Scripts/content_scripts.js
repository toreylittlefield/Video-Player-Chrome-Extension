import { attachVideoListener } from './control_video';

const checkForVideoInChildNodes = (node = {}, parent = {}) => {
  // // jw-video jw-reset parent className for the typical  jw-player
  // node.className === 'jw-video jw-reset'
  if (node.nodeName === 'VIDEO' || node.nodeName === 'AUDIO') {
    attachVideoListener(parent);
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

const checkIsNetFlix = async () => {
  const regex = new RegExp('netflix', 'g');
  if (regex.test(document.location.orgin) || regex.test(document.URL)) {
    return true;
  }
  return false;
};

(async function init() {
  const isNetflix = await checkIsNetFlix();
  if (!isNetflix && window.document) {
    console.log('Running Mutation Observer To Find Videos');
    const allDocsOnPage = getAllDocs();
    allDocsOnPage.forEach(mutate);
  }
})();
