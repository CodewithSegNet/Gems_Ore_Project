import React, { createContext, useContext, useState } from "react";

const GenderContext = createContext();

export const GenderProvider = ({ children }) => {
  const [gender, setGender] = useState("women"); // default is Women

  return (
    <GenderContext.Provider value={{ gender, setGender }}>
      {children}
    </GenderContext.Provider>
  );
};

export const useGender = () => {
  const context = useContext(GenderContext);
  if (!context) {
    throw new Error("useGender must be used within a GenderProvider");
  }
  return context;
};
