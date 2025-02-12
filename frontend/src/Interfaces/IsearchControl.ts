

export interface IsearchControl{    
    uniqueName:string; // unique name of control
    isShowFilterControl:boolean; // if true then display filter icon
    hiderightmousemenu:boolean // if true then hide right mouse menu
    lensDirty:boolean; // if true then change background color of lens icon
    filterDirty:boolean;// if true then change background color of filter icon
    searchInputValue:string; // search input text
    searchValueChange:(value:string)=>void;// to pass input value of parent control.
    handleFilterMouse:()=>void; // handle mouse event for filter
    handleLensMouse:()=>void;// handle mouse event for lens
    SelectedRightMouseItem: (value: string) => void;// callback value of selected filter item
}