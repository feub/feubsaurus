import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import styles from "./index.module.css";
import Cv from "./cv";

function HomepageHeader() {
  return (
    <header
      className={clsx(
        "hero hero--primary",
        styles.heroBanner,
        styles.openToWork,
      )}
    >
      <div className="container">
        <div>
          <span>#OPENTOWORK</span> Je reste ouvert à toute proposition d'emploi.
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description={`Hello from ${siteConfig.tagline}`}
    >
      <HomepageHeader />
      <main>
        <Cv />
      </main>
    </Layout>
  );
}
