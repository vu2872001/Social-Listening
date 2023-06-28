function getPathName() {
  return window.location.pathname.substring(1);
}

// example: home/product/add -> return ['home','product','add']
function getListPathName() {
  return getPathName().split('/');
}

// example: home?id=3&model=temp -> return [{id: '3'}, {model: 'temp'}]
function getQueryParamsFromUrl() {
  return window.location.search
    ? window.location.search
        .substring(1)
        .split('&')
        .map((x) => {
          let y = x.split('=');
          return {
            [y[0]]: y[1],
          };
        })
    : [];
}

// get current sub menu need to be opened
function getOpenKeyForMenu(list, current) {
  let openKey = '';
  list.forEach((item) => {
    if (item?.children?.length > 0) {
      item.children.forEach((x) => {
        if (x?.label === current) {
          openKey = item.key;
        }
      });
    }
  });
  return openKey;
}

// get current activated item in the menu
function getCurrentActivatedItemInMenu(hasChild = false, menu, key) {
  if (hasChild) {
    for (let item of menu) {
      if (item?.children?.length > 0) {
        for (let child of item.children) {
          if (child?.key === key) {
            return child;
          }
        }
      }
    }
  } else {
    for (let item of menu) {
      if (item?.key === key) {
        return item;
      }
    }
  }
}

function downloadFile(buffer, fileName, type) {
  const blob = new Blob([buffer], { type: type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const Getter = {
  getPathName,
  getListPathName,
  getQueryParamsFromUrl,
  getOpenKeyForMenu,
  getCurrentActivatedItemInMenu,
  downloadFile,
};
