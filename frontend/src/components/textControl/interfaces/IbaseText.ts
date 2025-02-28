
export interface IbaseText {
    uniqueName: string; // Unique identifier for the label, used to determine dropability
    nameDesc: string; // Tooltip text displayed on hover
    value: string | null; // Value of the label, determines the label content
}
