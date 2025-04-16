import styles from "./styles.module.css";

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
        Expérience
      </button>
      <button
        className={`${styles.switcherButton} ${
          !showExperience ? styles.active : ""
        }`}
        onClick={() => onSwitch(false)}
      >
        Education
      </button>
    </div>
  );
}
