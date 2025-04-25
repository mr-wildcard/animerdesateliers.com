import { onDOMReady } from "scripts/onDOMReady";
import { listenToMediaQueryListChange } from "scripts/listenToMatchQueryChange";

onDOMReady(() => {
  const styles = getComputedStyle(document.documentElement);
  const desktopWrapper = document.querySelector("#sommaire-desktop-content");
  const sommaireHTMLElement = document.querySelector<HTMLDivElement>("#sommaire");
  const desktopMinWidth = styles.getPropertyValue("--breakpoint-lg");
  const mdBreakpoint = `(min-width: ${desktopMinWidth})`;
  const desktopMedia = window.matchMedia(mdBreakpoint);
  const openerMappedToContent = new Map<HTMLButtonElement, HTMLDivElement>();
  const openers = findOpeners();

  let matchDesktopBreakpoint = desktopMedia.matches;

  /**
   * MutationObserver to handle opacity animations.
   * This allows to decouple the display mechanisms from the animations.
   */
  const contentsMO = new MutationObserver((entries) => {
    const [mutation] = entries;

    for (let mutation of entries) {
      if (mutation.attributeName === "class") {
        const target = mutation.target as HTMLElement;

        const elementIsNowVisible = mutation.oldValue.includes("lg:hidden") && !target.classList.contains("lg:hidden");
        const elementIsNowHidden = !mutation.oldValue.includes("lg:hidden") && target.classList.contains("lg:hidden");

        if (elementIsNowVisible) {
          requestAnimationFrame(() => {
            target.style.opacity = "1";
          });
        } else if (elementIsNowHidden) {
          target.style.opacity = "0";
        }
      }
    }
  });

  listenToMediaQueryListChange(desktopMedia, (e) => {
    matchDesktopBreakpoint = e.matches;

    if (matchDesktopBreakpoint) {
      moveOpenersContentToDesktopWrapper(openers);

      /**
       * On mobile, it's possible to close all accordion items.
       * In case all items are closed and we switch to desktop layout,
       * we need to open at least one item.
       */
      const openedContents = Array.from(openerMappedToContent.keys()).filter(
        (opener) => opener.getAttribute("aria-expanded") === "true",
      );

      if (!openedContents.length) {
        openContent(openers[0]);
      } else if (openedContents.length > 1) {
        closeOtherContentsFromOpener(openers[0]);
      }
    } else {
      moveOpenersContentToMobileAccordion(openers);
    }
  });

  function isDesktop() {
    return matchDesktopBreakpoint;
  }

  function findOpeners() {
    return sommaireHTMLElement.querySelectorAll<HTMLButtonElement>("button[data-content-target]");
  }

  function findOpenerContent(opener) {
    return sommaireHTMLElement.querySelector<HTMLDivElement>(`section#${opener.dataset.contentTarget}`);
  }

  function findOpenedOpener() {
    return sommaireHTMLElement.querySelector<HTMLButtonElement>("button[data-content-target][aria-expanded=true]");
  }

  function openContent(opener: HTMLButtonElement) {
    opener.setAttribute("aria-expanded", "true");

    const content = openerMappedToContent.get(opener);

    content.classList.remove("lg:hidden");
  }

  function closeContent(opener: HTMLButtonElement) {
    opener.setAttribute("aria-expanded", "false");

    const content = openerMappedToContent.get(opener);

    content.classList.add("lg:hidden");
  }

  function closeOtherContentsFromOpener(opener: HTMLButtonElement) {
    for (const otherOpener of openers) {
      if (otherOpener.getAttribute("aria-expanded") === "true" && otherOpener !== opener) {
        closeContent(otherOpener);
      }
    }
  }

  function onClickOpener(e: MouseEvent) {
    const opener = e.currentTarget as HTMLButtonElement;

    if (opener.getAttribute("aria-expanded") === "false") {
      openContent(opener);

      if (isDesktop()) {
        closeOtherContentsFromOpener(opener);
      }
    } else if (!isDesktop()) {
      closeContent(opener);
    }
  }

  function onKeyboardNavigate(e: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();

      const openedOpener = findOpenedOpener();
      const openedOpenerIndex = Array.from(openers).findIndex((opener) => opener === openedOpener);
      const previousOpener = openers[openedOpenerIndex - 1];
      const nextOpener = openers[openedOpenerIndex + 1];

      if (e.key === "ArrowDown" && nextOpener) {
        nextOpener.click();
        nextOpener.focus();
      } else if (e.key === "ArrowUp" && previousOpener) {
        previousOpener.click();
        previousOpener.focus();
      }
    }
  }

  function addKeyboardNavigation() {
    document.querySelector("#sommaire").addEventListener("keydown", onKeyboardNavigate);
  }

  function mapOpenersToTheirContents(openers: NodeListOf<HTMLButtonElement>) {
    openers.forEach((opener) => {
      const content = findOpenerContent(opener);

      if (content !== null) {
        openerMappedToContent.set(opener, content);
      }
    });
  }

  function addClickEventListeners(openers: NodeListOf<HTMLButtonElement>) {
    openers.forEach((opener) => {
      opener.addEventListener("click", onClickOpener);
    });
  }

  function moveOpenersContentToMobileAccordion(openers: NodeListOf<HTMLButtonElement>) {
    openers.forEach((opener) => {
      const accordionWrapper = opener.parentNode.querySelector(".accordion-content");

      accordionWrapper.appendChild(openerMappedToContent.get(opener));
    });
  }

  function moveOpenersContentToDesktopWrapper(openers: NodeListOf<HTMLButtonElement>) {
    openers.forEach((opener) => {
      desktopWrapper.appendChild(openerMappedToContent.get(opener));
    });
  }

  function observeContentsForAnimations(openers: NodeListOf<HTMLButtonElement>) {
    openers.forEach((opener) => {
      const content = openerMappedToContent.get(opener);

      contentsMO.observe(content, {
        subtree: false,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["class"],
      });
    });
  }

  mapOpenersToTheirContents(openers);
  observeContentsForAnimations(openers);
  addClickEventListeners(openers);
  addKeyboardNavigation();

  if (isDesktop()) {
    moveOpenersContentToDesktopWrapper(openers);
    openContent(openers[0]);
  }
});
