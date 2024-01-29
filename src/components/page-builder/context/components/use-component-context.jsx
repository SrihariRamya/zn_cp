import { useContext } from 'react';
import ComponentContext from './component-context';

const useComponentContext = () => {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error(
      'useComponentContext must be used within a ComponentContext provider'
    );
  }
  return context;
};

export default useComponentContext;
