
import { IfileData } from "./IfileData";

export interface IbrowseFileControl {
    uniqueName: string; // Unique identifier for the control
    defaultFile?:File|Object;
    isRenderAsForm: boolean; // Indicates if the control is rendered within a form
    w: string | number;
    h: string | number;
    multiple?: boolean; //Set true
    disabled?: boolean; // Whether the control is disabled
    fileTypeAccepts?: string; // Accepted file types (e.g., '.txt', 'image/*')
    handleValueChange?: (
        value: IfileData[],
        name: string | undefined,
        isDefault?: boolean
    ) => void; // Callback for value changes
}
