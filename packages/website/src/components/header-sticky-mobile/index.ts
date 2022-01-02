enum ScrollDirection {
  UP,
  DOWN,
}

(function () {
  const stickyButtonShowCSSClass = "show";

  const stickyButton = document.querySelector<HTMLDivElement>("#sticky-button");
  const { desktopMinWidth } = stickyButton.dataset;
  const desktopMedia = window.matchMedia(`(min-width: ${desktopMinWidth})`);

  window.addEventListener("DOMContentLoaded", (event) => {
    const headerHTMLElement = document.querySelector<HTMLDivElement>("#header-wrapper");

    let { height: stickyHeaderHeight } = stickyButton.getBoundingClientRect();
    let headerHTMLElementIsVisible = false;

    const stickyHeaderRO = new ResizeObserver((entries) => {
      const [stickyHeader] = entries;

      let { blockSize } = stickyHeader.borderBoxSize[0];

      stickyHeaderHeight = blockSize;
    });

    stickyHeaderRO.observe(stickyButton);

    let previous_known_scroll_position = window.scrollY;
    let last_known_scroll_position = window.scrollY;
    let ticking = false;
    let currentScrollDirection: ScrollDirection;
    let scrollAmount = 0;

    function onScroll() {
      if (!ticking) {
        ticking = true;

        window.requestAnimationFrame(function () {
          previous_known_scroll_position = last_known_scroll_position;
          last_known_scroll_position = window.scrollY;

          const scrollDirection: ScrollDirection =
            last_known_scroll_position > previous_known_scroll_position ? ScrollDirection.DOWN : ScrollDirection.UP;

          scrollAmount -= last_known_scroll_position - previous_known_scroll_position;

          if (scrollDirection === ScrollDirection.UP) {
            scrollAmount = Math.min(scrollAmount, 0);
          } else {
            /**
             * -1 : hide the remaining 1px border bottom of sticky header.
             */
            scrollAmount = Math.max(scrollAmount, -stickyHeaderHeight - 1);
          }

          stickyButton.style.transform = `translateY(${scrollAmount}px)`;

          ticking = false;
        });
      }
    }

    desktopMedia.addEventListener("change", () => {
      if (!desktopMedia.matches) {
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    });

    if (!desktopMedia.matches) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  });
})();
