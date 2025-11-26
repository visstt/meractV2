import { useState } from "react";

import styles from "./CustomSelect.module.css";

export default function CustomSelect({
  options = [],
  defaultValue = "",
  onChange,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className={`${styles.customSelect} ${className}`}>
      <div className={styles.selectHeader} onClick={() => setIsOpen(!isOpen)}>
        {selectedOption}
        <span className={styles.arrow}>
          <svg
            width="12"
            height="6"
            viewBox="0 0 8 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 4L0 0H8L4 4Z" fill="#D9D9D9" />
          </svg>
        </span>
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option, index) => (
            <div
              key={index}
              className={styles.option}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
