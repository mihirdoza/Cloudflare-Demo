
import React, { useEffect, useState } from 'react'
import '../../../className/EditTextControl.css';
import { fnProcessStringToCompare } from '../../../Common/fnProcessStringToCompare';
// import { fnGetRefList } from '../../../Common/fnGetRefList';
// import { IrefData } from '../../../Interfaces/RefData';
import { IbaseEditText } from '../../../Interfaces/DisplayControls/IbaseEditText';
import { IeditTextControl } from '../../../Interfaces/DisplayControls/IeditTextControl';
import BaseEditText from './BaseEditText/BaseEditText'
import Label from '../../Label/Label';

const EditTextControl = (editTextControlProps: IeditTextControl) => {
    const [value, setValue] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [refTableData, setRefTableData] = useState<any>(null);
    const [valueChanged, setValueChanged] = useState<boolean>(false);
    const [isEnterKeyProcessed, setIsEnterKeyProcessed] = useState<boolean>(false);
    useEffect(() => {
        if (editTextControlProps && editTextControlProps?.value) {
            if (!fnProcessStringToCompare(editTextControlProps.value.toString(), "undefined")) {
                setValue(editTextControlProps.value.toString());
                if (editTextControlProps.isDefault && editTextControlProps.handleValueChange) {
                    editTextControlProps.handleValueChange(editTextControlProps.value, editTextControlProps.uniqueName, true);
                }
            }
        } else {
            if (!editTextControlProps.isRenderAsForm && editTextControlProps.data.DefaultAPValue && editTextControlProps.isRequired) {
                setValue(editTextControlProps.data.DefaultAPValue);
            }
            else {
                setValue('');
            }
        }
    }, [editTextControlProps, editTextControlProps.value]);

    useEffect(() => {
        // if (editTextControlProps.inputMask) {
        //     fnGetRefList(editTextControlProps.inputMask).then((refData: IrefData[]) => {
        //         if (refData?.length > 0) {
        //             var stringArray = refData.map((ele: IrefData) => ele.Value);
        //             if (stringArray?.length > 0 && stringArray[0] !== undefined && stringArray[0] !== "Undefined") {
        //                 setRefTableData(stringArray);
        //             } else {
        //                 // Reference data not found
        //                 //   getErrorMessage("AP", "171").then((resp: any) => {
        //                 //     dispatch({
        //                 //       type: "ERROR",
        //                 //       message: resp.message,
        //                 //     });
        //                 //   });
        //             }
        //         }
        //     })
        // }
    }, [editTextControlProps.inputMask])


    // Validate input
    const validateInput = (realValue: string) => {
        // Check if input value matches reference data
        if (refTableData?.length > 0 && realValue && !refTableData.includes(realValue)) {
            alert("Invalid input ");
            // Input value does not match with data.
            // getErrorMessage("AP", "174").then((resp: any) => {
            //     dispatch({
            //         type: "ERROR",
            //         message: resp.message,
            //     });
            // });
        } else {
            if (editTextControlProps.data?.IsFromPopup && editTextControlProps.data.ChangeEvent) {
                editTextControlProps.data.ChangeEvent(true);
            }
            // Update data based on form or non-form context
            if (!editTextControlProps.isRenderAsForm && editTextControlProps.node) {
                editTextControlProps.node.setDataValue(editTextControlProps.colDef ? editTextControlProps.colDef.field : editTextControlProps.uniqueName, realValue);
                editTextControlProps.stopEditing();
            } else {
                editTextControlProps.handleValueChange && editTextControlProps.handleValueChange(realValue, editTextControlProps.uniqueName, false);
                setValueChanged(false);
            }
        }
    };

    //handle change event when user type input
    const handleChange: IbaseEditText['handleChange'] = (event) => {
        let realValue: any =
            event.target.value?.trim()?.length > 0
                ? event.target.value
                : event.target.value.trim();
        setValue(realValue);
        setValueChanged(true);

        if (editTextControlProps.isRequired && realValue === '') {
            setIsError(true);
            setErrorMessage(
                `${editTextControlProps.label ? editTextControlProps.label : editTextControlProps.data?.propertyLabel ? editTextControlProps.data?.propertyLabel : "This field"
                } is required`
            );
        } else {
            setIsError(false);
            setErrorMessage('');
        }
    };

    //handle blur event and validate input
    const handleBlur: IbaseEditText['handleBlur'] = (event) => {
        if (!isEnterKeyProcessed && valueChanged) {
            validateInput(value);
        }
        setIsEnterKeyProcessed(false); // Reset flag
    };

    //handle keyup event and check if Enter key pressed
    const handleKeyUp: IbaseEditText['handleKeyUp'] = (event) => {
        if (event.key === "Enter" && valueChanged) {
            setIsEnterKeyProcessed(true); // Set flag to true when Enter key is pressed
            validateInput(value);
        }
    };

    const handleFocus = () => {
        sessionStorage.setItem("focusedControl", editTextControlProps.uniqueName);
    }


    return (
        <div key={editTextControlProps.uniqueName} className="form-control-labeled">
            {editTextControlProps.isRenderAsForm && <Label uniqueName={`${editTextControlProps.uniqueName}-label`} tooltip={editTextControlProps.nameDesc ? editTextControlProps.nameDesc : ""}
                label={`${editTextControlProps.label||""}${editTextControlProps.isRequired ? " (Required)" : ""}`} />}
            <BaseEditText
                value={value}
                name={editTextControlProps.uniqueName}
                multiline={editTextControlProps.multiline ? true : false}
                isRequired={editTextControlProps.isRequired ? true : false}
                isRenderAsForm={editTextControlProps.isRenderAsForm}
                disabled={editTextControlProps.disabled ? true : false}
                tooltip={editTextControlProps.tooltip ? editTextControlProps.tooltip : ""}
                isError={isError}
                errorMessage={errorMessage}
                handleChange={handleChange}
                handleBlur={handleBlur}
                handleFocus={handleFocus}
                handleKeyUp={handleKeyUp}
                placeHolder={editTextControlProps.placeHolder || null}
                focusedControl={editTextControlProps.focusedControl || ""}
            />
            {editTextControlProps.isRenderAsForm && editTextControlProps.valueDesc && <Label uniqueName={`${editTextControlProps.uniqueName}-desc`} label={editTextControlProps.valueDesc} fontSize={"8px"} fontStyle={"italic"} />}
        </div>
    )
}

export default EditTextControl