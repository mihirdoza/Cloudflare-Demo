
import { ActionMeta, OnChangeValue, SingleValue } from "react-select";

export interface IbaseComboBox {
    dataItems: any;                     // List of dropdown options
    selectedValue: SingleValue<any>;    // Currently selected value
    disabled: boolean;                  // Whether the dropdown is disabled
    isError: boolean;                   // Whether any error or not 
    errorMessage:string;                // Show error message if any
    handleSelectionChange: (newValue: OnChangeValue<any, false>, actionMeta: ActionMeta<any>) => void; // Callback for value changes
}