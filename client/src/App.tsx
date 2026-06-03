import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Admin } from "./pages/Admin";
import { Bewerbung } from "./pages/Bewerbung";
import { Bildungsweg } from "./pages/Bildungsweg";
import { Discover } from "./pages/Discover";
import { Explorer } from "./pages/Explorer";
import { Home } from "./pages/Home";
import { LehrstellenFinder } from "./pages/LehrstellenFinder";
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
        <Route path="/lehrstellen" element={<LehrstellenFinder />} />
        <Route path="/bewerbung" element={<Bewerbung />} />
        <Route path="/merkliste" element={<Merkliste />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
