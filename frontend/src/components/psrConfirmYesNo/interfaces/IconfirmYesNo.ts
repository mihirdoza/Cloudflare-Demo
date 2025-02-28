import { Iimage } from "../../psrImage/interfaces/Iimage";
export interface IconfirmYesNo {
    isOpen:boolean;// open message Dialog
    uniqueName: string; //uniqueName for the control and required
    message:string; // dialog
    title?:string;
    image?:Iimage;
    showOkButton?:boolean // if you want to display only ok button then pass true.
    handelYesButtonClick:()=>void //yes button click
    handelNoButtonClick:()=>void //no button click
    handelOkButtonClick?:()=>void //ok button click
    styleClasses?:string;//tailwind based classes for asddtional styling
}