
import React, { useCallback, useEffect, useState } from 'react'
import { OnChangeValue, ActionMeta } from 'react-select'
import '../../../className/ComboBoxControl.css'
// import { fnGetRefList } from '../../../Common/fnGetRefList'
import { fnProcessStringToCompare } from '../../../Common/fnProcessStringToCompare'
import { IcomboBoxControl } from '../../../Interfaces/DisplayControls/IcomboBoxControl'
// import { IrefData } from '../../../Interfaces/RefData'
import { FEnums } from '../../../Interfaces/Defaults'
import Label from '../../Label/Label'
import BaseCombobox from './BaseComboBox/BaseComboBox'
import { debounce } from '@mui/material'

const ComboboxControl = (comboBoxControlProps: IcomboBoxControl) => {
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [dataItems, setDataItems] = useState<any>([]);
    const [selectedValue, setSelectedValue] = useState<any>("");
console.log("ComboboxControl",comboBoxControlProps.optionsData)
    const getLabelFromType = useCallback((item: any) => {
        switch (comboBoxControlProps.type) {
            case "isEquipmentTypes":
                return item.eqType;
            case "isProdLine":
                return item.mfgProdLine;
            case "isProdNo":
                return item.mfgProdNo;
            case "isEntityName":
                return item.entityName;
            case "isPropertyGroup":
                return item.pgName;
            case "isProperty":
                return item.propertyName;
            default:
                return item.manufacturer;
        }
    }, [comboBoxControlProps]);

    const getDefaultValueFromType = useCallback(() => {
        switch (comboBoxControlProps.type) {
            case "isEquipmentTypes":
                return comboBoxControlProps.value.eqType;
            case "isProdLine":
                return comboBoxControlProps.value.mfgProdLine;
            case "isProdNo":
                return comboBoxControlProps.value.mfgProdNo;
            case "isEntityName":
                return comboBoxControlProps.value.entityName;
            case "isPropertyGroup":
                return comboBoxControlProps.value.pgName;
            case "isProperty":
                return comboBoxControlProps.value.propertyName;
            default:
                return comboBoxControlProps.value.manufacturer;
        }
    }, [comboBoxControlProps]);

    const createAndSetDataForCombobox = useCallback((data: any) => {
        // Check if data is an array and not empty
        if (Array.isArray(data) && data?.length > 0) {
            let formatedData: any = [];
            // Add empty option if not required and not related to data model
            // if (!comboBoxControlProps.isRequired && comboBoxControlProps.instanceName !== "data_model") {
            //     formatedData.push({ value: "", label: "" });
            // }
            // Iterate through each item in the data
            let isValueFound: boolean = false;
            data.forEach((item: any) => {
                // if (comboBoxControlProps.groupName && fnProcessStringToCompare(comboBoxControlProps.groupName, "Floor")
                //     && fnProcessStringToCompare(comboBoxControlProps.uniqueName, "FloorType")
                //     && comboBoxControlProps.excludeRefValue && comboBoxControlProps.excludeRefValue?.length > 0 && comboBoxControlProps.excludeRefValue?.includes(item)
                // ) {
                //     return;
                // }
                // If item is a string
                if (typeof item === 'string') {
                    // Check if the value matches the selected value
                    if (comboBoxControlProps.value && item.includes(comboBoxControlProps.value)) {

                        setSelectedValue({ value: item, label: item });
                        isValueFound = true;
                        if (comboBoxControlProps.isDefault && comboBoxControlProps.handleValueChange) {
                            comboBoxControlProps.handleValueChange(item, comboBoxControlProps.uniqueName, true);
                        }
                    }
                    // Push item to formatted data
                    formatedData.push({ value: item, label: item });
                }
                // If item is an object
                else if (typeof item === "object") {
                    // Determine label based on type
                    let label = getLabelFromType(item);
                    // Set label and value properties
                    item.label = label;
                    item.value = label;
                    // Check if default value matches the label
                    if (comboBoxControlProps.value && label.includes(getDefaultValueFromType())) {
                        setSelectedValue(item);
                        isValueFound = true;
                        if (comboBoxControlProps.isDefault && comboBoxControlProps.handleValueChange) {
                            comboBoxControlProps.handleValueChange(item.value, comboBoxControlProps.uniqueName, true);
                        }
                    }
                    // Push item to formatted data
                    formatedData.push(item);
                }
            });
            // If no selected value and data is not empty, select first item
            if (isValueFound === false && formatedData?.length > 0) {
                // setSelectedValue(formatedData[0]);
                if (comboBoxControlProps.isRequired && comboBoxControlProps.handleValueChange) {
                    comboBoxControlProps.handleValueChange(formatedData[0].value, comboBoxControlProps.uniqueName, true);
                }
                // if (comboBoxControlProps.groupName == "Device Filter" && comboBoxControlProps.subGroupName == "Device by Model" && formatedData?.length > 1) {
                //   setSelectedValue(formatedData[1]);
                // }
                // else {
                //   setSelectedValue(formatedData[0]);
                // }
            }
            // Set formatted data as data items
            setDataItems(formatedData);
            return formatedData;
            // setDataItems(createOptions(100));
        }
    }, [comboBoxControlProps, getDefaultValueFromType, getLabelFromType]);


    useEffect(() => {
        if (!comboBoxControlProps?.inputMask?.length) return;

        let refTableName = comboBoxControlProps.inputMask;

        // Adjust refTableName based on location state
        if (
            comboBoxControlProps.featureId === FEnums.AuditDataCenter.toString() ||
            comboBoxControlProps.featureId === FEnums.InventoryReconciliation.toString()
        ) {
            // if (comboBoxControlProps.data?.InstanceEntID) {
            //     refTableName = `${comboBoxControlProps.inputMask}|${comboBoxControlProps.data.InstanceEntID}`;
            // }
        }

        // Fetch data based on refTableName
        // if (refTableName.includes("refLib")) {
        //     // Call API to get Lib ref data
        //     // Example:
        //     // fetchLibData(refTableName).then((data) => {
        //     //     // Handle lib data
        //     // });
        // } else {
        //     // fnGetRefList(refTableName).then((resp: IrefData[]) => {
        //     //     if (resp?.length > 0) {
        //     //         const stringArray = resp.map((ele: IrefData) => ele.Value);

        //     //         if (stringArray.length > 0 && stringArray[0]?.toLowerCase() !== "undefined") {
        //     //             createAndSetDataForCombobox(stringArray);
        //     //         } else {
        //     //             // Reference data not found
        //     //             // Uncomment and customize the error-handling logic
        //     //             // getErrorMessage("AP", "171", "", refTableName).then((resp: any) => {
        //     //             //     dispatch({
        //     //             //         type: "ERROR",
        //     //             //         message: resp.message,
        //     //             //     });
        //     //             // });
        //     //         }
        //     //     } else if (!comboBoxControlProps.isRenderAsForm) {
        //     //         comboBoxControlProps.api?.stopEditing();
        //     //     }
        //     // });
        // }
    }, [
        comboBoxControlProps.inputMask,
        comboBoxControlProps.featureId,
        comboBoxControlProps.data?.InstanceEntID,
        comboBoxControlProps.value,
        comboBoxControlProps.preventDefaultValue,
        comboBoxControlProps.uniqueName,
        comboBoxControlProps.handleValueChange,
        comboBoxControlProps.api,
        createAndSetDataForCombobox,
        comboBoxControlProps
    ]);

    useEffect(() => {
        return () => {
            setDataItems([]);
            setSelectedValue("");
        }
    }, [])


    // Effect hook to handle changes in comboBoxControlProps.optionsData
    useEffect(() => {
        const {
            optionsData,
            value,
            preventDefaultValue,
            handleValueChange,
            uniqueName,
            isObjectVal,
        } = comboBoxControlProps;

        if (optionsData && optionsData.length > 0) {
            setSelectedValue(""); // Clear selected value initially
            // Set the default value if not provided and allowed
            
            if (!value && !preventDefaultValue) {
                // handleValueChange?.(optionsData[0], uniqueName, true);
                setSelectedValue("");
            }
         

            // Update combo box data
            createAndSetDataForCombobox(optionsData);
        } else if (isObjectVal) {
            // Clear data and selection if no options are available
            setDataItems([]);
            setSelectedValue("");
        }
    }, [
        comboBoxControlProps,
        comboBoxControlProps.optionsData,
        comboBoxControlProps.value,
        comboBoxControlProps.preventDefaultValue,
        comboBoxControlProps.uniqueName,
        comboBoxControlProps.handleValueChange,
        comboBoxControlProps.isObjectVal,
        createAndSetDataForCombobox,
    ]);

    const handleSelectionChange = (newValue: OnChangeValue<any, false>, actionMeta: ActionMeta<any>) => {
        // if (newValue?.value || !comboBoxControlProps.isRequired) {
        //     if (comboBoxControlProps?.data?._AP === "Measurement") {
        //         sessionStorage.setItem("Measurement", newValue.value);
        //     }
        //     // Update the selected value based on the type of data
        //     setSelectedValue(newValue);

        //     // Process the selected value
        //     if (comboBoxControlProps.data?.IsFromPopup && comboBoxControlProps.data.ChangeEvent) {
        //         comboBoxControlProps.data.ChangeEvent(true);
        //     }
        //     if (!comboBoxControlProps.isRenderAsForm) {
        //         // Update data value and stop editing if not part of a form
        //         comboBoxControlProps.node?.setDataValue('Value', comboBoxControlProps.isObjectVal ? newValue : newValue?.value);
        //         comboBoxControlProps?.api?.stopEditing();

        //         // Dispatch an action if needed

        //         if (comboBoxControlProps.data && comboBoxControlProps.data.EventRequired) {
        //             // handle redux for audit grid
        //             // dispatch({
        //             //     type: "COMBOBOX_CHANGE_VALUE",
        //             //     data: comboBoxControlProps.isObjectVal ? newValue : newValue?.value
        //             // });
        //         }
        //     } else {
        //         // Trigger valueChange prop function if part of a form
        //         if (comboBoxControlProps.handleValueChange) {
        //             comboBoxControlProps.handleValueChange(comboBoxControlProps.isObjectVal ? newValue : newValue?.value, comboBoxControlProps.uniqueName);
        //         }
        //     }
        // }
        if (newValue?.value || !comboBoxControlProps.isRequired) {
            setSelectedValue(newValue);
            comboBoxControlProps.handleValueChange?.(
                comboBoxControlProps.isObjectVal ? newValue : newValue?.value,
                comboBoxControlProps.uniqueName,
                true
            );
        }
        else {
            // Handle required validation
            if (comboBoxControlProps.isRequired && newValue?.value === null) {
                setIsError(true);
                setErrorMessage(comboBoxControlProps.label + " is required");
            } else {
                setIsError(false);
                setErrorMessage('');
            }
        }
    }

    // const handleSelectionChange = useCallback(
    //     debounce((newValue: OnChangeValue<any, false>, actionMeta: ActionMeta<any>) => {
    //         if (newValue?.value || !comboBoxControlProps.isRequired) {
    //             setSelectedValue(newValue);
    //             comboBoxControlProps.handleValueChange?.(
    //                 comboBoxControlProps.isObjectVal ? newValue : newValue?.value,
    //                 comboBoxControlProps.uniqueName,
    //                 true
    //             );
    //         }
    //     }, 300),
    //     [comboBoxControlProps]
    // );
    
    return (
        <div key={comboBoxControlProps.uniqueName} className="form-control-labeled">
            {
            // comboBoxControlProps.isRenderAsForm && 
            comboBoxControlProps.label && <Label uniqueName={`${comboBoxControlProps.uniqueName}-label`} tooltip={comboBoxControlProps.nameDesc ? comboBoxControlProps.nameDesc : ""}
                label={`${comboBoxControlProps.label}${comboBoxControlProps.isRequired ? " (Required)" : ""}`} />}
            <BaseCombobox
                dataItems={  comboBoxControlProps.optionsData && comboBoxControlProps.optionsData.length > 0 
                    ? dataItems 
                    : []}
                selectedValue={comboBoxControlProps.value?selectedValue:""}
                disabled={comboBoxControlProps.disabled || false}
                isError={isError}
                errorMessage={errorMessage}
                handleSelectionChange={handleSelectionChange}
            />
            {comboBoxControlProps.isRenderAsForm && comboBoxControlProps.valueDesc && <Label uniqueName={`${comboBoxControlProps.uniqueName}-desc`} label={comboBoxControlProps.valueDesc} fontSize={"8px"} fontStyle={"italic"} />}
        </div>
    )
}

export default ComboboxControl;