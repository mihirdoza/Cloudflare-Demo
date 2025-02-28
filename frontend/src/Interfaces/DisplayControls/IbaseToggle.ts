
export interface IbaseToggle {
    value: number | boolean | string; // The current value of the checkbox (can be boolean or string).
    isChecked: boolean; // Indicates if the checkbox is checked.
    disabled: boolean; // Indicates if the checkbox is disabled.
    isNZ: boolean; // Additional condition to disable the checkbox.
    tooltip: string; // Tooltip text for the checkbox.
    classNames: string; // Additional CSS class names for styling.
    displayLabel: string; // The label displayed next to the checkbox.
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Callback when the checkbox value changes.
}
