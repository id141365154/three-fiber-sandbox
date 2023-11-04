import "./App.css";
import { ParticlesScene } from "./scenes/particles";
import { Cards } from "./scenes/cards";
import { FlatCards } from "./scenes/flat-cards";
import { ShadersScene } from "./scenes/shaders";
import { SimpleScene } from "./scenes/simple";
import { Particles2Scene } from "./scenes/particles-2";
import { GlbModels } from "./scenes/glb-model";
import { useState } from "react";

const scenes = [
  {
    component: GlbModels,
    name: "GlbModels",
  },
  {
    component: Particles2Scene,
    name: "Particles2Scene v 1",
    props: { variant: "1" },
  },
  {
    component: Particles2Scene,
    name: "Particles2Scene v2",
    props: { variant: "2" },
  },
  { component: ParticlesScene, name: "ParticlesScene" },
  { component: Cards, name: "Cards" },
  { component: FlatCards, name: "FlatCards" },
  { component: ShadersScene, name: "ShadersScene" },
  { component: SimpleScene, name: "SimpleScene" },
];

function App() {
  const [currentScene, setCurrentScene] = useState(0);

  const Scene = scenes[currentScene].component;
  const props = scenes[currentScene].props;

  return (
    <div className="content">
      <div className="header">
        {scenes.map((Scene, i) => (
          <button key={i} onClick={() => setCurrentScene(i)}>
            {Scene.name}
          </button>
        ))}
      </div>
      {/*  @ts-ignore  */}
      <Scene {...props} />
    </div>
  );
}

export default App;
