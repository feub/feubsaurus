import type { ReactNode } from "react";
import styles from "../styles.module.css";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";

export default function DownloadCv(): ReactNode {
  return (
    <>
      <h3>Téléchargez mon CV</h3>
      <div>
        <div className={styles.item}>
          <div>
            <ArrowDownOnSquareIcon className={styles.icon} />
          </div>
          <div>
            <div className={styles.type}>PDF</div>
            <a
              href={
                require("@site/static/docs/CV_2025-04-08_FABIEN_AMANN.pdf")
                  .default
              }
              target="_blank"
            >
              Cliquez ici
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
