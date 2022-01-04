window.addEventListener("DOMContentLoaded", (event) => {
  const bubbles = document.querySelector<HTMLDivElement>("#bubbles");
  const nav = bubbles.querySelector<HTMLElement>("nav");
  const slider = bubbles.querySelector<HTMLUListElement>(".list");
  const leftNavButton = bubbles.querySelector("button.nav-left");
  const rightNavButton = bubbles.querySelector("button.nav-right");
  const { desktopMinWidth } = bubbles.dataset;
  const desktopMedia = window.matchMedia(`(min-width: ${desktopMinWidth})`);

  let maxScrollWidth = slider.scrollWidth - slider.clientWidth;
  let computingNavButtonsDisabledState = false;

  function scroll(amount: number) {
    slider.scroll({
      left: amount,
      behavior: "smooth",
    });
  }

  function onScroll() {
    if (!computingNavButtonsDisabledState) {
      window.requestAnimationFrame(function () {
        updateNavButtonsDisabledState(slider.scrollLeft);

        computingNavButtonsDisabledState = false;
      });
    }

    computingNavButtonsDisabledState = true;
  }

  function updateNavButtonsDisabledState(scrollLeft: number) {
    if (scrollLeft === 0 && !leftNavButton.hasAttribute("disabled")) {
      leftNavButton.setAttribute("disabled", "true");
    } else if (scrollLeft > 0 && leftNavButton.hasAttribute("disabled")) {
      leftNavButton.removeAttribute("disabled");
    } else if (scrollLeft === maxScrollWidth && !rightNavButton.hasAttribute("disabled")) {
      rightNavButton.setAttribute("disabled", "true");
    } else if (scrollLeft < maxScrollWidth && rightNavButton.hasAttribute("disabled")) {
      rightNavButton.removeAttribute("disabled");
    }
  }

  function onClickOnLeftNav() {
    /**
     * 275 : the with of a bubble. (normally)
     */
    const scrollAmount = Math.max(slider.scrollLeft - 275, 0);

    scroll(scrollAmount);
  }

  function onClickOnRightNav() {
    const scrollAmount = Math.min(slider.scrollLeft + 275, maxScrollWidth);

    scroll(scrollAmount);
  }

  function onBreakpointChange() {
    if (desktopMedia.matches) {
      slider.addEventListener("scroll", onScroll, { passive: true });
      leftNavButton.addEventListener("click", onClickOnLeftNav);
      rightNavButton.addEventListener("click", onClickOnRightNav);
    } else {
      slider.removeEventListener("scroll", onScroll);
      leftNavButton.removeEventListener("click", onClickOnLeftNav);
      rightNavButton.removeEventListener("click", onClickOnRightNav);
    }
  }

  desktopMedia.addEventListener("change", onBreakpointChange);

  const sliderRO = new ResizeObserver((entries) => {
    const [slider] = entries;

    maxScrollWidth = slider.target.scrollWidth - slider.target.clientWidth;
  });

  sliderRO.observe(slider);
  onBreakpointChange();
});
