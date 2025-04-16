import React, { useState } from "react";
import Layout from "@theme/Layout";
import styles from "./cv.module.css";
import Profile from "../components/cv/sidebar/profile";
import Contact from "../components/cv/sidebar/contact";
import DownloadCv from "../components/cv/sidebar/downloadCv";
import HardSkills from "../components/cv/sidebar/hardSkills";
import Languages from "../components/cv/sidebar/languages";
import Extra from "../components/cv/sidebar/extra";
import ExpEduSwitcher from "../components/cv/expEduSwitcher";
import Education from "../components/cv/content/education";
import Experience from "../components/cv/content/experience";

export default function Cv() {
  const [showExperience, setShowExperience] = useState<boolean>(true);
  const [showEduction, setShowEducation] = useState<boolean>(false);

  const handleVisibilitySwitch = (showExp: boolean) => {
    setShowExperience(showExp);
    setShowEducation(!showExp);
  };

  return (
    <Layout>
      <section className={styles.features}>
        <div className="container">
          <div className={styles.cvContainer}>
            <div>
              <div className={`${styles.roundedBox}`}>
                <Profile />
              </div>

              <div className={`${styles.roundedBox}`}>
                <Contact />
              </div>

              <div className={`${styles.roundedBox}`}>
                <DownloadCv />
              </div>

              <div className={`${styles.roundedBox}`}>
                <HardSkills />
              </div>

              <div className={`${styles.roundedBox}`}>
                <Languages />
              </div>

              <div className={`${styles.roundedBox}`}>
                <Extra />
              </div>
            </div>

            <main>
              <div className={`${styles.intro} ${styles.roundedBox}`}>
                <p>
                  Fort de plus de 25 ans d'expérience en tant que développeur
                  web full stack, j'ai façonné des solutions digitales pour
                  diverses industries en France comme à l'étranger.
                </p>
                <p>
                  Ma récente formation en conception et développement
                  d'applications Javascript/Typescript me permet d'apporter une
                  expertise renouvelée aux projets les plus innovants.
                </p>
              </div>

              <div className={styles.roundedBox}>
                <ExpEduSwitcher
                  showExperience={showExperience}
                  onSwitch={handleVisibilitySwitch}
                />
              </div>
              {showExperience && (
                <div className={styles.roundedBox}>
                  <Experience />
                </div>
              )}
              {showEduction && (
                <div className={styles.roundedBox}>
                  <Education />
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </Layout>
  );
}
