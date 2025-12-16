let toastFunction = null;

export const setToastFunction = fn => {
  toastFunction = fn;
};

export const showToast = (message, type, duration) => {
  if (toastFunction) {

    toastFunction(message, type, duration);
  }
};
