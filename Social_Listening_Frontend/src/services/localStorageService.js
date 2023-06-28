import { Checker } from '../utils/dataChecker';

function isEmpty() {
  return localStorage.length <= 0;
}

function isEmptyKeyOrValue(key, value) {
  if (Checker.isNullOrEmpty(key) || Checker.isNullOrEmpty(value)) {
    return true;
  } else {
    return false;
  }
}

//if there is no key, it will return the first item
function getItem(key) {
  return key
    ? localStorage.getItem(key)
    : '';
}

function getLastItem() {
  return !isEmpty
    ? localStorage.getItem(localStorage.key(localStorage.length))
    : '';
}

function getValueAt(index) {
  return !isEmpty
    ? localStorage.getItem(localStorage.key(index))
    : '';
}

function getArray(key) {
  let item = getItem(key);
  return item ? item : [];
}

function setItem(key, value) {
  if (isEmptyKeyOrValue(key, value)) {
    return;
  } else {
    return localStorage.setItem(key, value);
  }
}

// add to first, if exist push it to top
function addToArray(key, value) {
  if (isEmptyKeyOrValue(key, value)) {
    return;
  } else {
    let list = getArray(key);
    let existItem = list.filter(
      (x) => x.profile_id === value.profile_id
    );

    // if don't have add new
    if (Checker.isNullOrEmpty(existItem)) {
      list.unshift(value);
      setItem(key, list);
    }
    // if already had make it top
    else {
      // remove it from the list
      const remove = list.filter(
        (x) => x.profile_id !== value.profile_id
      );
      // add to top
      remove.unshift(value);
      setItem(key, remove);
    }
  }
}

function deleteFromArray(key, value) {
  if (isEmptyKeyOrValue(key, value)) {
    return;
  } else {
    let list = getArray(key);
    if (list.length > 1) {
      let existItem = list.filter(
        (x) => x.profile_id !== value.profile_id
      );
      setItem(key, existItem);
    } else {
      clear(key);
    }
  }
}

//if there is no key, it will clear all
function clear(key) {
  return key ? localStorage.removeItem(key) : localStorage.clear();
}

export const localStorageService = {
  getLastItem,
  getItem,
  getValueAt,
  setItem,
  clear,
  isEmpty,
  getArray,
  addToArray,
  deleteFromArray,
  isEmptyKeyOrValue,
};
