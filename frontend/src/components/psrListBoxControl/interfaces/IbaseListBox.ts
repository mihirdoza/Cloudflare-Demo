
export interface IbaseListBox {
    tooltip: string; // Tooltip text for the list
    filteredList: string[]; // Array of items to be displayed in the list
    allowFilter: boolean;// Whether filter needed or not
    value: string | null; // Current value of the input or selected item
    errorMessage: string; // Error message to be displayed below the list
    inputValue: string;//used to set the input value when user search 
    handleInputEvent: (event: React.ChangeEvent<HTMLInputElement>) => void; // Callback for handling input events
    handleListItemClick: (event: React.MouseEvent<Element>, index: number, item: string) => void; // Callback for list item click events
}
