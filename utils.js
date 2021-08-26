// https://css-tricks.com/converting-color-spaces-in-javascript/
export const RGBtoHEXColor = (fontColor = '') => {
  const isRGB = fontColor.includes('rgb(');
  if (!isRGB) return fontColor;
  // Choose correct separator
  let sep = fontColor.indexOf(',') > -1 ? ',' : ' ';
  // Turn "rgb(r,g,b)" into [r,g,b]
  rgb = fontColor.substr(4).split(')')[0].split(sep);

  let r = (+rgb[0]).toString(16),
    g = (+rgb[1]).toString(16),
    b = (+rgb[2]).toString(16);

  if (r.length == 1) r = '0' + r;
  if (g.length == 1) g = '0' + g;
  if (b.length == 1) b = '0' + b;

  return '#' + r + g + b;
};
