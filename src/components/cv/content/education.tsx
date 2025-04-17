import type { ReactNode } from "react";
import styles from "./styles.module.css";
import { CalendarIcon } from "@heroicons/react/24/outline";

type EduItem = {
  name: string;
  school: string;
  imageUrl: string;
  period: string;
};

const educations: EduItem[] = [
  {
    name: "Titre Concepteur Développeur d'Applications - RNCP 6 (Bac +3/4)",
    school: "Wild Code School",
    imageUrl: "logo-wildcode.png",
    period: "2024-2025",
  },
  {
    name: "DUT I.S.I. (Informatique et Systèmes Industriels)",
    school: "Université H. Poincaré Nancy I, St-Dié (88)",
    imageUrl: "logo-iutsdie.png",
    period: "1995-1997",
  },
  {
    name: "Baccalauréat Scientifique (Bac E)",
    school: "Lycée André Malraux, Remiremont (88)",
    imageUrl: "logo-malraux.png",
    period: "1990-1995",
  },
];

export default function Education(): ReactNode {
  return (
    <>
      <div>
        <h2>Education & Formation</h2>
        <ul role="list">
          {educations.map((edu, idx) => (
            <li key={idx} className={styles.eduItemContainer}>
              <img
                src={require(`@site/static/img/${edu.imageUrl}`).default}
                alt={edu.name}
                className={styles.eduImg}
              />
              <div className={styles.jobItemHeaderContainer}>
                <div className={styles.jobItemHeader}>
                  <div>
                    <h4>{edu.name}</h4>
                    <p className={styles.jobItemHeaderLocation}>{edu.school}</p>
                  </div>
                  <div className={styles.jobItemHeaderRight}>
                    <div className={styles.jobItemPeriod}>
                      <CalendarIcon className={styles.jobItemPeriodIcon} />
                      <div>{edu.period}</div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
