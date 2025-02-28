
export interface IlistBoxControl {
    uniqueName: string; // Unique identifier for the control
    isRenderAsForm: boolean; // Indicates if the control is rendered within a form
    inputMask: string; // Input mask or identifier for fetching data
    allowFilter?:boolean; //Allow filter or not 
    value?: string; // Current value of the input or selected item
    label?: string; // Label text for the control
    tooltip?: string; // Tooltip text displayed on hover
    nameDesc?: string; // Description text for the label
    valueDesc?: string; // Additional description text displayed below the control
    isRequired?: boolean; // Indicates if the field is required
    isDefault?: boolean; // Indicates if the value is the default value
    data?: any; // This property will be handled/passed automatically when control render from Grid
    api?: any; // This property will be handled/passed automatically when control render from Grid
    node?: any; // This property will be handled/passed automatically when control render from Grid
    handleValueChange?: (
        value: string,
        name: string | undefined,
        isDefault?: boolean
    ) => void; // Callback for value changes
}
