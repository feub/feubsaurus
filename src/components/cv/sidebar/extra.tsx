import type { ReactNode } from "react";
import styles from "../styles.module.css";

const skills: Array<string> = [
  "Lecture",
  "Cinéma",
  "Musique",
  "Art",
  "Musculation",
  "Trail",
  "Nature",
  "Environnement",
  "Ecologie",
  "Yoga",
  "Méditation",
  "Photo",
  "Vidéo",
];

export default function extra(): ReactNode {
  return (
    <>
      <h3>Extra-professionnel</h3>
      <div>
        {skills.map((competence) => (
          <span className={styles.label} style={{ whiteSpace: "nowrap" }}>
            {competence}
          </span>
        ))}
      </div>
    </>
  );
}
