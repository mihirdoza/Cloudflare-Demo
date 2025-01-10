import React, { useState, useEffect, useRef } from "react";
import "../App.css"

const CustomDropdown = ({ count = 0,options, label, value, onChange, placeholder,showLength=true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-3 d-flex justify-content-between align-items-center">     
      <label className="form-label w-30">{label} {showLength&&`(${count})`} </label>
      <div className="custom-dropdown w-70" ref={dropdownRef}>
        <div className="dropdown-header" onClick={handleToggle}>
          {value || placeholder} 
          <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
        </div>
        {isOpen && (
          <ul className={`dropdown-list dropdown-list-${label}`}>
            {options.length>0&&options?.sort((a, b) => a.localeCompare(b)).map((option, index) => (
              <li
                key={index}
                className="dropdown-item"
                onClick={() => handleSelect(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;
