
export interface IrightMouseMenuToggle {
    showIcon:boolean;
    uniqueName: string;// unique name of component
    container: string; // name of container
    handleSelect:(value:any) => void
    featureId?:string // feature id 
    selectedLabel:string;//selected toggle
}
