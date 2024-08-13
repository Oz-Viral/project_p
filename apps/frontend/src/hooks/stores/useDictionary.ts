import { create } from 'zustand';
import { dictionary } from '../../dictionaries/ko';

interface DictionaryState {
  dictionary: any;
  setDictionary: (dictionary: any) => void;
}

const useDictionary = create<DictionaryState>((set, get) => ({
  dictionary,
  setDictionary: (dictionary: any) => {
    if (!get().dictionary) set({ dictionary });
  },
}));

export default useDictionary;
