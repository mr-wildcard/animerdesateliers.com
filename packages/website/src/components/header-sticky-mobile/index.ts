enum ScrollDirection {
  UP,
  DOWN,
}

(function () {
  const stickyButtonShowCSSClass = "show";

  const stickyButton = document.querySelector<HTMLDivElement>("#sticky-button");

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

    window.addEventListener(
      "scroll",
      function () {
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
              scrollAmount = Math.max(scrollAmount, -stickyHeaderHeight - 1);
            }

            stickyButton.style.transform = `translateY(${scrollAmount}px)`;

            ticking = false;
          });
        }
      },
      { passive: true }
    );
  });
})();
