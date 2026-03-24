import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Uncomment these when you create the components */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/transactions" element={<Transactions />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;