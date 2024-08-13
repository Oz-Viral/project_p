import { create } from 'zustand';

interface DictionaryState {
  dictionary: any;
  setDictionary: (dictionary: any) => void;
}

const useDictionary = create<DictionaryState>((set, get) => ({
  dictionary: undefined,
  setDictionary: (dictionary: any) => {
    if (!get().dictionary) set({ dictionary });
  },
}));

export default useDictionary;
