/**
 * Tab moves to the next place in menu order while the visitor is looking around (#261).
 * There are more places than digit keys, so places are otherwise picked in the menu after Esc.
 * Shift+Tab goes to the previous place. After the last place the cycle starts over.
 * While the mouse is free (menus, dialogs, text fields) Tab keeps ordinary focus navigation.
 * Install once after rendering the place menu. Returns a keyboard-listener cleanup.
 */
export const PLACE_CYCLE_HINT = 'Tab byter till nästa plats under visning, Shift+Tab till föregående';

export function installPlaceCycle({buttons, canNavigate, isLooking, moveTo}) {
  const places = Array.from(buttons);
  const doc = places[0]?.ownerDocument ?? document;

  places.forEach(button => {
    const label = button.textContent.trim();
    button.title = `${label} – ${PLACE_CYCLE_HINT}`;
  });

  function onKeyDown(event) {
    if (event.code !== 'Tab' || event.defaultPrevented || event.isComposing ||
        event.ctrlKey || event.altKey || event.metaKey) return;
    const editable = element => element?.matches?.('input, select, textarea') || element?.isContentEditable;
    if (event.composedPath().some(editable) || editable(doc.activeElement) ||
        doc.querySelector('dialog[open]') || !canNavigate() || !isLooking()) return;

    const usable = places.filter(button => button.isConnected && !button.matches(':disabled') && button.dataset.place);
    if (!usable.length) return;
    const current = usable.findIndex(button => button.classList.contains('selected'));
    const step = event.shiftKey ? -1 : 1;
    const next = current < 0 ? (step > 0 ? 0 : usable.length - 1) : (current + step + usable.length) % usable.length;

    event.preventDefault();
    moveTo(usable[next].dataset.place);
  }

  doc.addEventListener('keydown', onKeyDown);
  return () => doc.removeEventListener('keydown', onKeyDown);
}
