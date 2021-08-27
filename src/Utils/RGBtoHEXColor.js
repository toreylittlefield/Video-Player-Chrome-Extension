// https://css-tricks.com/converting-color-spaces-in-javascript/
const RGBtoHEXColor = (fontColor = '') => {
  const isRGB = fontColor.includes('rgb(');
  if (!isRGB) return fontColor;
  // Choose correct separator
  const sep = fontColor.indexOf(',') > -1 ? ',' : ' ';
  // Turn "rgb(r,g,b)" into [r,g,b]
  const rgb = fontColor.substr(4).split(')')[0].split(sep);

  let r = (+rgb[0]).toString(16);
  let g = (+rgb[1]).toString(16);
  let b = (+rgb[2]).toString(16);

  if (r.length === 1) r = `0${r}`;
  if (g.length === 1) g = `0${g}`;
  if (b.length === 1) b = `0${b}`;

  return `#${r}${g}${b}`;
};

export default RGBtoHEXColor;
