import "./App.css";
import { ParticlesScene } from "./scenes/particles";
import { Cards } from "./scenes/cards";
import { FlatCards } from "./scenes/flat-cards";
import { ShadersScene } from "./scenes/shaders";
import { SimpleScene } from "./scenes/simple";
import { Particles2Scene } from "./scenes/particles-2";
import { GlbModels } from "./scenes/glb-model";
import { SandSlider } from "./scenes/sand-slider";
import { SandLayers } from "./scenes/sand-layers";
import { SandImageSlider } from "./scenes/sand-image-slider";
import { MouseEvent, useEffect, useState } from "react";

const scenes = [
  {
    component: SandLayers,
    name: "SandLayers",
    slug: "sand-layers",
  },
  {
    component: SandSlider,
    name: "SandSlider",
    slug: "sand-slider",
  },
  {
    component: SandImageSlider,
    name: "SandImageSlider",
    slug: "sand-image-slider",
  },
  {
    component: GlbModels,
    name: "GlbModels",
    slug: "glb-models",
  },
  {
    component: Particles2Scene,
    name: "Particles2Scene v 1",
    slug: "particles-2-v1",
    props: { variant: "1" },
  },
  {
    component: Particles2Scene,
    name: "Particles2Scene v2",
    slug: "particles-2-v2",
    props: { variant: "2" },
  },
  { component: ParticlesScene, name: "ParticlesScene", slug: "particles" },
  { component: Cards, name: "Cards", slug: "cards" },
  { component: FlatCards, name: "FlatCards", slug: "flat-cards" },
  { component: ShadersScene, name: "ShadersScene", slug: "shaders" },
  { component: SimpleScene, name: "SimpleScene", slug: "simple" },
];

const getSceneIndex = () => {
  const slug = new URLSearchParams(window.location.search).get("scene");
  const index = scenes.findIndex((scene) => scene.slug === slug);
  return index === -1 ? 0 : index;
};

function App() {
  const [currentScene, setCurrentScene] = useState(getSceneIndex);

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

  const Scene = scenes[currentScene].component;
  const props = scenes[currentScene].props;

  return (
    <div className="content">
      <div className="header">
        {scenes.map((scene, i) => (
          <a
            key={scene.slug}
            href={`?scene=${scene.slug}`}
            onClick={(e) => navigate(e, i)}
          >
            {scene.name}
          </a>
        ))}
      </div>
      {/*  @ts-ignore  */}
      <Scene {...props} />
    </div>
  );
}

export default App;
