import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Bildungsweg } from "./pages/Bildungsweg";
import { Discover } from "./pages/Discover";
import { Explorer } from "./pages/Explorer";
import { Home } from "./pages/Home";
import { Merkliste } from "./pages/Merkliste";
import { Test } from "./pages/Test";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/entdecker" element={<Discover />} />
        <Route path="/test" element={<Test />} />
        <Route path="/bildungsweg" element={<Bildungsweg />} />
        <Route path="/merkliste" element={<Merkliste />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
