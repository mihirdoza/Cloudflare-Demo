
import { IactionImage } from "./IactionImage";

export interface IbaseRightMouseMenu {
    showIcon:boolean;
    uniqueName: string;// unique name of component
    imageObject: IactionImage; //image object with source, width and height
    menuData?: any; // for static data,
    handleClick:(event: any, actionCode?: any) => void;
    handleSelect:(value:any) => void;
}


