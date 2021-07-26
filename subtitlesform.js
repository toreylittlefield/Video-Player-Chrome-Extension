let regex = new RegExp('netflix', 'g');
let queryOptions = { active: true, currentWindow: true };
let formInputs = ['verticalPosition', 'fontSize', 'fontColor', 'fontWeight'];
chrome.tabs.query(queryOptions, (tabs) => {
  if (tabs) {
    const [currentTab] = tabs;
    console.log(currentTab);
    console.log({ currentTabURL: currentTab.url });
    if (regex.test(currentTab?.url)) {
      console.log('sending back success message to popup.html for netflix form...');
      const subTitlesContainerSelector = document.querySelector('.subtitles-container');
      // section title
      const H2Element = document.createElement('h2');
      H2Element.textContent = 'Adjust Netflix Subtitles';
      subTitlesContainerSelector.appendChild(H2Element);

      // form
      const form = document.createElement('form');
      form.id = 'subtitles-form';
      //fieldset
      const fieldSet = document.createElement('fieldset');
      subTitlesContainerSelector.appendChild(form);
      form.appendChild(fieldSet);
      // lengend
      const legendElement = document.createElement('legend');
      legendElement.textContent = 'Subtitle Styles';
      fieldSet.appendChild(legendElement);
      // ul
      const ULElement = document.createElement('ul');
      fieldSet.appendChild(ULElement);

      formInputs.forEach((inputEl) => {
        const LIElement = document.createElement('li');
        const label = document.createElement('label');
        const input = document.createElement('input');
        if (inputEl === 'fontColor') {
          input.type = 'color';
        } else if (inputEl === 'fontWeight') {
          input.type = 'number';
          // create datalist with options
          const dataList = document.createElement('datalist');
          dataList.id = 'fontWeight-options';
          //options in datalist
          const optionsForDataList = [100, 200, 300, 400, 500, 600, 700, 800, 900];
          optionsForDataList.forEach((option) => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            dataList.appendChild(optionElement);
          });
          input.append(dataList);
          input.setAttribute('list', dataList.id);
          console.log({ dataList, input });
          input.step = 100;
          input.min = 100;
          input.max = 900;
          input.defaultValue = 600;
        } else {
          input.type = 'number';
        }
        input.value = '';
        label.for = inputEl;
        input.id = inputEl;
        label.textContent = `Change the: ${inputEl}`;
        LIElement.appendChild(label);
        LIElement.appendChild(input);
        ULElement.appendChild(LIElement);
      });
      // button
      const button = document.createElement('button');
      button.className = 'set-subtitles-btn';
      button.type = 'submit';
      button.textContent = 'Change Subtitles';
      fieldSet.appendChild(button);

      const formToSubmit = document.querySelector('#subtitles-form');

      formToSubmit.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log(event.target);
        const [verticalPosition, fontSize, fontColor, fontWeight] = [
          ...formInputs.map((inputId) => event.target[inputId].value),
        ];
        console.log({ verticalPosition, fontColor, fontSize, fontWeight });
        chrome.tabs.sendMessage(
          currentTab.id,
          {
            message: 'update_netflix_subtitles_styles',
            payload: { verticalPosition, fontSize, fontColor, fontWeight },
          },
          (responseSubtitles) => {
            if (responseSubtitles?.message === 'netflix subtitles styles enabled') {
              console.log({ subTitlesMsg: responseSubtitles.message });
            }
          }
        );
      });
      // sendResponse({
      //   message: 'success',
      //   payload: true,
      // });
    }
  }
});

// chrome.runtime.sendMessage(
//   {
//     message: 'isNetFlix',
//     payload: null,
//   },
//   (responseisNetflix) => {
//     if (responseisNetflix?.message === 'success') {
//       console.log('slider.js : chrome storage value response on popup open from background.js');
//       console.log({ responseisNetflix });
//       const subTitlesContainerSelector = document.querySelector('.subtitles-container');
//       const form = document.createElement('form');
//       const input = document.createElement('input');
//       const button = document.createElement('button');
//       button.className = 'set-subtitles-btn';
//       form.appendChild(input)
//       button.addEventListener('submit', (e) => {
//         e.preventDefault();

//       })
//       subTitlesContainerSelector;
//     }
//   }
// );
