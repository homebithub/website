import { useCallback, useEffect, useRef } from "react";

/**
 * Standard dismissal behaviour for hand-rolled modals.
 *
 * Modals built on Headless UI's Dialog already close on backdrop click and
 * Escape. Several modals render their own overlay through a portal instead,
 * and those trapped the user until they found the Cancel button. This hook
 * gives them the same behaviour:
 *
 *   - clicking the backdrop closes the modal
 *   - Escape closes the modal
 *   - clicks inside the panel never close it
 *
 * Attach `panelRef` to the panel element and `onOverlayClick` to the overlay.
 */
export function useModalDismiss(isOpen: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  /**
   * Only dismiss when the press started and ended on the overlay itself.
   * Checking the target alone would also close the modal when a drag that
   * began inside the panel, such as selecting text, happened to end outside.
   */
  const onOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      if (panelRef.current?.contains(event.target as Node)) return;
      onClose();
    },
    [onClose]
  );

  return { panelRef, onOverlayClick };
}

export default useModalDismiss;
