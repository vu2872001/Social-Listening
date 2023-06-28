import { Checker } from './dataChecker';

function convertArrayToObject(array, key) {
  return array.reduce((obj, item, index) => {
    return key
      ? { ...obj, [item[key]]: item }
      : { ...obj, [index]: item };
  }, {});
}

function convertArrayObjectToObject(arrayObject) {
  return arrayObject.reduce(function (obj, item) {
    let keys = Object.keys(item);
    obj[keys[0]] = item[keys[0]] ?? '';
    return obj;
  }, {});
}

function toUpperCaseFirstLetter(str) {
  try {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  } catch (ex) {
    console.log(ex);
  }
  return str;
}

function toLowerCaseFirstLetter(str) {
  try {
    str = str.charAt(0).toLowerCase() + str.slice(1);
  } catch (ex) {
    console.log(ex);
  }
  return str;
}

function splitSpaceString(str) {
  return str.replace(/\s/g, '');
}

function createSpaceString(str) {
  if (str === null || str === undefined) return null;
  return str.match(/[A-Z][a-z]+/g).join(' ');
}

// add the s at the final string
// if amount is null or undefined or < 0 it will return default string
// else it will return the string with the s at the final if amount > 1
function convertMultiple(string, amount, defaultString) {
  if (!amount) {
    return defaultString;
  } else {
    if (amount > 1) {
      return amount + ' ' + string + 's';
    } else return amount + ' ' + string;
  }
}

function convertStringToLowerCase(str) {
  if (str) {
    return str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((x) => x.toLowerCase())
      .join(' ');
  }
  return '';
}

function convertStringToTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function converCamelCaseToTitleCase(camelCase) {
  if (camelCase === null || camelCase === '') {
    return camelCase;
  }

  camelCase = camelCase.trim();
  let newText = '';
  for (let i = 0; i < camelCase.length; i++) {
    if (
      /[A-Z]/.test(camelCase[i]) &&
      i !== 0 &&
      /[a-z]/.test(camelCase[i - 1])
    ) {
      newText += ' ';
    }
    if (i === 0 && /[a-z]/.test(camelCase[i])) {
      newText += camelCase[i].toLowerCase();
    } else {
      newText += camelCase[i].toLowerCase();
    }
  }

  return newText;
}

function replaceUrl(object, fromUrl, toUrl) {
  return object.split(fromUrl).join(toUrl);
}

function convertListToLabelValueFormat(list) {
  let formatOptions = [];
  try {
    // check the list is a list and it not empty
    if (Array.isArray(list) && list?.length > 0) {
      // check the list is an object list
      if (Checker.isObjectList(list)) {
        list.forEach((item) => {
          let numberOfKeys = Object.keys(item).length;
          if (numberOfKeys === 1) {
            Object.values(item).forEach((value) => {
              formatOptions.push({
                label: value,
                value: value,
              });
            });
          }
          // number of keys in the object, it will get the first value of object as value and the second one as label
          else {
            // the object doesn't has any of 2 keys value and label
            if (
              !item.hasOwnProperty('value') ||
              !item.hasOwnProperty('label')
            ) {
              Object.values(item).forEach((x, index) => {
                if (index === 0) {
                  formatOptions.push({ value: x });
                } else if (index === 1) {
                  formatOptions[formatOptions.length - 1]['label'] =
                    x;
                }
              });
            }
            // the object already has 2 keys value and label
            else {
              formatOptions = list;
            }
          }
        });
      }
      // the options is a simeple list
      else {
        formatOptions = list.map((item) => {
          return {
            value: item,
            label: item,
          };
        });
      }
    }
  } catch (ex) {
    console.log(ex);
  }
  return formatOptions;
}

export const Converter = {
  convertArrayToObject,
  convertArrayObjectToObject,
  convertMultiple,
  convertStringToLowerCase,
  convertStringToTitleCase,
  converCamelCaseToTitleCase,
  toUpperCaseFirstLetter,
  toLowerCaseFirstLetter,
  splitSpaceString,
  createSpaceString,
  replaceUrl,
  convertListToLabelValueFormat,
};
