
export interface IeditComboControl {
    uniqueName: string; // Unique identifier for the control
    isRenderAsForm: boolean; // Indicates if the component is rendered in a form context
    value?: any; // Current value of the control
    label?: string; // Label displayed for the control
    inputMask?: string; // Reference table name for fetching data
    isRequired?: boolean; // Determines if the field is required
    isDefault?: boolean; // Determines if the control should use a default value
    nameDesc?: string; // Description text for the label (optional tooltip)
    valueDesc?: string; // Additional description for the value
    disabled?: boolean; // Disables the control
    isObjectVal?: boolean; // Indicates if `value` and `dataItems` contain objects
    type?: string; // Type of data handled by the control (e.g., "isEquipmentTypes", "isProdLine")
    tooltip?: string; // Tooltip text for the control
    api?: any; // Grid API (used for Ag-Grid integration)
    node?: any; // Grid node reference (used for Ag-Grid integration)
    data?: any; // Additional data object (used for dynamic behavior)
    optionsData?: any[]; // Options to populate the combobox
    preventDefaultValue?: boolean; // Prevents auto-selection of the default value
    handleValueChange?: (value: any, label: string, isDefault?: boolean) => void; // Callback to handle value changes
    instanceName?: string; // Name of the instance, used for conditional behavior
    featureId?:string;//Feature ID for the conditions
    styleClasses?: string; //to handle other style using tailwind Clases If set
}
