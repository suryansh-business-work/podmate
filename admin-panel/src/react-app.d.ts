import 'react';

// Fix for react-router-dom v7 / Apollo Client JSX compatibility with React 19 types
declare module 'react' {
  interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES {
    readonly [key: string]: React.ReactNode;
  }
}
