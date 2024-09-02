// confirmationStore.ts
import { create } from 'zustand';

interface ConfirmationState {
  open: boolean;
  title: string | null;
  description: string | null;
  cancelLabel: string | null;
  actionLabel: string | null;
  onAction: () => void;
  onCancel: () => void;
}

interface ConfirmationActions {
  openConfirmation: (data: {
    title: string;
    description: string;
    cancelLabel?: string;
    actionLabel?: string;
    onAction: () => void;
    onCancel: () => void;
  }) => void;
  closeConfirmation: () => void;
}

const useConfirmationStore = create<ConfirmationState & ConfirmationActions>(
  (set) => ({
    open: false,
    title: null,
    description: null,
    cancelLabel: null,
    actionLabel: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onAction: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel: () => {},
    openConfirmation: (data) =>
      set((state) => ({
        open: true,
        title: data.title,
        description: data.description,
        cancelLabel: data.cancelLabel || 'Cancel',
        actionLabel: data.actionLabel || '',
        onAction: data.onAction,
        onCancel: data.onCancel,
      })),
    closeConfirmation: () =>
      set((state) => ({
        open: false,
        title: null,
        description: null,
        cancelLabel: null,
        actionLabel: null,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onAction: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onCancel: () => {},
      })),
  }),
);

export default useConfirmationStore;
