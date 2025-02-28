
export interface IbaseEditText {
    value: string;              // Value of the control
    name: string;               // Identifier for the TextField (used for `id`)
    placeHolder: string | null; // if provided it will apply place holder to textbox 
    multiline: boolean;         // if true, the TextField should support multiple lines (textarea)
    isRequired: boolean;        // whether the field is required
    focusedControl: string;     // whether control needs to set focused
    isRenderAsForm: boolean;    // This will indicate that whether it is called form or Grid
    disabled: boolean;          // Indicates if the TextField is disabled
    isError: boolean;           // Indicates whether there is error or not
    errorMessage: string        // To show the error message
    tooltip: string;            // Tooltip text displayed on hover
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // Handler for value changes
    handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void;        // Handler for blur events
    handleKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => void;    // Handler for key-up events
    handleFocus: (event: React.FocusEvent<HTMLInputElement>) => void;       // Handler for focus events
}
