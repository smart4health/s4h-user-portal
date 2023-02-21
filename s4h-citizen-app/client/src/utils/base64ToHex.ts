export const base64ToHex = (str: string) => {
  for (
    var i = 0, bin = atob(str.replace(/[ \r\n]+$/, '')), hex = [];
    i < bin.length;
    ++i
  ) {
    let tmp = bin.charCodeAt(i).toString(16);
    if (tmp.length === 1) tmp = '0' + tmp;
    hex[hex.length] = tmp;
  }
  return hex.join('');
};
