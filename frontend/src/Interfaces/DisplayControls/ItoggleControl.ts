
export interface ItoggleControl {
    uniqueName: string; // Unique identifier for the component
    isRenderAsForm: boolean; // Indicates if the control is part of a form
    label: string; // Label text for the toggle control
    value?: string ; // Current value of the toggle
    isDefault?: boolean; // Indicates if the value is the default value
    tooltip?: string; // Tooltip text for the control
    disabled?: boolean; // Whether the toggle is disabled
    handleValueChange?: (value: string, name: string, isDefault?: boolean) => void; // Callback for value changes
    data?:any;//This properties will automatic handled/passed when control will render from Grid 
    node?:any;//This properties will automatic handled/passed when control will render from Grid 
    api?:any;//This properties will automatic handled/passed when control will render from Grid 
}
