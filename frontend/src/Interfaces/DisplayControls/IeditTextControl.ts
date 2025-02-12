
export interface IeditTextControl {
    uniqueName: string;               // Identifier for the input field
    value: string;              // Initial or current value of the input
    isRenderAsForm: boolean;    // Specifies if this is being rendered as part of a form
    placeHolder?: string;        // if provided it will apply place holder to textbox 
    label?: string;              // Display label for the input field
    isRequired?: boolean;        // Indicates if the field is mandatory
    isDefault?: boolean;         // Indicates if the value is default
    focusedControl?: string;     // Identifier for the focused control
    nameDesc?: string;          // Name description to show as tooltip
    valueDesc?: string;         // To show the value description under textbox
    tooltip?: string;           // Tooltip for guidance
    data?: any;                 // Additional data for grid
    node?: any;                 // Additional data for grid
    colDef?: any;               // Additional data for grid
    stopEditing?: any;          // Additional function for grid
    disabled?: boolean;         // If true, the field is disabled
    multiline?: boolean;        // If true, allows multi-line input
    inputMask?: string;         // it will call function and get data to compare whether input matches the criteria
    handleValueChange?: (newValue: string, name: string, isDefault: boolean) => void;
}