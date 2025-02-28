
import { IlistBoxControl } from "../interfaces/IlistBoxControl";

export const sampleData: IlistBoxControl = {
    uniqueName: "example-listbox", // Unique identifier for the control
    isRenderAsForm: true, // Indicates the control is rendered within a form
    inputMask: "refCountry", // Identifier for fetching data dynamically
    allowFilter: true,
    value: "Antigua and Barbuda", // Currently selected value
    label: "Select Country", // Label text for the control
    tooltip: "Choose a Country from the list", // Tooltip description
    nameDesc: "Country Selector", // Description text for the label
    valueDesc: "This field is used to select a Country", // Additional descriptive text
    isRequired: true, // Field is required
    isDefault: false, // Current value is not the default
    // data: {
    //     ProfileString: "Location1;Location2;Location3", // Data source for initializing the list
    //     IsFromPopup: false, // Indicates the control is not rendered in a popup
    //     ChangeEvent: (status: boolean) => {
    //         console.log(`Popup state changed: ${status}`);
    //     }, // Callback for popup state change
    // },
    // api: {
    //     stopEditing: () => {
    //         console.log("Editing stopped.");
    //     }, // Stops editing in the grid
    // },
    // node: {
    //     setDataValue: (key: string, value: string) => {
    //         console.log(`Set ${key} to ${value}`);
    //     }, // Updates grid data for the node
    // },
};
