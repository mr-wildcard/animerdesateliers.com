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
     * It's possible on mobile to close all accordion items.
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
  for (const otherOpener of openerMappedToContent.keys()) {
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

if (isDesktop()) {
  moveOpenersContentToDesktopWrapper(openers);
  openContent(openers[0]);
}
