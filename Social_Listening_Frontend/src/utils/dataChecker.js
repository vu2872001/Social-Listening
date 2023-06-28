// #region object
function isEmptyObject(obj, checkValue = false) {
  if (!obj.constructor === Object) {
    return false;
  } else {
    let res = true;
    if (!checkValue) {
      for (let prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          res = false;
        }
      }
      return res && JSON.stringify(obj) === JSON.stringify({});
    } else {
      if (obj) {
        Object.values(obj).forEach((x) => {
          if (x) {
            res = false;
          }
        });
      }
      return res;
    }
  }
}

// if checkAll = true, object must have all the props
// else object must have one prop in the listProps
function hasPropsInObject(object, listProps = [], checkAll) {
  if (!isEmptyObject(object, true)) return false;
  else {
    let res = checkAll;
    listProps.forEach((value) => {
      if (checkAll) {
        if (!object.hasOwnProperty(value)) {
          res = false;
        }
      } else {
        if (object.hasOwnProperty(value)) {
          res = true;
        }
      }
    });
    return res;
  }
}

// for two object only
function isDataChange(before, after) {
  let isChange = false;
  if (before && after) {
    Object.keys(after).forEach((key) => {
      before[key] = before[key] ?? '';
      after[key] = after[key] ?? '';
      if (String(before[key]) !== String(after[key])) {
        isChange = true;
      }
    });
  }
  return isChange;
}
// #endregion

// #region array
// if checkValueInObject = true, check object inside the array is null or not
function isEmptyObjectList(list, checkValueInObject = false) {
  if (list.length < 0) return true;
  else {
    let res = true;
    list?.forEach((x) => {
      if (!isEmptyObject(x, checkValueInObject)) {
        res = false;
      }
    });
    return res;
  }
}

function isArrayList(value) {
  if (!Array.isArray(value) || !value.length) return false;
  else {
    let res = true;
    value.forEach((item) => {
      if (!Array.isArray(item)) res = false;
    });
    return res;
  }
}

function isObjectList(value) {
  if (!Array.isArray(value) || !value.length) return false;
  else {
    let res = true;
    value.forEach((item) => {
      if (item !== Object(item)) res = false;
    });
    return res;
  }
}

function isEqualArrays(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every(
      (val, index) =>
        val === b[index] ||
        JSON.stringify(val) === JSON.stringify(b[index])
    )
  );
}

function checkValueExistInArray(array, value) {
  return array.length > 0 && array.includes(value);
}
// #endregion

// for every data except object
function isNullOrEmpty(value) {
  return (
    !value ||
    value === undefined ||
    value === null ||
    value === '' ||
    value.length === 0
  );
}

// for string only
function isEmptyOrSpaces(str) {
  return str === null || str.match(/^ *$/) !== null;
}

function isDateString(input) {
  if (!input) {
    return false;
  }
  if (isNaN(Date.parse(input))) {
    return false;
  }
  return true;
}

function checkURL(value, defaultConfig = {}, lastOnly = false) {
  const pathArray = window.location.pathname.split('/');
  if (lastOnly) {
    return pathArray[pathArray.length - 1] === value.toLowerCase();
  } else {
    return (
      pathArray.includes(value.toLowerCase()) ||
      (value === defaultConfig.url &&
        pathArray[pathArray.length - 1] === defaultConfig.path)
    );
  }
}

export const Checker = {
  isNullOrEmpty,
  isObjectList,
  isArrayList,
  isDateString,
  isEmptyObject,
  isEmptyObjectList,
  checkValueExistInArray,
  isDataChange,
  isEqualArrays,
  hasPropsInObject,
  isEmptyOrSpaces,
  checkURL,
};
