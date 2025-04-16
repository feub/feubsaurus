import type { ReactNode } from "react";
import styles from "../styles.module.css";

type LangType = {
  name: string;
  level: string;
};

const langs: LangType[] = [
  {
    name: "Français",
    level: "100%",
  },
  {
    name: "Anglais",
    level: "75%",
  },
  {
    name: "Italien",
    level: "15%",
  },
];

export default function Languages(): ReactNode {
  return (
    <>
      <h3>Langues</h3>
      <div className="flex flex-col flex-wrap">
        {langs.map((lang, idx) => (
          <div key={idx}>
            {lang.name}
            <div className={styles.languageBar}>
              <div
                className={styles.languageFill}
                style={{ width: lang.level }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
