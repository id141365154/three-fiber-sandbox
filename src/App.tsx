import "./App.css";
import { ParticlesScene } from "./scenes/particles";
import { Cards } from "./scenes/cards";
import { FlatCards } from "./scenes/flat-cards";
import { ShadersScene } from "./scenes/shaders";
import { SimpleScene } from "./scenes/simple";
import { useState } from "react";

const scenes = [ParticlesScene, Cards, FlatCards, ShadersScene, SimpleScene];

function App() {
  const [currentScene, setCurrentScene] = useState(0);

  const Scene = scenes[currentScene];

  return (
    <div className="content">
      <div className="header">
        {scenes.map((Scene, i) => (
          <button key={i} onClick={() => setCurrentScene(i)}>
            {Scene.name}
          </button>
        ))}
      </div>
      <Scene />
    </div>
  );
}

export default App;
