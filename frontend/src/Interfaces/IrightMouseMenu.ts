
export interface IrightMouseMenu {
    showIcon:boolean;
    uniqueName: string;// unique name of component
    container: string; // name of container
    handleSelect:(value:any) => void
    selectedNode?: any; // selected node data
    menuData?: any; // for static data,
    searchedDeviceData?:any // search data for gemini info,
    selectedRow?:any // selected row of grid data.
    rowIndex?:number;//row index number
    field?:string;// selected field for grid
    featureId?:string // feature id 
}
