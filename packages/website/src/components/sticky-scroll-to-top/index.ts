import { ScrollDirection, watchScrollDirection } from "scripts/watchScrollDirection";
import { onDOMReady } from "scripts/onDOMReady";

onDOMReady(() => {
  const scrollToTopButton = document.querySelector("#scroll-to-top-button");
  const siteHeader = document.querySelector<HTMLElement>("#site-header");
  let headerIsVisible = true;

  function onScroll(scrollDirection: ScrollDirection) {
    const buttonShouldBeVisible = !headerIsVisible && scrollDirection === ScrollDirection.UP;
    const buttonShouldBeHidden = headerIsVisible || scrollDirection === ScrollDirection.DOWN;

    if (buttonShouldBeVisible && !scrollToTopButton.classList.contains("show")) {
      scrollToTopButton.classList.add("show");
    } else if (buttonShouldBeHidden && scrollToTopButton.classList.contains("show")) {
      scrollToTopButton.classList.remove("show");
    }
  }

  const heroIO = new IntersectionObserver((entries) => {
    const [heroElement] = entries;

    headerIsVisible = heroElement.isIntersecting;
  });

  heroIO.observe(siteHeader);

  const removeScrollListener = watchScrollDirection(onScroll);

  scrollToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
    });
  });
});
