import { useEffect, type ReactNode } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import { CodeBracketSquareIcon } from "@heroicons/react/24/outline";

type ProjectItem = {
  id: number;
  name: string;
  description: string;
  technos: string;
  logoUrl: string;
  images?: string | Array<string>;
  githubLink?: string;
  siteLink?: string;
};

const projects_recent: ProjectItem[] = [
  {
    id: 1,
    name: "LibTrack (API + client)",
    description:
      "Projet personnel d'une API (Symfony) de gestion de collection musicale sur supports physiques (CD, vinyles, etc.) avec un client React. Utilisation de l'IA (Mistral) pour l'aide à la complétion des informations sur les albums.",
    technos: "Symfony 7, React, MySQL, Shadcn, Discogs API, Mistral AI",
    logoUrl: "libtrack-scanner-logo.png",
    images: [
      "libtrack-releases.png",
      "libtrack-powered-by-ai.mp4",
      "libtrack-releases-light-theme.png",
      "libtrack-service-search.png",
      "libtrack-stats.png",
      "libtrack-add-release.png",
      "libtrack-artist-edit.png",
      "libtrack-login-page.png",
    ],
    githubLink: "https://github.com/feub/libtrack-sy",
  },
  {
    id: 2,
    name: "LibTrack Scanner (application Android)",
    description:
      "Client mobile pour l'API LibTrack (ci-dessus) qui permet de scanner les codes barre des supports physiques pour une recherche (API Discogs) et un ajout rapides.",
    technos: "React Native",
    logoUrl: "libtrack-scanner-logo.png",
    images: [
      "libtrack-scanner-releases.jpg",
      "libtrack-scanner-scan.jpg",
      "libtrack-scanner-scan-results.jpg",
      "libtrack-scanner-search.jpg",
      "libtrack-scanner-shelves-filter.jpg",
    ],
    githubLink: "https://github.com/feub/libtrack-react-native",
  },
  {
    id: 3,
    name: "ClubCompta - Application de Gestion de Budget Associatif",
    description:
      "Ce projet, sur lequel j'ai eu le plaisir de collaborer avec une équipe talentueuse, a été réalisé dans le cadre de ma formation en Conception et Développement d’Applications à la Wild Code School. Il s'agit d'une architecture en microservices majoritairement en TypeScript (avec un service en PHP). Notre objectif était de créer une interface intuitive répondant aux besoins spécifiques des associations, afin de faciliter leur gestion financière.",
    technos:
      "microservices, Docker, TypeScript, Apollo Server/GraphQL, Express.js, React, Slim Framework (PHP), Nodemailer, PostgreSQL, Redis",
    logoUrl: "logo-clubcompta.svg",
    images: ["clubcompta-charts.png", "clubcompta.jpg", "clubcompta-users.png"],
    githubLink: "https://github.com/feub/ClubCompta",
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
    id: 4,
    name: "Feub CV",
    description:
      "Il s'agit d'un site statique type CV en Vue.js + Tailwind, facilement personnalisable, avec mode clair/sombre 🌞 🌚",
    technos: "Vue 3, Tailwind",
    logoUrl: "fabien_amann_li.jpg",
    images: "feub-cv.png",
    githubLink: "https://github.com/feub/feub_cv",
  },
  {
    id: 50,
    name: "Weather React",
    description:
      "Une simple application météo utilisant React + Tailwind CSS. Rien de compliqué ici, j'ai développé cette application pour apprendre et pratiquer React.",
    technos: "React, Tailwind, OpenWeatherMap API, MapBox API",
    logoUrl: "weather-react.png",
    images: ["weather-react-cities.png", "weather-react-city.png"],
    githubLink: "https://github.com/feub/weather-react",
  },
  {
    id: 510,
    name: "Les Douces Nuits de Maé - E-commerce",
    description:
      "Gestion de 2 sites E-commerce sous Magento, puis Prestashop et développements d'outils d'améliorations des ventes et de statistiques.",
    technos: "Magento, Prestashop, PHP",
    logoUrl: "logo-ldndm.png",
    images: "ldndm.png",
    siteLink: "https://www.lesdoucesnuitsdemae.com/",
  },
  {
    id: 600,
    name: "Expat.com",
    description:
      "Conception et développement du module Événements. Développements PHP divers. Une expérience fascinante pour un site leader mondial dans son domaine, avec plusieurs millions d'utilisateurs et un fort trafic.",
    technos: "PHP, MySQL",
    logoUrl: "expat-logo.webp",
    images: "expat.png",
    siteLink: "https://www.expat.com/",
  },
];

function ProjectItem({ project }: { project: ProjectItem }) {
  useEffect(() => {
    Fancybox.bind("[data-fancybox]", {});
  }, []);

  // Helper function to check if file is video
  const isVideo = (filename: string) => {
    return /\.(mp4|webm|ogg|mov|avi)$/i.test(filename);
  };

  // Helper function to get video thumbnail
  const getVideoThumbnail = (videoFilename: string) => {
    // Replace the video extension with .jpg for the thumbnail
    return videoFilename.replace(/\.(mp4|webm|ogg|mov|avi)$/i, "-thumb.png");
  };

  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => (
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
                      data-fancybox={`gallery-${project.id}`}
                    >
                      <img
                        src={useBaseUrl(
                          `/img/${
                            isVideo(image) ? getVideoThumbnail(image) : image
                          }`,
                        )}
                        alt={`${project.name} screenshot ${idx + 1}`}
                        className={styles.projectItemImage}
                      />
                    </a>
                  ))
                : project.images && (
                    <a
                      href={useBaseUrl(`/img/${project.images}`)}
                      data-fancybox={`gallery-${project.id}`}
                    >
                      <img
                        src={useBaseUrl(
                          `/img/${
                            isVideo(project.images)
                              ? getVideoThumbnail(project.images)
                              : project.images
                          }`,
                        )}
                        alt={`${project.name} screenshot`}
                        className={styles.projectItemImage}
                      />
                    </a>
                  )}
            </div>
            <div>
              {project.githubLink && (
                <a
                  href={`${project.githubLink}`}
                  target="_blank"
                  className={styles.projectLinkContainer}
                >
                  <CodeBracketSquareIcon className={styles.projectLinkIcon} />
                  <div>Lien GitHub du projet</div>
                </a>
              )}
              {project.siteLink && (
                <a
                  href={`${project.siteLink}`}
                  target="_blank"
                  className={styles.projectLinkContainer}
                >
                  <CodeBracketSquareIcon className={styles.projectLinkIcon} />
                  <div>Lien vers le site/projet</div>
                </a>
              )}
            </div>
          </div>
        </li>
      )}
    </BrowserOnly>
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
