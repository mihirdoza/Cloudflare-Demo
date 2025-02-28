
import { IeditTextControl } from "../interfaces/IeditTextControl";

export const sampleData: IeditTextControl = {
    uniqueName: "username", // Identifier for the input field
    label: "User Name", // Display label for the input field
    value: "", // Initial or current value of the input
    valueDesc:"Test",//To show the value description under textbox
    placeHolder:"Enter value",
    isRequired: true, // Indicates if the field is mandatory
    isDefault: false, // Indicates if the value is default
    focusedControl: "username", // Identifier for the focused control
    isRenderAsForm: true, // Specifies if this is being rendered as part of a form
    tooltip: "Enter your username", // Tooltip for guidance
    data: { id: 1, role: "admin" }, // Additional metadata
    node: null, // Represents associated node (optional)
    colDef: { editable: true }, // Column definition if used in a grid context
    stopEditing: null, // Function or logic to stop editing (optional)
    disabled: false, // If true, the field is disabled
    multiline: false, // If true, allows multi-line input
    inputMask:""//for now this is not implemented
}
