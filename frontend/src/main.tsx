import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { GeneratePage, VerifyPage } from "./pages";
import { BrowserRouter, Route, Routes } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GeneratePage />} />
        <Route path="/check" element={<VerifyPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
