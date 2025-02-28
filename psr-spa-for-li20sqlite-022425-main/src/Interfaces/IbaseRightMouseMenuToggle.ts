
import { IactionImage } from "./IactionImage";

export interface IbaseRightMouseMenuToggle {
    showIcon:boolean;
    uniqueName: string;// unique name of component
    imageObject: IactionImage; //image object with source, width and height
    container:string;
    selectedLabel?:string; // selecetd label name
    handleSelect:(value:any) => void;
}


