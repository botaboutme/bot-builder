/* eslint-disable lingui/no-unlocalized-strings */
(function initializeTheme() {
  console.log("No dark Mode!");
  document.documentElement.classList.remove("dark");
  // try {
  //   if (
  //     localStorage.theme === "dark" ||
  //     // eslint-disable-next-line lingui/no-unlocalized-strings
  //     window.matchMedia("(prefers-color-scheme: dark)").matches
  //   ) {
  //     document.documentElement.classList.remove("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // } catch (_) {
  //   // pass
  // }
})();
