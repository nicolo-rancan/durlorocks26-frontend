import { createContext, useContext, useState } from 'react';
import { currentYear } from '@/lib/utils';

const EditionContext = createContext(null);

export function EditionProvider({ children }) {
  const [edizione, setEdizione] = useState(() => {
    return parseInt(localStorage.getItem('edizione') || currentYear());
  });

  const changeEdizione = (year) => {
    localStorage.setItem('edizione', year);
    setEdizione(year);
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i);

  return (
    <EditionContext.Provider value={{ edizione, changeEdizione, years }}>
      {children}
    </EditionContext.Provider>
  );
}

export const useEdition = () => useContext(EditionContext);
