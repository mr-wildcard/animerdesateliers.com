/**
 * Mainly for iOS 12 support.
 * @param mediaQueryList
 * @param callback
 */
export function listenToMediaQueryListChange(mediaQueryList: MediaQueryList, callback) {
  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener("change", callback);
  } else {
    mediaQueryList.addListener(callback);
  }
}
