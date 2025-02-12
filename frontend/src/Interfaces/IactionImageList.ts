
import { IactionImage } from "../Interfaces/IactionImage";

export interface IactionImageForList extends IactionImage {
    separator?: boolean; // Whether to show separator or not (it will added Hr in between action images)
    menuData?: any;
}
export interface IactionImageList {
    uniqueName: string; //uniqueName for the control and required
    actionImages: IactionImageForList[];
    isVertical: boolean;//Whether strip will show wertically or not
    w: number | string;//Width of strip
    h: number | string;//Height of strip 
    bgColor?: string;//Background color of the strip 
    tooltip?: string;//Tooltip of the strip
    border?: string;//border to show it required
    spacing?: string;//if provided it will apply padding between contianer and action images 
    handleSelect?: (value: any) => void // This function will be called when an action image is selected
    handleMouseLeave?: () => void //mouse move out of strip
}