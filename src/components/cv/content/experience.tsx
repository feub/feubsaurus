import type { ReactNode } from "react";
import styles from "./styles.module.css";
import { CalendarIcon } from "@heroicons/react/24/outline";

type JobItem = {
  name: string;
  location: string;
  desc: ReactNode;
  role: string;
  imageUrl: string;
  period: string;
};

const jobs: JobItem[] = [
  {
    name: "IDHOUSSE (e-commerce)",
    location: "Anould, France",
    desc: (
      <ul className={styles.jobItemDescList}>
        <li>Administration de 2 sites e-commerce Magento, puis Prestashop</li>
        <li>Développement outils métier</li>
        <li>
          Gestion du catalogue sur une quinzaine de market places (gestionnaire
          de flux Shopping Feed)
        </li>
      </ul>
    ),
    role: "Développeur Web",
    imageUrl: "logo-decoratie.png",
    period: "2015-2024",
  },
  {
    name: "expat.com",
    location: "Port-Louis, Île Maurice",
    desc: (
      <ul className={styles.jobItemDescList}>
        <li>Conception et développement du module Événements</li>
        <li>Développements PHP divers</li>
      </ul>
    ),
    role: "Développeur Full Stack",
    imageUrl: "logo-expat.png",
    period: "2014-2015",
  },
  {
    name: "Services on Demand",
    location: "Rome, Italie",
    desc: (
      <ul className={styles.jobItemDescList}>
        <li>Développement PHP outils métier de la finance</li>
        <li>Administration système Linux et Windows</li>
      </ul>
    ),
    role: "Développeur Full Stack | Sysadmin",
    imageUrl: "logo-exelentia.png",
    period: "2010-2014",
  },
  {
    name: "Ville de Remiremont",
    location: "Remiremont, France",
    desc: (
      <ul className={styles.jobItemDescList}>
        <li>Création du premier site internet de la ville en 1999</li>
        <li>Administration système Linux et Windows</li>
        <li>Développement ASP puis PHP</li>
        <li>Support utilisateurs</li>
      </ul>
    ),
    role: "Développeur Full Stack | Sysadmin",
    imageUrl: "logo-remiremont.png",
    period: "1999-2010",
  },
  {
    name: "Service Militaire 10ème BCS",
    location: "Djibouti City, Djibouti",
    desc: (
      <ul className={styles.jobItemDescList}>
        <li>
          Création et administration d’une base de données Microsoft Access de
          gestion du personnel militaire.
        </li>
      </ul>
    ),
    role: "Développement Microsoft Access | Bureautique",
    imageUrl: "logo-10bcs.png",
    period: "1999",
  },
];

export default function Experience(): ReactNode {
  return (
    <>
      <div>
        <h2>Experience professionnelle</h2>
        <ul role="list">
          {jobs.map((job, idx) => (
            <li key={idx} className={styles.jobItemContainer}>
              <img
                src={require(`@site/static/img/${job.imageUrl}`).default}
                alt={job.name}
                className={styles.jobImg}
              />
              <div className={styles.jobItemHeaderContainer}>
                <div className={styles.jobItemHeader}>
                  <div>
                    <h4>{job.name}</h4>
                    <p className={styles.jobItemHeaderLocation}>
                      {job.location}
                    </p>
                  </div>
                  <div className={styles.jobItemHeaderRight}>
                    <div className={styles.jobItemPeriod}>
                      <CalendarIcon className={styles.jobItemPeriodIcon} />
                      <div>{job.period}</div>
                    </div>
                    <h5>{job.role}</h5>
                  </div>
                </div>
                <p>{job.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
