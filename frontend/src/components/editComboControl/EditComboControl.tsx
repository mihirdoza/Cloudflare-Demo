/*need npm i lodash
needed npm i --save-dev @types/lodash
needed @mui/material
*/
import React, { useCallback, useEffect, useState } from "react";
import {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
} from "@mui/material";
import { debounce } from "lodash";

import { FEnums } from "./interfaces/Defaults";
import { fnGetRefList } from "./common/fnGetRefList";
import { IeditComboControl } from "./interfaces/IeditComboControl";
import { BaseEditCombo } from "./baseEditCombo/BaseEditCombo";
import "./style/EditComboControl.css";
import Label from "../psrLabel/Label";

export const EditComboControl = (editComboConrolProps: IeditComboControl) => {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dataItems, setDataItems] = useState<any>([]);
  const [selectedValue, setSelectedValue] = useState<any>("");

  // Debounced handleValueChange function
  const debouncedValueChange = debounce((value: string, name: string) => {
    editComboConrolProps?.handleValueChange?.(value, name);
  }, 300);
  // Function to handle changes when selecting an option
  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<unknown> | undefined
  ) => {
    console.log(event, reason, details);
    if (editComboConrolProps.isRequired && value === null) {
      setIsError(true);
      setErrorMessage(`${editComboConrolProps.label} is required`);
    } else {
      setSelectedValue(value);
      if (value || !editComboConrolProps.isRequired) {
        if (!editComboConrolProps.isRenderAsForm) {
          editComboConrolProps.node &&
            editComboConrolProps.node.setDataValue("Value", value);
          editComboConrolProps.api && editComboConrolProps.api.stopEditing();
          if (
            editComboConrolProps.data &&
            editComboConrolProps.data.ChangeEvent
          ) {
            editComboConrolProps.data.ChangeEvent(
              value,
              editComboConrolProps.data._AP,
              editComboConrolProps.data.EntityName
            );
          }
        } else {
          // editComboConrolProps.handleValueChange(value, editComboConrolProps.label);
          debouncedValueChange(value, editComboConrolProps.uniqueName);
        }
      }
      setIsError(false);
      setErrorMessage("");
    }
  };

  const createAndSetDataForCombobox = useCallback(
    (data: any) => {
      // Check if data is an array and not empty
      if (Array.isArray(data) && data?.length > 0) {
        let formatedData: any = [];
        // Add empty option if not required and not related to data model
        if (
          !editComboConrolProps.isRequired &&
          editComboConrolProps.instanceName !== "data_model"
        ) 
        {
          formatedData.push({ value: "", label: "" });
        }
        // Iterate through each item in the data
        data.forEach((item: any) => {
          // If item is a string
          if (typeof item === "string") {
            // Check if the value matches the selected value
            if (
              editComboConrolProps.value &&
              item.includes(editComboConrolProps.value)
            ) {
              setSelectedValue({ value: item, label: item });
            }
            // Push item to formatted data
            formatedData.push({ value: item, label: item });
          }
          // If item is an object
          else if (typeof item === "object") {
            
            // Determine label based on type
let value= editComboConrolProps.type==="databases"
&&item?.id;

            let label =
              editComboConrolProps.type === "isEquipmentTypes"
                ? item.eqType
                : editComboConrolProps.type === "isAttribute"
                ? item.isAttribute
                : editComboConrolProps.type === "isProdLine"
                ? item.mfgProdLine
                : editComboConrolProps.type === "isProdNo"
                ? item.mfgProdNo
                : editComboConrolProps.type === "isEntityName"
                ? item?.entityName
                : editComboConrolProps.type === "isPropertyGroup"
                ? item.pgName
                : editComboConrolProps.type === "isProperty"
                ? item.propertyName
                :editComboConrolProps.type==="databases"
                ?item?.name
                : item?.manufacturer

            if (label) {
             
              // Set label and value properties
              item.label = label;
              editComboConrolProps.type==="databases"?item.value=value :item.value = label;
              // Check if default value matches the label
          
              if (editComboConrolProps.value) {
                let defaultValue =
                  editComboConrolProps.type === "isEquipmentTypes"
                    ? editComboConrolProps.value.eqType
                    : editComboConrolProps.type === "isProdLine"
                    ? editComboConrolProps.value.mfgProdLine
                    : editComboConrolProps.type === "isAttribute"
                    ? editComboConrolProps.value.isAttribute
                    : editComboConrolProps.type === "isProdNo"
                    ? editComboConrolProps.value.mfgProdNo
                    : editComboConrolProps.type === "isEntityName"
                    ? editComboConrolProps.value?.entityName
                    : editComboConrolProps.type === "isPropertyGroup"
                    ? editComboConrolProps.value.pgName
                    : editComboConrolProps.type === "isProperty"
                    ? editComboConrolProps.value.propertyName
                    : editComboConrolProps.value?.manufacturer;
                // If default value matches the label, set as selected value
                if (defaultValue && defaultValue === label) {
                  setSelectedValue(item);
                }
              }
           
              // Push item to formatted data
              formatedData.push(item);
            }
          }
        });
        // If no selected value and data is not empty, select first item
        if (!editComboConrolProps.value && formatedData?.length > 0) {
          setSelectedValue(formatedData[0]);
        }
        // Set formatted data as data items
        setDataItems(formatedData);
        // setDataItems(createOptions(100));
      }
    },
    [editComboConrolProps]
  );

  // Effect to fetch reference data based on the refTable prop
  useEffect(() => {
    if (editComboConrolProps.inputMask && !editComboConrolProps.optionsData) {
      let refTableName = editComboConrolProps.inputMask;
      if (
        editComboConrolProps.featureId === FEnums.AuditDataCenter.toString() ||
        editComboConrolProps.featureId ===
          FEnums.InventoryReconciliation.toString()
      ) {
        if (
          editComboConrolProps.data &&
          editComboConrolProps.data.InstanceEntID
        ) {
          refTableName =
            editComboConrolProps.inputMask +
            "|" +
            editComboConrolProps.data.InstanceEntID;
        }
      }
      if (
        editComboConrolProps.inputMask &&
        editComboConrolProps.inputMask.includes("refLib")
      ) {
        // Fetch reference data from refLib
      } else {
        // Fetch reference data
        fnGetRefList(refTableName).then((resp: any) => {
          if (resp) {
            let data = resp;
            if (data.length > 0) {
              var stringArray = data.map((ele: any) => {
                return ele.Value;
              });
              if (
                stringArray?.length > 0 &&
                stringArray[0] !== undefined &&
                stringArray[0] !== "Undefined"
              ) {
                if (!editComboConrolProps.isRequired) {
                  stringArray = ["", ...stringArray];
                }
                setDataItems(stringArray);
                if (
                  !editComboConrolProps.value &&
                  editComboConrolProps.isRequired &&
                  stringArray?.length > 0
                ) {
                  setSelectedValue(stringArray[0]);
                  editComboConrolProps.handleValueChange &&
                    editComboConrolProps.handleValueChange(
                      stringArray[0],
                      editComboConrolProps.uniqueName,
                      true
                    );
                }
              } else {
                // Reference data not found
                // getErrorMessage("AP", "171", "", refTableName);
              }
            }
          } else {
            if (!editComboConrolProps.isRenderAsForm) {
              // Stop editing if not in a form
              editComboConrolProps.api.stopEditing();
            }
          }
        });
      }
    }
  }, [
    editComboConrolProps,
    editComboConrolProps.featureId,
    editComboConrolProps.inputMask,
    editComboConrolProps.data,
    editComboConrolProps.api,
    editComboConrolProps.isRenderAsForm,
  ]);

  // Effect to handle changes in the 'value' prop
  useEffect(() => {
    if (editComboConrolProps.value) {
      setSelectedValue(editComboConrolProps.value);
      editComboConrolProps.isDefault &&
        editComboConrolProps.isRenderAsForm &&
        editComboConrolProps.handleValueChange &&
        editComboConrolProps.handleValueChange(
          editComboConrolProps.value,
          editComboConrolProps.uniqueName,
          true
        );
    }
  }, [
    editComboConrolProps.value,
    editComboConrolProps.isDefault,
    editComboConrolProps.isRenderAsForm,
    editComboConrolProps.handleValueChange,
    editComboConrolProps.uniqueName,
    editComboConrolProps,
  ]);

  useEffect(() => {
    if (
      editComboConrolProps.optionsData &&
      editComboConrolProps.optionsData?.length > 0
    ) {
      if (
        !editComboConrolProps.value &&
        !editComboConrolProps.preventDefaultValue
      ) {
        if (editComboConrolProps.isObjectVal) {
          // setSelectedValue(editComboConrolProps.optionsData[0]);
          if (editComboConrolProps.handleValueChange) {
            editComboConrolProps.handleValueChange(
              // editComboConrolProps.optionsData[0],
              "",
              editComboConrolProps.uniqueName,
              true
            );
          }
        } else {
          // setSelectedValue(editComboConrolProps.optionsData[0]?.toString());
          if (editComboConrolProps.handleValueChange) {
            editComboConrolProps.handleValueChange(
              editComboConrolProps.optionsData[0],
              editComboConrolProps.uniqueName,
              true
            );
          }
        }
      }
      createAndSetDataForCombobox(editComboConrolProps.optionsData);
    } else {
      if (editComboConrolProps?.isObjectVal) {
        setDataItems([]);
        setSelectedValue("");
      }
    }
  }, [
    editComboConrolProps,
    editComboConrolProps.optionsData,
    editComboConrolProps.value,
    editComboConrolProps.preventDefaultValue,
    editComboConrolProps.isObjectVal,
    editComboConrolProps.handleValueChange,
    createAndSetDataForCombobox,
  ]);


