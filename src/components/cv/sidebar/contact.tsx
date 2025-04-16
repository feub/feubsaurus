import type { ReactNode } from "react";
import styles from "../styles.module.css";
import {
  EnvelopeIcon,
  CursorArrowRippleIcon,
  FolderOpenIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

type ContactItem = {
  icon: ReactNode;
  type: string;
  value: ReactNode;
};

const ContactList: ContactItem[] = [
  {
    icon: <EnvelopeIcon className={styles.icon} />,
    type: "Email",
    value: "fabien@feub.net",
  },
  {
    icon: <CursorArrowRippleIcon className={styles.icon} />,
    type: "Website",
    value: "https://fabienamann.dev",
  },
  {
    icon: <FolderOpenIcon className={styles.icon} />,
    type: "GitHub",
    value: "https://github.com/feub",
  },
  {
    icon: <HomeIcon className={styles.icon} />,
    type: "Adresse",
    value: (
      <>
        3883 route de Gérardmer
        <br />
        88230 Plainfaing
      </>
    ),
  },
];

function ContactItem({ icon, type, value }: ContactItem) {
  return (
    <div className={styles.item}>
      <div>{icon}</div>
      <div>
        <div className={styles.type}>{type}</div>
        <div>{value}</div>
      </div>
    </div>
  );
}

export default function Contact(): ReactNode {
  return (
    <>
      <h3>Contact</h3>
      <div>
        {ContactList.map((props, idx) => (
          <ContactItem key={idx} {...props} />
        ))}
      </div>
    </>
  );
}
