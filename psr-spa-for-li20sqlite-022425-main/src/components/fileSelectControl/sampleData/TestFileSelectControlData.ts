
import { IfileSelectControl } from "../interfaces/IfileSelectControl";

export const sampleData: IfileSelectControl = {
    uniqueName: 'file-select-control-1', // Unique identifier for the control
    isRenderAsForm: true, // The control is rendered inside a form
    value: '', // The current file name or value
    label: 'Upload File', // Label text for the file input
    isRequired: true, // Indicates the field is required
    disabled: false, // The control is not disabled
    nameDesc: 'Select a file to upload', // Tooltip or description text for the label
    valueDesc: 'Only .txt files are allowed', // Additional description shown below the control
    fileTypeAccepts: '.txt', // Only .txt files are accepted
};
