import "./App.css";
import { Leva } from "leva";
import { ParticlesScene } from "./scenes/particles";
import { Cards } from "./scenes/cards";
import { ShadersScene } from "./scenes/shaders";
import { SimpleScene } from "./scenes/simple";
import { Particles2Scene } from "./scenes/particles-2";
import { SandSlider } from "./scenes/sand-slider";
import { SandImageSlider } from "./scenes/sand-image-slider";
import { DropsScene } from "./scenes/drops";
import {
  ComponentType,
  MouseEvent,
  useEffect,
  useState,
  WheelEvent,
} from "react";

type TScene = {
  component: ComponentType<any>;
  name: string;
  description: string;
  slug: string;
  // the scene reacts to the scroll, so the hint is shown
  scroll?: boolean;
  props?: Record<string, unknown>;
};

const scenes: TScene[] = [
  {
    component: SandImageSlider,
    name: "Sand Photos",
    description: "Photos crumble into sand and reassemble into the next one.",
    slug: "sand-image-slider",
    scroll: true,
  },
  {
    component: SandSlider,
    name: "Sand Words",
    description: "Words made of sand particles morph into each other.",
    slug: "sand-slider",
    scroll: true,
  },
  {
    component: ParticlesScene,
    name: "Photo Particles",
    description: "Photos built from particles dissolve into one another.",
    slug: "particles",
    scroll: true,
  },
  {
    component: Particles2Scene,
    name: "Photo Particles A",
    description: "Second take on the photo particles, effect A.",
    slug: "particles-2-v1",
    scroll: true,
    props: { variant: "1" },
  },
  {
    component: Particles2Scene,
    name: "Photo Particles B",
    description: "Second take on the photo particles, effect B.",
    slug: "particles-2-v2",
    scroll: true,
    props: { variant: "2" },
  },
  {
    component: Cards,
    name: "Card Corridor",
    description: "The camera flies along a row of cards.",
    slug: "cards",
    scroll: true,
  },
  {
    component: ShadersScene,
    name: "Wave Shader",
    description: "A custom shader ripples a surface. Drag to orbit.",
    slug: "shaders",
  },
  {
    component: SimpleScene,
    name: "Hover Card",
    description: "A single card that reacts to the pointer.",
    slug: "simple",
  },
  {
    component: DropsScene,
    name: "Drops",
    description: "Click to drop: ripples reveal the next photo.",
    slug: "drops",
  },
];

const getSceneIndex = () => {
  const slug = new URLSearchParams(window.location.search).get("scene");
  const index = scenes.findIndex((scene) => scene.slug === slug);
  return index === -1 ? 0 : index;
};

// The hint has its own state: a scroll must not re-render the scene, some of
// them keep their shader uniforms in JSX and lose them on a re-render.
// It goes away at the first scroll; a new scene gets a new hint (by key).
const ScrollHint = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(true);
    // scroll events do not bubble, so listen in the capture phase
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
    };
  }, []);

  return (
    <div
      className={scrolled ? "scroll-hint scroll-hint-hidden" : "scroll-hint"}
      aria-hidden={scrolled}
    >
      <span className="scroll-hint-mouse" />
      Scroll to explore
    </div>
  );
};

const menuStorageKey = "menu-collapsed";

const getMenuCollapsed = () => {
  try {
    return window.localStorage.getItem(menuStorageKey) === "1";
  } catch {
    return false;
  }
};

function App() {
  const [currentScene, setCurrentScene] = useState(getSceneIndex);
  const [collapsed, setCollapsed] = useState(getMenuCollapsed);

  const toggleMenu = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(menuStorageKey, next ? "1" : "0");
    } catch {
      // the state is just not remembered
    }
  };

  useEffect(() => {
    const onPopState = () => setCurrentScene(getSceneIndex());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    window.history.pushState(null, "", `?scene=${scenes[i].slug}`);
    setCurrentScene(i);
  };

  // the menu lies over the scroll area of a scene: pass the wheel through to it
  // (unless the menu itself has something to scroll)
  const passWheel = (e: WheelEvent<HTMLElement>) => {
    const menu = e.currentTarget;
    if (menu.scrollHeight > menu.clientHeight) {
      return;
    }
    document.querySelector(".scrollable")?.scrollBy({ top: e.deltaY });
  };

  const { component: Scene, props, scroll } = scenes[currentScene];

  return (
    <div className="content">
      <nav
        className={collapsed ? "header header-collapsed" : "header"}
        aria-label="Scenes"
        onWheel={passWheel}
      >
        <button
          type="button"
          className="header-title"
          aria-expanded={!collapsed}
          onClick={toggleMenu}
        >
          Scenes
          <span className="header-chevron" aria-hidden />
        </button>
        {!collapsed &&
          scenes.map((scene, i) => (
            <a
              key={scene.slug}
              className={i === currentScene ? "active" : undefined}
              aria-current={i === currentScene ? "page" : undefined}
              href={`?scene=${scene.slug}`}
              onClick={(e) => navigate(e, i)}
            >
              <span className="header-name">{scene.name}</span>
              <span className="header-description">{scene.description}</span>
            </a>
          ))}
      </nav>
      {/* the settings panel of a scene, moved left of the menu */}
      <Leva collapsed titleBar={{ position: { x: -250, y: 0 } }} />
      <Scene {...props} />
      {scroll && <ScrollHint key={scenes[currentScene].slug} />}
    </div>
  );
}

export default App;
