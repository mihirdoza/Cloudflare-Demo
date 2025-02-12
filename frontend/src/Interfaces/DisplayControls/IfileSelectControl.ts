
export interface IfileSelectControl {
    uniqueName: string; // Unique identifier for the control
    isRenderAsForm: boolean; // Indicates if the control is rendered within a form
    value?: string; // The current value of the file input (e.g., file name)
    label?: string; // Label text for the file select control
    isRequired?: boolean; // Indicates if the field is required
    disabled?: boolean; // Whether the control is disabled
    nameDesc?: string; // Description text for the label
    valueDesc?: string; // Additional description text displayed below the control
    fileTypeAccepts?: string; // Accepted file types (e.g., '.txt', 'image/*')
    handleValueChange?: (
        value: string | File | null,
        name: string | undefined,
        isDefault?: boolean
    ) => void; // Callback for value changes
}
