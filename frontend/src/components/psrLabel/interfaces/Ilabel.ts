export interface Ilabel {
    uniqueName: string; //key for the control and required
    label: string; //string length can be 1 to (2,147,483,647).
    styleClasses?:string;//tailwind classes to hanlde other styles
    tooltip?: string;
    forHtml?:string,//pass key of input if any
}