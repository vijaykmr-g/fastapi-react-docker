import React, { useEffect, useState } from "react";

import Testing from './components/testing'

function Car(){
  return(
    <p>i'm ford car</p>
  );
}

function App() {
  const [message, setMessage] = useState("Loading...");
  const text = 'vijay'
  useEffect(() => {
    fetch("http://localhost:8000/")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error(err));
  }, []);
  const prosps = { brand  : 'Audi',color: 'Red', year : 2025}
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>{message}</h1>
      <h1>{text}</h1>
      <Car/>
      <Testing car={prosps}/>
    </div>
  );


  
}

export default App;
