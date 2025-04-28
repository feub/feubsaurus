import type { ReactNode } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import { CodeBracketSquareIcon } from "@heroicons/react/24/outline";

type ProjectItem = {
  name: string;
  description: string;
  technos: string;
  logoUrl: string;
  images: string | Array<string>;
  githubLink: string;
};

const projects_recent: ProjectItem[] = [
  {
    name: "ClubCompta - Application de Gestion de Budget Associatif",
    description:
      "Ce projet, sur lequel j'ai eu le plaisir de collaborer avec une équipe talentueuse, a été réalisé dans le cadre de ma formation en Conception et Développement d’Applications à la Wild Code School. Notre objectif était de créer une interface intuitive répondant aux besoins spécifiques des associations, afin de faciliter leur gestion financière.",
    technos:
      "microservices, Docker, TypeScript, Apollo Server/GraphQL, Express.js, React, Slim Framework (PHP), Nodemailer, Redis",
    logoUrl: "logo-clubcompta.svg",
    images: ["clubcompta.jpg", "clubcompta-charts.png", "clubcompta-users.png"],
    githubLink:
      "https://github.com/WildCodeSchool-CDA-FT-2024-09/JS-CDA-Projet-2-Team-D",
  },
  {
    name: "LibTrack (API + client)",
    description:
      "Projet personnel d'une API (Symfony) de gestion de collection musicale sur supports physiques (CD, vinyles, etc.) avec un client React.",
    technos: "Symfony 7, MySQL, API, React, Shadcn",
    logoUrl: "libtrack-native-logo.png",
    images: [
      "libtrack-react-login.png",
      "libtrack-releases.png",
      "libtrack-add-release.png",
    ],
    githubLink: "https://github.com/feub/libtrack-sy",
  },
  {
    name: "LibTrack Scanner (client mobile)",
    description:
      "Client mobile pour l'API LibTrack (ci-dessus) qui permet notamment de scanner les codes barre des supports physiques pour une recherche (API Discogs) et un ajout rapide.",
    technos: "React Native (with Expo)",
    logoUrl: "libtrack-native-logo.png",
    images: [
      "libtrack-native-releases.jpg",
      "libtrack-native-scan.jpg",
      "libtrack-native-scanning.jpg",
      "libtrack-native-scan-results.jpg",
    ],
    githubLink: "https://github.com/feub/libtrack-react-native",
  },
  // {
  //     name: 'In My Pantry',
  //     description: "Projet personnel React Native de gestion de garde-manger/frigo/buanderie, pour ne plus jamais être à court de vos aliments et produits préférés ! ",
  //     technos: 'React Native (with Expo), SQLite',
  //     logoUrl: 'in-my-pantry-logo.png',
  //     images: 'in-my-pantry-screenshot2.jpg',
  //     githubLink: 'https://github.com/feub/in-my-pantry'
  // },
  {
    name: "Feub CV",
    description:
      "Il s'agit d'un site statique type CV en Vue.js + Tailwind, facilement personnalisable, avec mode clair/sombre 🌞 🌚",
    technos: "Vue 3, Tailwind",
    logoUrl: "fabien_amann_li.jpg",
    images: "feub-cv.png",
    githubLink: "https://github.com/feub/feub_cv",
  },
  // {
  //     name: 'Weather React',
  //     description: "Un petit site de météo responsive en React.",
  //     technos: 'React, Tailwind, OW',
  //     logoUrl: 'fabien_amann_li.jpg',
  //     images: 'feub-cv.png',
  //     githubLink: 'https://github.com/feub/weather-react'
  // },
  {
    name: "Les Douces Nuits de Maé - E-commerce",
    description:
      "Gestion et développements d'outils internes pour 2 sites E-commerce sous Magento, puis Prestashop.",
    technos: "Magento, Prestashop, PHP",
    logoUrl: "logo-ldndm.png",
    images: "ldndm.png",
    githubLink: "https://www.lesdoucesnuitsdemae.com/",
  },
  {
    name: "Expat.com",
    description:
      "Conception et développement du module Événements. Développements PHP divers. Une expérience fascinante pour un site leader mondial dans son domaine, avec plusieurs millions d'utilisateurs et un fort trafic.",
    technos: "PHP, MySQL",
    logoUrl: "expat-logo.webp",
    images: "expat.png",
    githubLink: "https://www.expat.com/",
  },
];

function ProjectItem({ project }: { project: ProjectItem }) {
  return (
    <>
      <li className={styles.projectItemContainer}>
        <img
          src={useBaseUrl(`/img/${project.logoUrl}`)}
          alt={project.name}
          className={styles.projectLogo}
        />

        <div>
          <h4>{project.name}</h4>
          <p>
            {project.technos.split(",").map((tech, idx) => (
              <span key={idx} className={styles.projectLabel}>
                {tech}
              </span>
            ))}
          </p>
          <div>{project.description}</div>
          <div className={styles.projectItemImagesContainer}>
            {Array.isArray(project.images)
              ? project.images.map((image, idx) => (
                  <a
                    key={idx}
                    href={useBaseUrl(`/img/${image}`)}
                    data-lightbox={`project-${project.name.replace(
                      /\s+/g,
                      "-",
                    )}`}
                    data-title={`${project.name} screenshot ${idx + 1}`}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default browser navigation
                      return false;
                    }}
                  >
                    <img
                      src={useBaseUrl(`/img/${image}`)}
                      alt={`${project.name} screenshot ${idx + 1}`}
                      className={styles.projectItemImage}
                    />
                  </a>
                ))
              : project.images && (
                  <a
                    href={useBaseUrl(`/img/${project.images}`)}
                    data-lightbox={`project-${project.name.replace(
                      /\s+/g,
                      "-",
                    )}`}
                    data-title={`${project.name} screenshot`}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent default browser navigation
                      return false;
                    }}
                  >
                    <img
                      src={useBaseUrl(`/img/${project.images}`)}
                      alt={`${project.name} screenshot`}
                      className={styles.projectItemImage}
                    />
                  </a>
                )}
          </div>
          <div>
            <a
              href={`${project.githubLink}`}
              target="_blank"
              className={styles.projectLinkContainer}
            >
              <CodeBracketSquareIcon className={styles.projectLinkIcon} />
              <div>Lien GitHub du projet</div>
            </a>
          </div>
        </div>
      </li>
    </>
  );
}

export default function Projects(): ReactNode {
  return (
    <>
      <div>
        <h2>Quelques projets</h2>
        <ul role="list">
          {projects_recent.map((project, idx) => (
            <ProjectItem key={idx} project={project} />
          ))}
        </ul>
      </div>
    </>
  );
}
