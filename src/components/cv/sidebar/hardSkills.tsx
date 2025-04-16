import type { ReactNode } from "react";
import styles from "../styles.module.css";

const skills: Array<string> = [
  "Javascript",
  "TypeScript",
  "React",
  "PHP",
  "Symfony",
  "Node",
  "Express",
  "GraphQL",
  "Apollo Server",
  "GIT",
  "Docker",
  "VS Code",
  "SQL",
  "NoSQL",
  "React Native",
  "Vue 3",
  "HTML",
  "CSS",
  "Wordpess",
  "Prestashop",
  "Magento",
  "Tailwind CSS",
  "Bootstrap",
  "Linux",
  "Nginx",
  "Apache",
  "Few more things...",
];

export default function hardSkills(): ReactNode {
  return (
    <>
      <h3>Compétences</h3>
      <div>
        {skills.map((competence, idx) => (
          <span
            key={idx}
            className={styles.label}
            style={{ whiteSpace: "nowrap" }}
          >
            {competence}
          </span>
        ))}
      </div>
    </>
  );
}
