
import { Iimage } from "./Iimage";

export interface IdirtyFlagImage {
    uniqueName: string;// unique name of component
    image: Iimage; // Image
    w: number | string; //Width
    h?: number | string;// If Height will not be given it will set h=w 
    allowBorder?: boolean; //If true it will allow border
    isDirty?: boolean; // If true it will add background
    bgColor?: string; // Background color of the container
    handleMouse?: (event: any) => void;
}
