if (typeof fetch === "function") {
  const nativeFetch = fetch;
  globalThis.fetch = (url: any, init: any = {}) => {
    if (init && init.referrer === "client") {
      // delete or normalise the illegal value
      delete init.referrer; // simplest fix
      // or: init.referrer = 'about:client';
    }
    return nativeFetch(url, init);
  };
}
