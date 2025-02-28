import { useEffect, useState } from "react";
import { ItextControl } from "./interfaces/ItextControl"; // '../../Interfaces/ItextControl';
import { BaseText } from "./BaseText/BaseText";
import Label from "../psrLabel/Label";
import "./style/Style.css";

export const TextControl = (textControlProps: ItextControl) => {
  // Local state to store the value
  const [value, setValue] = useState("");

  useEffect(() => {
    // Check if textControlProps exist
    if (textControlProps) {
      // Check if it's a form component
      if (textControlProps.isRenderAsForm) {
        // Check if the value has a length
        if (
          textControlProps.value &&
          textControlProps.value.toString()?.length > 0
        ) {
          // Trigger handleValueChange prop function
          if (textControlProps?.handleValueChange != undefined) {
            textControlProps.handleValueChange(
              textControlProps.value,
              textControlProps.uniqueName,
              true
            );
          }

          setValue(textControlProps.value.toString());
        }
        // Check if the label is "LoginUser"
        else if (textControlProps.uniqueName === "LoginUser") {
          // Get value from localStorage
          if (localStorage.getItem("loginUserName") != null) {
            const value = localStorage.getItem("loginUserName");
            // Set value and trigger handleValueChange
            setValue(value as string);
            // textControlProps.handleValueChange && textControlProps.handleValueChange(value, textControlProps.uniqueName, true);
            if (textControlProps?.handleValueChange != undefined) {
              textControlProps.handleValueChange(
                value as string,
                textControlProps.uniqueName,
                true
              );
            }
          }
        }
      } else {
        if (textControlProps.value) {
          setValue(textControlProps.value.toString());
        }
      }
    }
  }, [textControlProps]);
  return (
    <div key={textControlProps.uniqueName} className={`psr-form-control-labeled ${textControlProps?.styleClasses?textControlProps.styleClasses:""}`}>
      {textControlProps.isRenderAsForm && (
        <Label
          uniqueName={`${textControlProps.uniqueName}-label`}
          tooltip={textControlProps.nameDesc ? textControlProps.nameDesc : ""}
          label={`${textControlProps.label || ""}${
            textControlProps.isRequired ? " (Required)" : ""
          }`}
          styleClasses="psr-form-control-labeled-first"
        />
      )}
      <BaseText
        uniqueName={textControlProps.uniqueName}
        nameDesc={textControlProps.nameDesc || ""}
        value={value}
      />
      {textControlProps.isRenderAsForm && textControlProps.valueDesc && (
        <Label
          uniqueName={`${textControlProps.uniqueName}-desc`}
          label={textControlProps.valueDesc}
          styleClasses="psr-form-control-labeled-last"
        />
      )}
    </div>
  );
};
