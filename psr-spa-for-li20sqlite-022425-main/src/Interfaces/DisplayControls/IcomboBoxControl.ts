
export interface IcomboBoxControl {
    uniqueName: string;//Unique Identifier and required
    inputMask?: string; // Reference table or mask name used for fetching data
    isRenderAsForm?: boolean; // Indicates if the component is used within a form
    label?: string; // Label text for the combobox
    isRequired?: boolean; // Whether the combobox value is mandatory
    disabled?: boolean;//Whether control is disabled or not 
    isDefault?: boolean;//Whether default value is provided or not 
    nameDesc?: string;// if provided it will show tooltip on Label
    valueDesc?: string;// if provided it will show description below comboBox control
    data?: any; // Additional data context used for processing logic
    preventDefaultValue?: boolean; // If true, prevents setting a default value
    isObjectVal?: boolean; // If true, selected value will be treated as an object
    optionsData?: Array<string | any |Object>; // Array of dropdown options
    value?: any; // Current value of the combobox
    featureId?: string;//FeatureId for which the control is rendered
    handleValueChange?: (newValue: string, name: string, isDefault?: boolean) => void; // Callback for value changes
    groupName?: string; // Group name for filtering options (e.g., "Device Filter")
    subGroupName?: string; // Sub-group name for additional filtering
    excludeRefValue?: string[]; // Array of values to exclude from the dropdown
    instanceName?: string; // Instance name for special handling of data
    type?: string; // Type of data to handle (e.g., "isEquipmentTypes", "isProdLine")
    api?: any; // API object for handling grid or external actions
    node?: any; // Node object for grid operations
    
}