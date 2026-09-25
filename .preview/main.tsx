import { createRoot } from "react-dom/client";
import "./index.css";
import { Nav } from "@/components/navigation/Nav";
import { QualityProvider } from "@/components/providers/QualityProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import Home from "@/app/page";

createRoot(document.getElementById("root")!).render(
  <QualityProvider>
    <SmoothScroll>
      <span id="top" />
      <a href="#main" className="sr-only">Skip to content</a>
      <Nav />
      <Home />
    </SmoothScroll>
  </QualityProvider>,
);
