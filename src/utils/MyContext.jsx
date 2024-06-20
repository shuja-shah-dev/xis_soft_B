import React, { createContext, useContext, useState } from 'react';

export const MyContext = createContext('');

export function ContextProvider({ children }) {
  const [videoStream, setVideoStream] = useState();

  return (
    <MyContext.Provider value={{ videoStream, setVideoStream }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  return useContext(MyContext);
}
