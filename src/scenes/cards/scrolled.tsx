import { Scroll, ScrollControls } from "@react-three/drei";
import { ReactNode } from "react";
import { CardsList } from "./card-list";
import { cardsData } from "./data";

const totalCards = cardsData.length;

type Props = {
  children: ReactNode;
};

export const Scrolled = ({ children }: Props) => {
  const pages = totalCards;
  return (
    <ScrollControls damping={0.2} pages={pages} maxSpeed={0.2}>
      <Scroll html>
        {cardsData.reverse().map((item, i) => (
          <div
            key={i}
            style={{
              marginLeft: "300px",
              padding: "5rem",
              height: "100vh",
              widows: "300px",
              color: "#fff",
              background: "#4f4ff4",
            }}
          >
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </div>
        ))}
      </Scroll>
      <Scroll>
        <CardsList />

        {children}
      </Scroll>
    </ScrollControls>
  );
};
