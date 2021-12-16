// TODO: replace with relal Tailwind value passed on build time.
const mdBreakpoint = "(min-width: 768px)";
const matchMdMedia = window.matchMedia(mdBreakpoint);
const openerMappedToContent = new Map<HTMLButtonElement, HTMLDivElement>();
const openers = findOpeners();

let matchMdBreakpoint = matchMdMedia.matches;

matchMdMedia.addEventListener("change", (e) => {
  matchMdBreakpoint = e.matches;

  if (e.matches) {
    moveOpenersContentToDesktopWrapper(openers);

    /**
     * On mobile, it's possible to close all accordion items.
     * In case all items are closed and we switch to desktop layout,
     * we need to open at least one item.
     */
    const openedContent = Array.from(openerMappedToContent.keys()).filter(
      (opener) => opener.getAttribute("aria-expanded") === "true"
    );

    if (!openedContent.length) {
      openContent(openers[0]);
    } else if (openedContent.length > 1) {
      closeOtherOpenedContentFromOpener(openers[0]);
    }
  } else {
    moveOpenersContentToMobileAccordion(openers);
  }
});

function isDesktop() {
  return matchMdBreakpoint;
}

function findOpeners() {
  return document.querySelectorAll<HTMLButtonElement>("button[data-content-target]");
}

function findOpenerContent(opener) {
  return document.querySelector<HTMLDivElement>(`section#${opener.dataset.contentTarget}`);
}

function findOpenedOpener() {
  for (const opener of openers) {
    if (opener.getAttribute("aria-expanded") === "true") {
      return opener;
    }
  }
}

function openContent(opener: HTMLButtonElement) {
  opener.setAttribute("aria-expanded", "true");

  const content = openerMappedToContent.get(opener);

  content.classList.remove("md:hidden");
}

function closeContent(opener: HTMLButtonElement) {
  opener.setAttribute("aria-expanded", "false");

  const content = openerMappedToContent.get(opener);

  content.classList.add("md:hidden");
}

function closeOtherOpenedContentFromOpener(opener: HTMLButtonElement) {
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
      closeOtherOpenedContentFromOpener(opener);
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
    const desktopWrapper = document.querySelector("#sommaire-desktop-wrapper");

    desktopWrapper.appendChild(openerMappedToContent.get(opener));
  });
}

mapOpenersToTheirContents(openers);
addClickEventListeners(openers);
addKeyboardNavigation();

if (isDesktop()) {
  moveOpenersContentToDesktopWrapper(openers);
  openContent(openers[0]);
}
