import React, { useState } from "react";
import AuthPage from "./auth";
import CrudPage from "./crud";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <>
      {!token ? (
        <AuthPage setToken={setToken} />
      ) : (
        <CrudPage token={token} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