useEffect(()=>{
  console.log("files",selectedValue)
},[selectedValue])

  return (
    <div
      key={editComboConrolProps.uniqueName}
      className={`form-control-labeled nz-edit-combo-container ${editComboConrolProps?.styleClasses?`${editComboConrolProps?.styleClasses}` : ""}`}
    >
      {(editComboConrolProps.isRenderAsForm && editComboConrolProps?.label) &&  (
        <Label
          uniqueName={`${editComboConrolProps.uniqueName}-label`}
          tooltip={
            editComboConrolProps.nameDesc ? editComboConrolProps.nameDesc : ""
          }
          label={`${editComboConrolProps.label || ""} ${
            dataItems?.length > 1 ? `(${dataItems?.length - 1})` : ""
          }   ${editComboConrolProps.isRequired ? " (Required)" : ""}`}
        />
      )}
      <BaseEditCombo
        dataItems={dataItems}
        selectedValue={selectedValue}
        disabled={editComboConrolProps.disabled || false}
        isError={isError}
        tooltip={editComboConrolProps.tooltip || ""}
        isObjectVal={editComboConrolProps.isObjectVal || false}
        errorMessage={errorMessage}
        type={editComboConrolProps.type || ""}
        isRequired={editComboConrolProps.isRequired || false}
        handleSelectionChange={handleChange}
      />
      {editComboConrolProps.isRenderAsForm &&
        editComboConrolProps.valueDesc && (
          <Label
            uniqueName={`${editComboConrolProps.uniqueName}-desc`}
            label={editComboConrolProps.valueDesc}
            styleClasses="text-[8px] italic"
          />
        )}
    </div>
  );
};
