import "./App.css";
import React from "react";
import { v4 as uuid } from "uuid";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import Jokes from "./components/jokes/Jokes";

function App() {
 
  React.useEffect(() => {
    if(!localStorage.getItem('uuid')) {
      const id = uuid();
      localStorage.setItem('uuid', id);
    }
  }, []);

  return (
    <div className="App">
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jokes" element={<Jokes />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
