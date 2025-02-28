
import { AutocompleteChangeDetails, AutocompleteChangeReason } from "@mui/material";

export interface IbaseEditCombo {
    dataItems: Array<any>; // Array of items to display in the dropdown
    disabled: boolean; // Determines if the Autocomplete is read-only
    selectedValue: any; // Currently selected value in the Autocomplete
    tooltip: string; // Tooltip text displayed on hover
    isObjectVal: boolean; // If true, options are objects with specific properties
    type: string; // Type of data to handle (e.g., "isEquipmentTypes", "isProdLine")
    isError: boolean; // Indicates if there is an error in the field
    errorMessage: string; // Error message to display when `isError` is true
    isRequired: boolean; // Determines if the field is required
    handleSelectionChange: (
        event: React.SyntheticEvent<Element, Event>,
        value: string | any,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<unknown> | undefined
    ) => void; // Callback for when the value changes
}
