let regex = new RegExp('netflix', 'g');
let queryOptions = { active: true, currentWindow: true };
let formInputsToQuery = ['verticalPosition', 'fontSize', 'fontColor', 'fontWeight'];

const checkUrlIsNetFlix = (tab) => {
  return regex.test(tab?.url);
};

const createSelectOptionElements = (key = '', propValue = []) => {
  if (key !== 'options') return;
  propValue?.optionsValues.forEach((option) => {
    const optionElement = document.createElement('option');
    const parentSelectElement = document.querySelector(propValue?.parentToAppendTo);
    parentSelectElement.appendChild(optionElement);
    optionElement.value = option;
    optionElement.textContent = option;
    // selected value
    if (propValue?.selected === option) {
      optionElement.selected = propValue.selected;
    }
  });
};

const createElements = (elements = [{}]) => {
  elements.forEach((element) => {
    // create & attach as child to parent element
    const createdElement = document.createElement(element.tagName);
    const parentElement = document.querySelector(element.appendAsChild);
    parentElement.appendChild(createdElement);

    // add all props
    const keys = Object.keys(element);
    keys.forEach((key) => {
      if (key !== 'tagName' || key !== 'appendAsChild') {
        const propValue = element[key];
        if (propValue) createdElement[key] = propValue;
        // create options elements for select elements
        if (key === 'options') createSelectOptionElements(key, propValue);
      }
    });
  });
};

const createParentElements = () => {
  const elements = [
    {
      tagName: 'h2',
      textContent: 'Adjust Netflix Subtitles',
      id: '',
      className: '',
      type: '',
      appendAsChild: '.subtitles-container',
    },
    {
      tagName: 'form',
      textContent: '',
      id: 'subtitles-form',
      className: '',
      type: '',
      appendAsChild: '.subtitles-container',
    },
    { tagName: 'fieldset', textContent: '', id: '', className: '', type: '', appendAsChild: 'form' },
    {
      tagName: 'legend',
      textContent: 'Subtitle Styles',
      id: '',
      className: '',
      type: '',
      appendAsChild: 'fieldset',
    },
    { tagName: 'ul', textContent: '', id: '', className: 'form-list', type: '', appendAsChild: 'fieldset' },
    {
      tagName: 'button',
      textContent: 'Change Subtitles',
      id: '',
      className: 'set-subtitles-btn',
      type: 'submit',
      appendAsChild: 'fieldset',
    },
  ];
  createElements(elements);
};

const createFormLabels = () => {
  let formInputs = [
    {
      name: 'verticalPosition',
      tagName: 'input',
      forAndId: 'verticalPosition',
      labelText: 'Adjust Vertical Position',
      placeholder: '0',
      inputType: 'number',
      inputMin: -100,
      inputMax: 1200,
      inputStep: 1,
      defaultValue: 0,
    },
    {
      name: 'fontSize',
      tagName: 'input',
      forAndId: 'fontSize',
      labelText: 'Adjust Subtitles Size',
      placeholder: '50',
      inputType: 'number',
      inputMin: 10,
      inputMax: 100,
      inputStep: 2,
      defaultValue: 32,
    },
    {
      name: 'fontColor',
      tagName: 'input',
      forAndId: 'fontColor',
      labelText: 'Select The Font Color',
      placeholder: null,
      inputType: 'color',
      inputMin: null,
      inputMax: null,
      inputStep: null,
      defaultValue: '#ffffff',
    },
    {
      name: 'fontWeight',
      tagName: 'select',
      forAndId: 'fontWeight',
      labelText: 'Select Font Thickness',
      placeholder: '600',
      options: {
        parentToAppendTo: '#fontWeight',
        optionsValues: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        selected: 500,
      },
      inputType: 'number',
      inputMin: 100,
      inputMax: 900,
      inputStep: 100,
      defaultValue: 600,
    },
  ];
  const formElements = [
    {
      tagName: 'li',
      textContent: '',
      id: '',
      className: '',
      type: '',
      for: '',
      appendAsChild: '.form-list',
    },
    {
      tagName: 'label',
      textContent: '',
      id: '',
      className: '',
      type: '',
      for: '',
      appendAsChild: '',
    },
    {
      tagName: 'input',
      textContent: '',
      id: '',
      className: '',
      type: '',
      for: '',
      appendAsChild: '',
    },
  ];
  // create the props for each element
  formInputs.forEach((formInput) => {
    const [li, label, input] = [...formElements];
    li.className = formInput.name + '-li';
    label.appendAsChild = '.' + li.className;
    label.textContent = formInput.labelText;
    label.for = formInput.forAndId;
    input.tagName = formInput.tagName;
    input.id = formInput.forAndId;
    input.name = formInput.name;
    input.type = formInput.inputType;
    input.placeholder = formInput.placeholder;
    input.value = formInput.defaultValue;
    input.min = formInput.inputMin;
    input.max = formInput.inputMax;
    input.step = formInput.inputStep;
    input.appendAsChild = '.' + li.className;
    if (formInput.options) {
      input.options = formInput.options;
    }
    createElements(formElements);
  });
};

// add the form listener
const formListener = (currentTab = {}) => {
  const formToSubmit = document.querySelector('#subtitles-form');
  formToSubmit.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log(event.target);
    const [verticalPosition, fontSize, fontColor, fontWeight] = [
      ...formInputsToQuery.map((inputId) => event.target[inputId].value),
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
};

chrome.tabs.query(queryOptions, (tabs) => {
  if (!tabs) return;
  const [currentTab] = tabs;
  if (!checkUrlIsNetFlix(currentTab)) return;
  // create parents like form, lengend, button, ul...
  createParentElements();
  // create elements inside the form i.e li,labels, inputs...
  createFormLabels();
  formListener(currentTab);
});
