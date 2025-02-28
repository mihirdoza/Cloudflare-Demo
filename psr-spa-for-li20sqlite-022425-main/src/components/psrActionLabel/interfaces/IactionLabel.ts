import { Ilabel } from "../../psrLabel/interfaces/Ilabel";
import { Iimage } from "../../psrImage/interfaces/Iimage";
export interface IactionLabel {
    uniqueName: string; //Unique name for the control and required
    label: Ilabel;        
    actionCode: string;
    handleMouse?: (event: React.MouseEvent<Element>, actionCode?: string) => void;
    tabIndex?:number,
    styleClasses?:string,
    image?:Iimage;
    align?: "center" | "start" | "end";//Label alignment. Default "center"
    imageAlign?: "start" | "end";//Show Image at start or end
    selected?: boolean;//if true it will be highlighted as selected
    tooltip?:string;// if provided it will show the tooltip 
    isSuccess?:boolean;
    allowIcon?:boolean;
    disabled?:boolean;
}