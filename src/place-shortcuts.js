/** Install once after rendering the place menu. Returns a keyboard-listener cleanup. */
export function installPlaceShortcuts({buttons, canNavigate, moveTo}) {
  const places = Array.from(buttons).slice(0, 10);
  const doc = places[0]?.ownerDocument ?? document;

  places.forEach((button, index) => {
    const number = String((index + 1) % 10); // the tenth place is on key 0
    const label = button.textContent.trim();
    button.prepend(doc.createTextNode(`${number} · `));
    button.setAttribute('aria-keyshortcuts', number);
    button.title = `${label} – tangent ${number} (sifferraden eller numeriska tangentbordet)`;
  });

  function onKeyDown(event) {
    if (event.defaultPrevented || event.repeat || event.isComposing ||
        event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    const editable = element => element?.matches?.('input, select, textarea') || element?.isContentEditable;
    if (event.composedPath().some(editable) || editable(doc.activeElement) ||
        doc.querySelector('dialog[open]') || !canNavigate()) return;

    const digit = /^(?:Digit|Numpad)([0-9])$/.exec(event.code)?.[1];
    const button = places[(Number(digit) + 9) % 10];
    if (!button?.isConnected || button.matches(':disabled') || !button.dataset.place) return;

    event.preventDefault();
    moveTo(button.dataset.place);
  }

  doc.addEventListener('keydown', onKeyDown);
  return () => doc.removeEventListener('keydown', onKeyDown);
}
