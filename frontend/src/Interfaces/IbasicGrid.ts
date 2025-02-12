
import { ColDef, GridOptions } from "ag-grid-community";

export interface IbasicGridColDef extends ColDef {
    DisplayControl?: string; // display control like input,select,textarea etc.
    IsRequired?: boolean; // required field
    IsReadOnly?: boolean; // read only field
}

export interface IbasicGrid {
    uniqueName:string// unique name
    instanceName: string; // grid instance name
    showGrid: boolean; // hide show grid base
    rowData?: any;  // grid row data
    columnDefs?: IbasicGridColDef[] ; // grid column data
    totalRecords?: Number; // display in pagination total records
    className?: string; // grid class name
    gridRef?: any; // grid reference 
    featureId?:string;//feature id
    allowPagination?: boolean; // to show or hide pagination
    rowClassRules?: any | null; //dynamically applies CSS classes to rows based on data or custom conditions.
    suppressPaginationPanel?: boolean; //  property in AG Grid that hides the pagination controls
    paginationPageSize?: number; //sets the number of rows displayed per page when pagination is enabled.
    gridOptions?: GridOptions; // grid options
    paginationAutoPageSize?: boolean; //automatically adjusts the number of rows per page based on the grid's height
    rowSelection?: 'single' | 'multiple'; // sets the type of row selection
    hideCopyIcon?: boolean; // hide or shows copy icon
    gridParentStyle?: any; //apply style in parent div
    id?: string | ""; // grid id
    isJsonPropertyGrid?: boolean; // flag to hendel json property grid
    isReadOnly?: boolean; // sets readonly grid.
    containerName?: string; // grid container name
    gridName?: string;// grid name
    isNewRowAllow?: boolean; // allow add new row
    index?: number; // grid index
    isRefreshGrid?: boolean; // refesh grid
    allowColumnResize?: boolean; // allow column resize (if you pass false then it will allow resize all column accept id and last column)
    allowSort?: boolean; // allow sorting
    allowEdit?: boolean; //allow edit
    allowDeleteButton?: boolean; //allow delete
    allowEditButton?: boolean; //allow edit
    allowDrag?: boolean; //  allow drag and drop
    checkboxSelection?: boolean; // allow checkbox selection in header
    hideKebabMenu?: boolean; // allow to show kebab menu
    allowFilter?: boolean; // allow filter on row header
    descRowNumber?: boolean; // show row number in descending order in id column
    rowNumber?: boolean; // show id column
    deleteRecord?: any; // allow delete record on row
    importGrid?: any; // import grid to set css style
    allowRWD?: any; // allow read,write and delete
    gridTitle?: string; // show grid title
    dynamicPagination?: boolean; // allow dynamic pagination
    dynamicheight?: number; // pass of set hight of grid
    entityName?: string; // entity name of grid
    jsonPropertyGrid?: boolean; // apply style for one to many grid
    actionColumn?: boolean | false; // allow action  column
    isExportOnCopy?: boolean; // show export/download icon on grid header
    exportFileName?: string; // export/download file name 
    hideRowKebabMenu?: boolean; // hide or show row kebab menu
    allowCheckBoxOnRow?: boolean; // allow checkbox on row
    allowAutoSizeColumn?: boolean; // allow auto size column
    autoHeightRow?: boolean; // allow auto height row (ex. FQA notes)
    tableName?: string; // table name
    propertyData?: any; // property data for property grid
    isEditGridShowBelow?: boolean; // allow swap grid add button on grid header
    hideCopyRowIcon?: boolean; // show hide copy icon on row  
    tableLabel?: string; // to display on header of table label
    showPropertyHeader?: boolean; //  show header on for property panel
    apiPayloadForPangination?: (value: any) => void; // api payload for pagination
    addClickOnSwapGrid?: () => void; // add click on swap grid add button 
    AlertCrossClick?: (value: any) => void; // alert cross button click
    callbackData?: (data: any, name: any, isDefault: boolean) => void; // callback data on parent component
    apValueChange?: ((value: any, EntID: string, event: any, selectedData: any,instanceName?:string) => void); // ap form value change
    handleMouseEvent?: (event: any, gridRef: any) => void; // grid cell clicked function
    onSelectionChanged?: (event: any, props: any, rowData: any) => void; // handle selection change
    rowDoubleClick?: (value: any) => void; // triggered when a user double-clicks on a row
    onRowSelected?: (value: any) => void; // grid row selection function
    handleMouseForEdit?: (value?: any) => void //edit button click
    handleMouseForDelete?: (value?: any) => void //delete button click
    onCellClicked?:(event:any,gridRef:any)=>void // when cell click 
}