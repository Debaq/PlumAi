import { create } from 'zustand';

type DialogType = 'alert' | 'confirm' | 'prompt';

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  type?: DialogType;
  inputType?: 'text' | 'password';
  inputPlaceholder?: string;
  inputValue?: string;
};

type ConfirmStore = {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve: ((value: any) => void) | null;
  
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  prompt: (message: string, options?: ConfirmOptions) => Promise<string | null>;
  alert: (message: string, options?: ConfirmOptions) => Promise<void>;
  
  setInputValue: (val: string) => void;
  close: () => void;
  handleConfirm: () => void;
  handleCancel: () => void;
};

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  options: {},
  resolve: null,

  confirm: (message, options = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        options: {
          title: 'Confirmación',
          description: message,
          confirmText: 'Continuar',
          cancelText: 'Cancelar',
          variant: 'default',
          type: 'confirm',
          ...options,
        },
        resolve,
      });
    });
  },

  prompt: (message, options = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        options: {
          title: 'Entrada Requerida',
          description: message,
          confirmText: 'Aceptar',
          cancelText: 'Cancelar',
          variant: 'default',
          type: 'prompt',
          inputType: 'text',
          inputValue: '',
          ...options,
        },
        resolve,
      });
    });
  },

  alert: (message, options = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        options: {
          title: 'Alerta',
          description: message,
          confirmText: 'Entendido',
          variant: 'default',
          type: 'alert',
          ...options,
        },
        resolve,
      });
    });
  },

  setInputValue: (val) => {
    set((state) => ({
      options: { ...state.options, inputValue: val }
    }));
  },

  close: () => {
    const { resolve } = get();
    if (resolve) resolve(null); // Default for prompt/confirm cancellation
    set({ isOpen: false, resolve: null });
  },

  handleConfirm: () => {
    const { resolve, options } = get();
    if (resolve) {
      if (options.type === 'confirm') resolve(true);
      else if (options.type === 'prompt') resolve(options.inputValue);
      else resolve(undefined); // alert
    }
    set({ isOpen: false, resolve: null });
  },

  handleCancel: () => {
    const { resolve, options } = get();
    if (resolve) {
      if (options.type === 'confirm') resolve(false);
      else if (options.type === 'prompt') resolve(null);
      else resolve(undefined);
    }
    set({ isOpen: false, resolve: null });
  },
}));

// Convenience helpers – import these instead of using native confirm/alert/prompt
export const confirm = (message: string, options?: ConfirmOptions) =>
  useConfirmStore.getState().confirm(message, options);

export const prompt = (message: string, options?: ConfirmOptions) =>
  useConfirmStore.getState().prompt(message, options);

export const alertDialog = (message: string, options?: ConfirmOptions) =>
  useConfirmStore.getState().alert(message, options);