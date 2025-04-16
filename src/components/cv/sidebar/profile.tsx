import type { ReactNode } from "react";
import styles from "../styles.module.css";

export default function Profile(): ReactNode {
  return (
    <div className={`${styles.profile}`}>
      <img
        src={require("@site/static/img/fabien_amann_li.jpg").default}
        alt="Fabien Amann"
      />
      <div>
        <h2>Fabien Amann</h2>
        <p>Développeur Web Full Stack</p>
      </div>
    </div>
  );
}
