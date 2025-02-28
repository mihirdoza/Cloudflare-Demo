import React, { useCallback, useEffect, useState } from "react";
import { fnGetRefList } from "./common/fnGetRefList";
import { IlistBoxControl } from "./interfaces/IlistBoxControl";
import { IrefData } from "./interfaces/RefData";
import { PsrBaseListBox } from "./baseListBox/PsrBaseListBox";
import Label from "../psrLabel/Label";
import "./style/Style.css";

export const PsrListBoxControl = (listBoxControlProps: IlistBoxControl) => {
  const [originalList, setOriginalList] = useState([]); //listBoxControlProps.data && listBoxControlProps.data.ProfileString? listBoxControlProps.data.ProfileString.split(';') : listBoxControlProps.ProfileString.split(';')
  const [filteredList, setFilteredList] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  
  const handleListItemClick = (
    event: React.MouseEvent<Element>,
    index: number,
    item: string
  ) => {
    console.log(event,index);//to supress no use error
    // Update data value or invoke handleValueChange callback
    setSelectedValue(item);
    if (
      listBoxControlProps.data?.IsFromPopup &&
      listBoxControlProps.data.ChangeEvent
    ) {
      listBoxControlProps.data.ChangeEvent(true);
    }
    if (!listBoxControlProps.isRenderAsForm) {
      listBoxControlProps.node.setDataValue("Value", item);
      listBoxControlProps.api.stopEditing();
    } else {
      if (listBoxControlProps?.handleValueChange != undefined) {
        listBoxControlProps.handleValueChange(
          item,
          listBoxControlProps.uniqueName
        );
      }
    }
    setErrorMessage("");
    // Validate required field
    if (listBoxControlProps.isRequired && (item === null || item === "")) {
      setErrorMessage(listBoxControlProps.label + " is required");
    }
  };

  const handleNoFormAction = useCallback(() => {
    // No action needed for non-form cases
    if (!listBoxControlProps.isRenderAsForm) {
      listBoxControlProps.api.stopEditing();
    }
  }, [listBoxControlProps]);

  useEffect(() => {
    // Fetch data based on refTable
    if (listBoxControlProps.inputMask) {
      const fetchData = async () => {
        try {
          // let resp;
          let repsFn;
          if (
            listBoxControlProps.inputMask &&
            listBoxControlProps.inputMask.includes("refLib")
          ) {
            // resp = await getLibRefList(listBoxControlProps.inputMask);
          } else {
            repsFn = await fnGetRefList(listBoxControlProps.inputMask);
          }
          let data = null;
          if (repsFn) {
            data = repsFn;
          } else {
            // if (checkIsSuccess(resp) && resp.data && resp.data.jsonString?.length > 0) {
            //     data = JSON.parse(resp.data.jsonString);
            // }
          }
          if (data && data.length > 0) {
            const stringArray = data.map((ele: IrefData) => ele.Value);
            if (
              stringArray?.length > 0 &&
              stringArray[0] !== undefined &&
              stringArray[0] !== "Undefined"
            ) {
              setOriginalList(JSON.parse(JSON.stringify(stringArray)));
              if (
                !listBoxControlProps.value &&
                listBoxControlProps.isRequired
              ) {
                if (listBoxControlProps?.handleValueChange != undefined) {
                  listBoxControlProps.handleValueChange(
                    stringArray[0],
                    listBoxControlProps.uniqueName,
                    true
                  );
                }
                setSelectedValue(stringArray[0]);
              }
              setFilteredList(stringArray);
            } else {
              handleErrorMessage("AP", "171");
            }
          } else {
            handleNoFormAction();
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          handleNoFormAction();
        }
      };

      fetchData();
    }
  }, [
    listBoxControlProps.inputMask,
    handleNoFormAction,
    listBoxControlProps.handleValueChange,
    listBoxControlProps.value,
    listBoxControlProps.isRequired,
    listBoxControlProps.uniqueName,
    listBoxControlProps,
  ]);

  useEffect(() => {
    // Handle default value change
    if (listBoxControlProps.value && listBoxControlProps.isDefault) {
      setSelectedValue(listBoxControlProps.value);
      if (listBoxControlProps.handleValueChange != undefined) {
        listBoxControlProps.handleValueChange(
          listBoxControlProps.value,
          listBoxControlProps.uniqueName,
          true
        );
      }
    }
  }, [
    listBoxControlProps.value,
    listBoxControlProps.isDefault,
    listBoxControlProps.handleValueChange,
    listBoxControlProps.uniqueName,
    listBoxControlProps,
  ]);

  const handleInputEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Filter the list based on input value
    setInputValue(event.target.value);
    setFilteredList(
      originalList.filter(
        (f: string) =>
          f.toLowerCase().includes(event.target.value.toLowerCase()) ||
          event.target.value === ""
      )
    );
  };

  const handleErrorMessage = async (errorType: string, errorCode: string) => {
    console.log(errorType, errorCode); //tosupress no use warning.
    // call API to get message
    // const resp = await getErrorMessage(errorType, errorCode);
  };

  return (
    <div
      key={listBoxControlProps.uniqueName}
      className="psr-list-box-parent-container"
    >
      {listBoxControlProps.isRenderAsForm && (
        <Label
          uniqueName={`${listBoxControlProps.uniqueName}-label`}
          tooltip={
            listBoxControlProps.nameDesc ? listBoxControlProps.nameDesc : ""
          }
          label={`${listBoxControlProps.label || ""}${
            listBoxControlProps.isRequired ? " (Required)" : ""
          }`}
        />
      )}
      <PsrBaseListBox
        tooltip={listBoxControlProps.tooltip || ""}
        filteredList={filteredList}
        value={selectedValue || null}
        errorMessage={errorMessage}
        inputValue={inputValue}
        allowFilter={listBoxControlProps.allowFilter || false}
        handleInputEvent={handleInputEvent}
        handleListItemClick={handleListItemClick}
      />
      {listBoxControlProps.isRenderAsForm && listBoxControlProps.valueDesc && (
        <Label
          uniqueName={`${listBoxControlProps.uniqueName}-desc`}
          label={listBoxControlProps.valueDesc}
        />
      )}
    </div>
  );
};
