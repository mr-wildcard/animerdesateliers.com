import { onDOMReady } from "scripts/onDOMReady";

onDOMReady(() => {
  enum ScrollDirection {
    UP,
    DOWN,
  }

  const stickyHeader = document.querySelector<HTMLDivElement>("#sticky-header");
  let { height: stickyHeaderHeight } = stickyHeader.getBoundingClientRect();
  let previous_known_scroll_position = window.scrollY;
  let last_known_scroll_position = window.scrollY;
  let scrollAmount = 0;
  let currentScrollDirection: ScrollDirection;

  function onScroll() {
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

    stickyHeader.style.transform = `translateY(${scrollAmount}px)`;
  }

  /**
   * Observe the "Me prevenir du lancement" button in the header.
   */
  const headerNewsletterAnchor = document.querySelector<HTMLDivElement>("#header-newsletter-anchor");

  const headerNewsletterAnchorIO = new IntersectionObserver((entries) => {
    const [newsletterAnchor] = entries;

    if (newsletterAnchor.isIntersecting) {
      window.removeEventListener("scroll", onScroll);

      stickyHeader.classList.add("overlapping-header");
      stickyHeader.style.transform = "";
      scrollAmount = -stickyHeaderHeight;
      previous_known_scroll_position = window.scrollY;
      last_known_scroll_position = window.scrollY;
    } else {
      stickyHeader.classList.remove("overlapping-header");

      window.addEventListener("scroll", onScroll, { passive: true });
    }
  });

  headerNewsletterAnchorIO.observe(headerNewsletterAnchor);

  /**
   * Observe the size changes of the sticky header element.
   */
  const stickyHeaderRO = new ResizeObserver((entries) => {
    const [stickyHeader] = entries;

    let { blockSize } = stickyHeader.borderBoxSize[0];

    stickyHeaderHeight = blockSize;
  });

  stickyHeaderRO.observe(stickyHeader);
});
