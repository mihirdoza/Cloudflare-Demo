// import { SetStateAction } from "react";
// SetStateAction<string> | SetStateAction<number> | React.MouseEvent
type functionType1 = <T>(fn: T) => void;
type functionType2 = () => void;
type functionType3 = (fn: boolean) => void;
type functionType4 = (fn: string) => void;
type functionType5 = () => string;
type functionType6 = <T,T2>(fn: T,fn2: T2) => void;
export interface IlooseObject {
  [key: string]: null | undefined | string | number | boolean | object | functionType1 | functionType2 | functionType3 | functionType4 | functionType5;
  ChangeEvent?:functionType3;
  setDataValue?:functionType6;
}

export interface IeditTextControl {
    styleClasses?:string
    uniqueName: string;               // Identifier for the input field
    value: string;              // Initial or current value of the input
    isRenderAsForm: boolean;    // Specifies if this is being rendered as part of a form
    allowInputChangeEvent?:boolean; // if true it will call input value change
    placeHolder?: string;        // if provided it will apply place holder to textbox 
    label?: string;              // Display label for the input field
    isRequired?: boolean;        // Indicates if the field is mandatory
    isDefault?: boolean;         // Indicates if the value is default
    focusedControl?: string;     // Identifier for the focused control
    nameDesc?: string;          // Name description to show as tooltip
    valueDesc?: string;         // To show the value description under textbox
    tooltip?: string;           // Tooltip for guidance
    data?: IlooseObject | null;                 // Additional data for grid
    node?: IlooseObject | null;                 // Additional data for grid
    colDef?: IlooseObject | null;               // Additional data for grid
    stopEditing?: functionType2|null;          // Additional function for grid
    disabled?: boolean;         // If true, the field is disabled
    multiline?: boolean;        // If true, allows multi-line input
    inputMask?: string;         // it will call function and get data to compare whether input matches the criteria
    handleValueChange?: (newValue: string, name: string, isDefault: boolean) => void;
}