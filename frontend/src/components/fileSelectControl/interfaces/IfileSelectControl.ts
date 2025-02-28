export interface IfileSelectControl {
    uniqueName: string;
    isRenderAsForm: boolean;
    value?: string | string[];
    label?: string;
    isRequired?: boolean;
    disabled?: boolean;
    nameDesc?: string;
    valueDesc?: string;
    fileTypeAccepts?: string;
    handleValueChange?: (value: string | File | null, name: string | undefined, isDefault?: boolean) => void;
}