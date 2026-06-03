import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ProfessionModalProvider } from "./context/ProfessionModal";
import { TaxonomyProvider } from "./context/TaxonomyContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TaxonomyProvider>
          <ProfessionModalProvider>
            <App />
          </ProfessionModalProvider>
        </TaxonomyProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
