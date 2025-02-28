
import { IeditComboControl } from "../interfaces/IeditComboControl";

export const sampleData: IeditComboControl = {
    uniqueName: "msgStartAtSelector",
    isRenderAsForm: true, // Render as part of a form
    label: "Msg Start At",
    value: null, // Initial value is not selected
    inputMask: "refMsgStartAt", // Reference table for fetching options
    isRequired: false, // Field is required
    isDefault: false, // Do not auto-select default value
    nameDesc: "Select item from the list.", // Tooltip description
    valueDesc: "This value determines the message start state.", // Additional value description
    disabled: false, // Field is enabled
    isObjectVal: false, // Indicates the options are objects
    type: "isEquipmentTypes", // Type of options being handled
    tooltip: "Choose an item from the dropdown.", // Tooltip for the field
    api: {}, // Placeholder for Ag-Grid API
    node: {}, // Placeholder for Ag-Grid node
    data: {}, // Dynamic data
    // optionsData: [
    //     { eqType: "Server" },
    //     { eqType: "Switch" },
    //     { eqType: "Router" },
    //     { eqType: "Firewall" },
    // ], // Dropdown options
    preventDefaultValue: false, // Prevent auto-selecting default value
    instanceName: undefined, // Instance name for conditional behavior
    featureId: "106", // Feature ID for conditions
};
