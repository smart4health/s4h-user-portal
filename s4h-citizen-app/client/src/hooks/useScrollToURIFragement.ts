export default function useScrollToURIFragment() {
  setTimeout(() => {
    const hashElement = window.location.hash
      ? (document.querySelector(window.location.hash) as HTMLElement)
      : null;
    if (hashElement) {
      hashElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, 500);
}
