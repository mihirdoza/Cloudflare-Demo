import { useEffect, useState } from "react";
import { fnProcessStringToCompare } from "./common/fnProcessStringToCompare";
import { fnGetRefList } from "./common/fnGetRefList";
import { IrefData } from "./interfaces/RefData";
import { IbaseEditText } from "./interfaces/IbaseEditText";
import { IeditTextControl } from "./interfaces/IeditTextControl";
import BaseEditText from "./baseEditText/BaseEditText";
import Label from "../psrLabel/Label";
import "./style/Style.css";

const EditTextControl = (editTextControlProps: IeditTextControl) => {
  const [value, setValue] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [refTableData, setRefTableData] = useState<string[]>([]);
  const [valueChanged, setValueChanged] = useState<boolean>(false);
  const [isEnterKeyProcessed, setIsEnterKeyProcessed] =
    useState<boolean>(false);
  useEffect(() => {
    if (editTextControlProps && editTextControlProps?.value) {
      if (
        !fnProcessStringToCompare(
          editTextControlProps.value.toString(),
          "undefined"
        )
      ) {
        setValue(editTextControlProps.value.toString());
        if (
          editTextControlProps.isDefault &&
          editTextControlProps.handleValueChange
        ) {
          editTextControlProps.handleValueChange(
            editTextControlProps.value,
            editTextControlProps.uniqueName,
            true
          );
        }
      }
    } else {
      if (
        !editTextControlProps.isRenderAsForm &&
        editTextControlProps.data?.DefaultAPValue &&
        editTextControlProps.isRequired
      ) {
        setValue(editTextControlProps.data?.DefaultAPValue.toString());
      } else {
        setValue("");
      }
    }
  }, [editTextControlProps, editTextControlProps.value]);

  useEffect(() => {
    if (editTextControlProps.inputMask) {
      fnGetRefList(editTextControlProps.inputMask).then(
        (refData: IrefData[]) => {
          if (refData?.length > 0) {
            const stringArray = refData.map((ele: IrefData) => ele.Value);
            if (
              stringArray?.length > 0 &&
              stringArray[0] !== undefined &&
              stringArray[0] !== "Undefined"
            ) {
              setRefTableData(stringArray);
            } else {
              // Reference data not found
              //   getErrorMessage("AP", "171").then((resp: any) => {
              //     dispatch({
              //       type: "ERROR",
              //       message: resp.message,
              //     });
              //   });
            }
          }
        }
      );
    }
  }, [editTextControlProps.inputMask]);

  // Validate input
  const validateInput = (realValue: string) => {
    // Check if input value matches reference data
    if (
      refTableData?.length > 0 &&
      realValue &&
      !refTableData.includes(realValue)
    ) {
      alert("Invalid input ");
      // Input value does not match with data.
      // getErrorMessage("AP", "174").then((resp: any) => {
      //     dispatch({
      //         type: "ERROR",
      //         message: resp.message,
      //     });
      // });
    } else {
      if (
        editTextControlProps.data?.IsFromPopup &&
        editTextControlProps.data.ChangeEvent
      ) {
        editTextControlProps.data.ChangeEvent(true);
      }
      // Update data based on form or non-form context
      if (!editTextControlProps.isRenderAsForm && editTextControlProps.node) {
        if (editTextControlProps.node.setDataValue != undefined) {
          editTextControlProps.node.setDataValue(
            editTextControlProps.colDef
              ? editTextControlProps.colDef.field
              : editTextControlProps.uniqueName,
            realValue
          );
        }
        if (editTextControlProps.stopEditing != undefined) {
          editTextControlProps.stopEditing();
        }
      } else {
        if (editTextControlProps.handleValueChange != undefined) {
          editTextControlProps.handleValueChange(
            realValue,
            editTextControlProps.uniqueName,
            false
          );
        }
        // editTextControlProps.handleValueChange &&
        //   editTextControlProps.handleValueChange(
        //     realValue,
        //     editTextControlProps.uniqueName,
        //     false
        //   );
        setValueChanged(false);
      }
    }
  };

  //handle change event when user type input
  const handleChange: IbaseEditText["handleChange"] = (event) => {
    const realValue: string =
      event.target.value?.trim()?.length > 0
        ? event.target.value
        : event.target.value.trim();
    setValue(realValue);
    setValueChanged(true);

    if (editTextControlProps.isRequired && realValue === "") {
      setIsError(true);
      setErrorMessage(
        `${
          editTextControlProps.label
            ? editTextControlProps.label
            : editTextControlProps.data?.propertyLabel
            ? editTextControlProps.data?.propertyLabel
            : "This field"
        } is required`
      );
    } else {
      setIsError(false);
      setErrorMessage("");
    }
    if(editTextControlProps.allowInputChangeEvent){
      validateInput(realValue)
    }
  };

  //handle blur event and validate input
  const handleBlur: IbaseEditText["handleBlur"] = (event) => {
    console.log(event); //to supress no use warning
    if (!isEnterKeyProcessed && valueChanged) {
      validateInput(value);
    }
    setIsEnterKeyProcessed(false); // Reset flag
  };

  //handle keyup event and check if Enter key pressed
  const handleKeyUp: IbaseEditText["handleKeyUp"] = (event) => {
    if (event.key === "Enter" && valueChanged) {
      setIsEnterKeyProcessed(true); // Set flag to true when Enter key is pressed
      validateInput(value);
    }
  };

  const handleFocus = () => {
    sessionStorage.setItem("focusedControl", editTextControlProps.uniqueName);
  };

  return (
    <div
      key={editTextControlProps.uniqueName}
      className={`form-control-labeled-etc ${
        editTextControlProps?.styleClasses
          ? `${editTextControlProps?.styleClasses}`
          : ""
      }`}
    >
      {editTextControlProps.isRenderAsForm && (
        <Label
          uniqueName={`${editTextControlProps.uniqueName}-label`}
          tooltip={
            editTextControlProps.nameDesc ? editTextControlProps.nameDesc : ""
          }
          label={`${editTextControlProps.label || ""}${
            editTextControlProps.isRequired ? " (Required)" : ""
          }`}
        />
      )}
      <BaseEditText
        value={value}
        name={editTextControlProps.uniqueName}
        multiline={editTextControlProps.multiline ? true : false}
        isRequired={editTextControlProps.isRequired ? true : false}
        isRenderAsForm={editTextControlProps.isRenderAsForm}
        disabled={editTextControlProps.disabled ? true : false}
        tooltip={
          editTextControlProps.tooltip ? editTextControlProps.tooltip : ""
        }
        isError={isError}
        errorMessage={errorMessage}
        handleChange={handleChange}
        handleBlur={handleBlur}
        handleFocus={handleFocus}
        handleKeyUp={handleKeyUp}
        placeHolder={editTextControlProps.placeHolder || null}
        focusedControl={editTextControlProps.focusedControl || ""}
      />
      {editTextControlProps.isRenderAsForm &&
        editTextControlProps.valueDesc && (
          <Label
            uniqueName={`${editTextControlProps.uniqueName}-desc`}
            label={editTextControlProps.valueDesc}
            styleClasses="text-small italic"
            // fontSize={"8px"}
            // fontStyle={"italic"}
          />
        )}
    </div>
  );
};

export default EditTextControl;
