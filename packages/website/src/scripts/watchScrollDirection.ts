export enum ScrollDirection {
  UP,
  DOWN,
}

type Callback = (scrollDirection: ScrollDirection) => void;

export function watchScrollDirection(callback: Callback): () => void {
  let previous_known_scroll_position = window.scrollY;
  let last_known_scroll_position = window.scrollY;
  let currentScrollDirection: ScrollDirection;
  let scrollAmount = 0;

  function onScroll() {
    previous_known_scroll_position = last_known_scroll_position;
    last_known_scroll_position = window.scrollY;

    const scrollDirection: ScrollDirection =
      last_known_scroll_position > previous_known_scroll_position ? ScrollDirection.DOWN : ScrollDirection.UP;

    scrollAmount -= last_known_scroll_position - previous_known_scroll_position;

    callback(scrollDirection);
  }

  window.addEventListener("scroll", onScroll);

  return function dispose() {
    window.removeEventListener("scroll", onScroll);
  };
}
