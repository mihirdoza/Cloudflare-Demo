
export interface ItextControl {
    uniqueName: string; // Unique identifier for the control
    value: string; // Initial value of the text control
    isRenderAsForm: boolean; // Indicates if the control is rendered within a form
    label?: string; // Label for the text control
    isRequired?: boolean; // Whether the field is required
    nameDesc?: string; // Tooltip text or description
    valueDesc?: string; // Additional description text displayed below the control
    handleValueChange?: (value: string , name: string | undefined, isDefault: boolean) => void; // Callback for value changes
    styleClasses?:string;//tailwind based classes for asddtional styling
}
