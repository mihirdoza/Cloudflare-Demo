
import { Iimage } from "./Iimage";
import { Ilabel } from "./Ilabel";

export interface IactionImage {
    uniqueName:string;//uniqueName identifier and required
    image: Iimage;
    w: number | string; //Width
    actionCode: string;//it will be used to identify the action source
    handleMouse: (event: any, actionCode?: string) => void;
    h?: number | string;//if not provided it will take h=w
    label?: Ilabel;
    labelAlign?: "bottom" | "top";//if not provided it will take bottom
    labeltooltip?: string;
    border?: "none" | string; //If set border will show default none
    selected?: boolean; // it will be used to highlight the selection
}
