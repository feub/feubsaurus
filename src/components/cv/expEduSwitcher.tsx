import styles from "./styles.module.css";
import { BriefcaseIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

type ExpEduSwitcherProps = {
  showExperience: boolean;
  onSwitch: (showExp: boolean) => void;
};

export default function ExpEduSwitcher({
  showExperience,
  onSwitch,
}: ExpEduSwitcherProps) {
  return (
    <div className={styles.switcherContainer}>
      <button
        className={`${styles.switcherButton} ${
          showExperience ? styles.active : ""
        }`}
        onClick={() => onSwitch(true)}
      >
        <div>
          <BriefcaseIcon className={styles.switcherIcon} />
        </div>
        <div>Expérience</div>
      </button>
      <button
        className={`${styles.switcherButton} ${
          !showExperience ? styles.active : ""
        }`}
        onClick={() => onSwitch(false)}
      >
        <AcademicCapIcon className={styles.switcherIcon} />
        <div>Education</div>
      </button>
    </div>
  );
}
