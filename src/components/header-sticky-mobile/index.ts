enum ScrollDirection {
  UP,
  DOWN,
}

const stickyButtonShowCSSClass = "show";

const stickyButton = document.querySelector("#sticky-button");

function scrollDirectionChanged(callback) {
  let last_known_scroll_position = 0;
  let ticking = false;
  let currentScrollDirection: ScrollDirection;

  window.addEventListener(
    "scroll",
    function () {
      let previous_known_scroll_position = last_known_scroll_position;
      last_known_scroll_position = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(function () {
          const newScrollDirection: ScrollDirection =
            last_known_scroll_position > previous_known_scroll_position ? ScrollDirection.DOWN : ScrollDirection.UP;

          if (newScrollDirection !== currentScrollDirection) {
            currentScrollDirection = newScrollDirection;

            callback(newScrollDirection);
          }

          ticking = false;
        });

        ticking = true;
      }
    },
    { passive: true }
  );
}

window.addEventListener("DOMContentLoaded", (event) => {
  const headerHTMLElement = document.querySelector("#header-wrapper");

  let { height: stickyHeaderHeight } = stickyButton.getBoundingClientRect();
  let headerHTMLElementIsVisible = false;

  const headerIO = new IntersectionObserver((entries) => {
    const [header] = entries;

    headerHTMLElementIsVisible = header.isIntersecting;

    if (headerHTMLElementIsVisible && stickyButton.classList.contains(stickyButtonShowCSSClass)) {
      stickyButton.classList.remove(stickyButtonShowCSSClass);
    }
  });

  const stickyHeaderRO = new ResizeObserver((entries) => {
    const [stickyHeader] = entries;

    let { blockSize } = stickyHeader.borderBoxSize[0];

    stickyHeaderHeight = blockSize;
  });

  headerIO.observe(headerHTMLElement);
  stickyHeaderRO.observe(stickyButton);

  scrollDirectionChanged((scrollDirection: ScrollDirection) => {
    const stickyButtonIsVisible = stickyButton.classList.contains(stickyButtonShowCSSClass);

    if (scrollDirection === ScrollDirection.UP && !stickyButtonIsVisible && !headerHTMLElementIsVisible) {
      stickyButton.classList.add(stickyButtonShowCSSClass);
    } else if (scrollDirection === ScrollDirection.DOWN && stickyButtonIsVisible) {
      stickyButton.classList.remove(stickyButtonShowCSSClass);
    }
  });
});
