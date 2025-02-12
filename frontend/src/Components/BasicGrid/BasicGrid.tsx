
import { useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import { IconButton } from '@mui/material';
import { CellEditingStartedEvent, GridOptions, RowDoubleClickedEvent } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../../className/BasicGrid.css";
import { copyDisplayedColumnsData, handleMouseEvent, handleCellEditingStopped, handleColumnResized, hideShowPaginatation, onGridReady, onPaginationChanged, onSelectionChanged } from './GridEvent';
import { ContainerStyle, GridDefaults } from '../../Interfaces/Defaults';
import { IbasicGrid, IbasicGridColDef } from '../../Interfaces/IbasicGrid'
import { fnGetFilePath } from '../../Common/fnGetFilePath';
import { fnCopyToClipboard } from '../../Common/fnCopyToClipboard';
import Image from '../Image/Image';
import ActionImage from '../ActionImage/ActionImage';
import Label from '../Label/Label';
import RightMouseMenu from '../RightMouseMenu/RightMouseMenu';

const BasicGrid = (gridProps: IbasicGrid) => {
    console.log('45gridProps', gridProps)
    let gridRef: any = useRef();
    const [rowData, setRowData] = useState<any>([]);
    const [columnDefs, setColumnDefs] = useState<IbasicGridColDef[]>([]);
    const [indexColumnAdded, setIndexColumnAdded] = useState<boolean>(false);
    const gridParentStyle = useMemo(() => (ContainerStyle), []);
    const defaultColDef: any = useMemo(() => {
        return {
            filter: true,
            sortable: false,
            resizable: true,
            suppressMovable: true,
            cellClass: gridProps.allowAutoSizeColumn || gridProps.autoHeightRow ? '' : 'nz-truncate-text',
            paginationPanelTemplate: function () {
                return gridProps.allowPagination ? `
                            <div class="ag-paging-panel">
                                <span class="ag-paging-row-summary-panel" id="paginationCount"></span>
                                <span class="ag-paging-page-summary-panel">
                                    <button class="ag-paging-button ag-paging-first" ref="btFirst">|&lt;</button>
                                    <button class="ag-paging-button ag-paging-previous" ref="btPrevious">&lt;</button>
                                    <span ref="lbCurrent"></span>
                                    <span>of</span>
                                    <span ref="lbTotal"></span>
                                    <button class="ag-paging-button ag-paging-next" ref="btNext">&gt;</button>
                                    <button class="ag-paging-button ag-paging-last" ref="btLast">&gt;|</button>
                                </span>
                            </div>
                        ` : false;
            }
        };
    }, [gridProps])
    const lastMouseEvent = useRef(null);
    const gridOptions: GridOptions = {
        onRowDoubleClicked: (event: RowDoubleClickedEvent<any>) => {
            if (gridProps.rowDoubleClick) {
                gridProps.rowDoubleClick(event.data);
            }
        },
        onCellEditingStarted: async (event: CellEditingStartedEvent) => {
            try {
                event.data.IsSaved = false;

                let mouseEvent: MouseEvent | null =
                    event.event as MouseEvent || lastMouseEvent.current;

                // Ensure mouseEvent is available
                if (!mouseEvent) {
                    // alert('Mouse event not available.');
                    return;
                }

                const agPopup = document.querySelector(".ag-popup-editor");
                if (!agPopup) {
                    alert('AG Grid popup editor element not found.');
                    return;
                }

                const gridContainer = document.querySelector('.nz-ag-container');
                if (!gridContainer) {
                    return;
                }
                setTimeout(() => {
                    // Calculate popup position
                    if (mouseEvent) {
                        const gridContainerRect = gridContainer.getBoundingClientRect();
                        const popupHeight = agPopup?.clientHeight || 0;  // Height of the popup to calculate space
                        const spaceAbove = mouseEvent && mouseEvent?.clientY - gridContainerRect.top;
                        const spaceBelow = gridContainerRect.bottom - mouseEvent.clientY;

                        // Check if there's enough space below or if the space above is more
                        const isSpaceBelow = spaceBelow > spaceAbove;

                        let topOffset = isSpaceBelow ? mouseEvent && mouseEvent.clientY && mouseEvent.clientY : mouseEvent.clientY - popupHeight;

                        // Update popup position
                        const popupElement = agPopup as HTMLElement;
                        popupElement.style.top = `${topOffset}px`;

                        // Adjust height of checkedlistbox (if present)
                        var checkListDiv = document.querySelector('.ag-popup-editor .flist-box');
                        if (checkListDiv) {
                            let adjustedHeight = isSpaceBelow
                                ? spaceBelow
                                : spaceAbove;
                            checkListDiv.setAttribute("style", `max-height:${adjustedHeight}px;height:auto`);
                        }
                    }


                }, 0);
            } catch (error) {
                alert(`Error adjusting popup position: ${error}`);
            }

        },
    };
    useEffect(() => {
        if (gridProps.rowData || gridProps.isRefreshGrid) {
            setRowData([...gridProps.rowData]);
        }
    }, [gridProps.rowData, gridProps.isRefreshGrid]);
    useEffect(() => {
        if (rowData && rowData.length > 0 && gridProps.allowRWD !== undefined) {
            if (gridProps.callbackData && rowData[0].AutoID === undefined) {
                if (gridProps.containerName === "FormControlGrid") {
                    gridProps.callbackData(rowData, gridProps.gridName, true);
                }
                else {
                    gridProps.callbackData(rowData, gridProps.gridName, true);
                }
            }
        } else {
            
            if (gridProps.callbackData && gridProps.gridName) {
                gridProps.callbackData(rowData, gridProps.gridName, true);
            }
        }

    }, [rowData,gridProps]);
    useEffect(() => {

        if (gridProps?.columnDefs && gridProps?.columnDefs?.length > 0) {
            let columns: any = [];
            setIndexColumnAdded(true);
            if (!gridProps?.allowColumnResize) {
                if (gridProps?.columnDefs) {
                    gridProps?.columnDefs?.forEach((item: any) => {
                        item["resizable"] = item.resizable ? true : false;
                        if (item?.headerName?.toLowerCase() === "action" || item?.field?.toLowerCase() === "action") {
                            item["resizable"] = false;
                            item["headerName"] = "";
                            item["field"] = ""
                            item["suppressSizeToFit"] = true;
                            item["cellClass"] = "nz-index-cell";
                        }
                    });
                    gridProps.columnDefs[gridProps?.columnDefs?.length - 1]["resizable"] = false;
                }
            }
            if (gridProps.instanceName === "notes" || gridProps.instanceName === "nz_forcensic_log") {
                gridProps?.columnDefs &&  gridProps?.columnDefs.forEach((item: any) => {
                    if (item.field === "LastUpdated") {
                        item.sort = "desc"
                    }
                })
            }
            if (gridProps?.allowColumnResize) {
                gridProps?.columnDefs?.forEach((item: any) => {
                    item["resizable"] = true;
                });
            }
            if (gridProps?.allowSort) {
                gridProps?.columnDefs?.forEach((item: any) => {
                    item["sortable"] = true;
                });
            }
            if (gridProps?.allowEdit) {
                gridProps?.columnDefs?.forEach((item: any) => {
                    item["editable"] = true;
                });
            }
            if (gridProps.isJsonPropertyGrid) {
                gridProps?.columnDefs?.forEach((item: any) => {
                    if (item.field === "Action") {
                        item["editable"] = false;
                        item["resizable"] = false;
                    }
                });
            }
            if (gridProps?.allowDrag) {
                gridProps?.columnDefs.forEach((item: any) => {
                    item["suppressMovable"] = !gridProps?.allowDrag;
                });
            }
            if (gridProps?.checkboxSelection) {
                columns.push({
                    headerName: "",
                    width: 30,
                    filter: false,
                    sortable: false,
                    pinned: true,
                    cellClass: "nz-index-cell",
                    resizable: false,
                    checkboxSelection: gridProps?.checkboxSelection
                        ? gridProps?.checkboxSelection
                        : false,
                });
            }
            if (gridProps?.allowFilter) {
                gridProps?.columnDefs?.forEach((item: any) => {
                    item["filter"] = true;
                });
            } else {
                gridProps?.columnDefs?.forEach((item: any) => {
                    item["filter"] = false;
                });
            }
            if (gridProps?.descRowNumber) {
                columns.push({
                    headerName: "",
                    field: "",
                    valueGetter: function (params: any) {
                        var rowCount = params.api.getDisplayedRowCount();
                        var descendingNumber = rowCount - params.node.rowIndex;
                        params.node.data.special = descendingNumber; // added property called special
                        return descendingNumber;
                    },
                    width: 60,
                    filter: false,
                    sortable: false,
                    pinned: true,
                    cellClass: "nz-index-cell",
                    resizable: false,
                    cellRenderer: (params: any) => (
                        <>
                            <div className='nz-grid-alert-icon-div'>
                                {(gridProps.instanceName === "infobar_Error_data" && params.data.attended === 1) && <div className='nz-grid-alert-row-icon'>
                                    <ActionImage
                                        image={{
                                            uniqueName: "cancel",
                                            source: fnGetFilePath("Cancel.svg", "misc"),
                                            type: "svg",
                                            w: "20px",
                                            h: "20px",
                                            tooltip: "Clear"
                                        }}
                                        uniqueName='cancelIcon'
                                        actionCode='cancel'
                                        w="20px"
                                        h="20px"
                                        handleMouse={() => gridProps.AlertCrossClick && gridProps.AlertCrossClick(params)}
                                    />
                                </div>}
                            </div>
                            <Label label={params.value} uniqueName='rowNumber' />
                        </>
                    ),
                });
            } else if (!gridProps?.rowNumber) {
                columns.push({
                    headerName: "",
                    field: "",
                    valueGetter: "node.rowIndex + 1",
                    width: gridProps.hideCopyRowIcon ? 30 : 60,
                    filter: false,
                    sortable: false,
                    pinned: true,
                    cellClass: "nz-index-cell",
                    resizable: false,
                    cellRenderer: (params: any) => (
                        <div className='nz-grid-copy-icon-div'>
                            {!gridProps.hideCopyRowIcon && <div className='nz-grid-copy-row-icon'>
                                <ActionImage
                                    image={{
                                        uniqueName: "copy",
                                        source: fnGetFilePath("Copy.svg", "misc"),
                                        type: "svg",
                                        w: "20px",
                                        h: "20px",
                                        tooltip: "Copy Data"
                                    }}
                                    uniqueName='copy'
                                    w="20px"
                                    h="20px"
                                    actionCode='copyRow'
                                    handleMouse={(event: any, actionCode: any) => {
                                        console.log('actionCode', actionCode)
                                        console.log('event', event)
                                        
                                        copyRowRef.current(params)
                                    }}
                                />
                            </div>}
                            <Label label={params.value}  uniqueName='rowNumber-cell'/>
                        </div>
                    ),
                });
            }
            if ((gridProps?.hideRowKebabMenu === false || gridProps.allowEditButton || gridProps.allowDeleteButton) && !gridProps.isReadOnly ) {
                let width = 30
                if ((gridProps?.hideRowKebabMenu === false && gridProps.allowEditButton && gridProps.allowDeleteButton)          
                ) {
                    width = 90
                } else if ((gridProps?.hideRowKebabMenu === false && gridProps.allowEditButton) 
                    || (gridProps?.hideRowKebabMenu === false && gridProps.allowDeleteButton) 
                    || (gridProps?.hideRowKebabMenu === true  && gridProps.allowEditButton && gridProps.allowDeleteButton)) {
                    width = 60
                }
                else {
                    width = 30
                }
                columns.push({
                    headerName: "",
                    suppressSizeToFit: true,
                    cellClass: "nz-index-cell",
                    resizable: false,
                    editable: false,
                    filter: false,
                    pinned: true,
                    width: width,
                    cellRenderer: (params: any) => {
                        return (
                            <>
                                <div className="nz-right-mouse-action-cell nz-session-task-hide">
                                    <div className='nz-right-mouse-action-cell-btn'>


                                        {/*We are using a right mouse menu component, but it has not been created yet. */}
                                        {gridProps?.hideRowKebabMenu === false && <RightMouseMenu  
                                            uniqueName='basic-grid'
                                            container={"data_grid"}
                                            selectedRow={params.data}
                                            featureId={gridProps.featureId}
                                            handleSelect={(value:any)=>{}}
                                          showIcon={true}
                                        />}
                                        {/* <RightMouseMenu
                                        container={"data_grid"}
                                        selectedRow={p.data}
                                        instanceName={gridProps.instanceName}
                                    /> */}
                                        <div className='nz-edit-delete-icon'>
                                            {gridProps.allowEditButton &&
                                                <ActionImage
                                                    image={{
                                                        uniqueName: "edit",
                                                        source: fnGetFilePath("Edit_128x128.svg", "misc"),
                                                        type: "svg",
                                                        w: "20px",
                                                        h: "20px",
                                                        tooltip: "Click to edit"
                                                    }}
                                                    w="30px"
                                                    uniqueName='editicon'
                                                    actionCode='edit click'
                                                    h="20px"
                                                    handleMouse={(value:any,actionCode:any)=>{
                                                        
                                                        gridProps.handleMouseForEdit &&  gridProps.handleMouseForEdit(params)
                                                    }}
                                                />}
                                            {
                                                gridProps.allowDeleteButton && <ActionImage
                                                image={{
                                                    uniqueName: "cancel",
                                                    source: fnGetFilePath("Cancel.svg", "misc"),
                                                    type: "svg",
                                                    w: "20px",
                                                    h: "20px",
                                                    tooltip: "Click to Delete"
                                                }}
                                                w="30px"
                                                actionCode='delete click'
                                                uniqueName='deleteicon'
                                                h="20px"
                                                handleMouse={(value:any,actionCode:any)=>{
                                                    
                                                    gridProps.handleMouseForDelete &&  gridProps.handleMouseForDelete(params)
                                                }}
                                                />
                                            }
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    },
                });
            }
            if (gridProps.allowCheckBoxOnRow) {
                columns.push({
                    headerName: "",
                    suppressSizeToFit: true,
                    headerCheckboxSelection: gridProps.rowSelection === "single" ? false : true,
                    showDisabledCheckboxes: true,
                    cellClass: "nz-index-cell",
                    resizable: false,
                    editable: false,
                    filter: false,
                    pinned: true,
                    width: 50,
                    checkboxSelection: (params: any) => {
                        let data = gridProps.gridRef ? gridProps.gridRef : gridRef
                        data.current.api.forEachNode((node: any) =>
                            node.setSelected(!!node.data && node.data.selected === true)
                        )
                        return true
                    }
                });
            }
            Array.prototype.push.apply(columns, gridProps?.columnDefs);
            if (gridProps?.allowAutoSizeColumn) {
                if (gridProps.instanceName !== "CablingGrid") {
                    setAutoSizeColumnWidthRef.current(gridProps.rowData, columns)
                } else {
                    setColumnDefs(columns);
                }

            } else {
                setColumnDefs(columns);
            }


        } else {
            setIndexColumnAdded(false);
            setColumnDefs(gridProps?.columnDefs ? gridProps?.columnDefs:[]);
        }
    }, [gridProps?.columnDefs, gridProps.rowData, gridProps]);
    const setAutoSizeColumnWidth = async (rowData: any, columns: any) => {
        calculateColumnWidths(rowData, columns).then((calculatedColumnDefs: any) => {
            setColumnDefs([...calculatedColumnDefs])
        })
    }
    const setAutoSizeColumnWidthRef = useRef(setAutoSizeColumnWidth)
    const calculateColumnWidths = async (data: any, cols: any) => {
        const calculatedColumnDefs = await cols.map((col: any) => {
            const maxLength = Math.max(...data.map((row: any) => (row[col.field] || '').toString().length));
            const calLeaght = (col?.headerName?.toString()?.length) * 10 + 20
            let width = !col.flex &&
                // Non-empty header name (you mentioned this)
                col.headerName !== '' &&
                // Not hidden (you mentioned this)
                !col.hide ? maxLength * 8 + 15 : col.width
            width = width <= 80 && col.headerName !== '' ? calLeaght : width

            return { ...col, width };
        })
        console.log('calculatedColumnDefs', calculatedColumnDefs)
        return calculatedColumnDefs;
    };
    const copyRow = (rowDataCopy: any) => {
        
        console.log('owDataCopy', rowDataCopy)
        const displayedColumns =
            gridProps.gridRef.current.api.getAllDisplayedColumns();
        console.log('displayedColumns', displayedColumns)
        const allRowNodes = gridProps.gridRef.current.api.getModel().rowsToDisplay;
        if (!allRowNodes || allRowNodes.length === 0) {
            alert("No rows to copy.");
            return;
        }
        const rowData: any = {};
        displayedColumns.forEach((column: any, colIndex: number) => {
            if (!column.lastLeftPinned) {
                const cellValue = gridProps.gridRef.current.api.getValue(column, rowDataCopy);
                rowData[column.getColDef().headerName] = cellValue;
            }
        });

        const jsonData = JSON.stringify(rowData, null, 2);
        fnCopyToClipboard(jsonData, null, false);
    };
    const copyRowRef = useRef(copyRow)

    return (
        <>
            {gridProps?.showGrid && <div
                style={ContainerStyle}
                className={"nz-grid-container-div "}
                id="gc-app-para"
                key={gridProps.uniqueName}
            >
                {columnDefs && columnDefs.length > 0 && rowData && rowData?.length > 0 && (
                    <>
                        {gridProps.tableLabel && gridProps.showPropertyHeader && <div className="nz-form-title-bar">
                            <div className="form-title-header">
                                <div className="nz-qa-bar-container-entiyGrid nz-sub-header-propPane">
                                    <span className="nz-property-bar-title-span">
                                        {gridProps.tableLabel ? gridProps.tableLabel : gridProps.tableName}
                                    </span>
                                </div>
                            </div>
                        </div>}
                        {!gridProps.hideCopyIcon && rowData && rowData?.length > 0 && (
                            <div className={`nz-copy-to-clipboard-div ${gridProps.showPropertyHeader ? 'nz-showPropertyHeader-with-download' : ''}`}>
                                <IconButton
                                    className={
                                        (indexColumnAdded &&
                                            !gridProps?.isJsonPropertyGrid) ||
                                            gridProps?.isReadOnly
                                            ? "nz-copy-to-clipboard-only"
                                            : "nz-copy-to-clipboard-josn-grid"
                                    }
                                    size="small"
                                    title={gridProps.isExportOnCopy ? "Download Data" : "Copy Data"}
                                    onClick={() => copyDisplayedColumnsData(gridProps, gridRef ? gridRef : gridProps.gridRef)}
                                >
                                    {gridProps.isExportOnCopy ?
                                        <Image uniqueName= "download" source={fnGetFilePath("Download.svg", "misc")} type="svg" w="20px" h="20px" /> :
                                        <Image uniqueName= "copy" source={fnGetFilePath("Copy.svg", "misc")} type="svg" w="20px" h="20px" />
                                    }
                                </IconButton>
                            </div>
                        )}
                        {gridProps?.isEditGridShowBelow && !gridProps.isReadOnly && <div className="nz-swapgrid-addbtn">
                            <ActionImage
                                image={{
                                    uniqueName:"add",
                                    source: fnGetFilePath("AddCircle.svg", "misc"),
                                    type: "svg",
                                    w: "20px",
                                    h: "20px",
                                    tooltip: "Click to Add"
                                }}
                                w="20px"
                                uniqueName='addicon'
                                actionCode='add click'
                                h="20px"
                                handleMouse={()=>{
                                    
                                   gridProps.addClickOnSwapGrid &&  gridProps.addClickOnSwapGrid()}}
                            />
                        </div>}

                        <div
                            style={gridProps?.gridParentStyle ? gridProps?.gridParentStyle : gridParentStyle}
                            className="ag-theme-alpine nz-ag-container"
                            id={gridProps.id}
                        >
                            <AgGridReact
                                className={gridProps.className}
                                ref={gridProps.gridRef ? gridProps.gridRef : gridRef}
                                rowHeight={GridDefaults.rowHeight}
                                onGridReady={(params: any) => {
                                    // gridRef.current = params.api
                                    onGridReady(params, gridProps)
                                }}
                                pagination={gridProps.allowPagination || false}
                                columnDefs={columnDefs}
                                rowData={rowData}
                                defaultColDef={defaultColDef}
                                rowClassRules={gridProps.rowClassRules || null}
                                suppressPaginationPanel={
                                    gridProps.suppressPaginationPanel || false
                                }
                                onCellEditingStopped={(event: any) => {
                                    // handleCellEditingStopped(event, gridProps, rowData).then((row: any) => {
                                        
                                    //     if (row) {
                                    //         setRowData([...row])
                                    //     }
                                    // })

                                }
                                }
                                onCellValueChanged={(params) => {
                                    if (params.source === undefined) {
                                        handleCellEditingStopped(params, gridProps, rowData).then((row: any) => {
                                            
                                            console.log('row', row)
                                            if (row) {
                                                setRowData([...row])
                                                // if (gridProps.instanceName === "form_control_grid")
                                            }
                                        })
                                    }
                                    // Perform additional updates or processing here
                                    // params.api.refreshCells({ force: true });
                                    // params.api.stopEditing();
                                }}
                                onRowSelected={gridProps?.onRowSelected}
                                paginationPageSize={
                                    gridProps.paginationPageSize || GridDefaults.paginationPageSize
                                }
                                tooltipShowDelay={0}
                                tooltipHideDelay={2000}
                                suppressFieldDotNotation={true}
                                suppressAutoSize={false}
                                gridOptions={
                                    gridProps?.gridOptions || gridOptions
                                }
                                singleClickEdit={true}
                                enableCellTextSelection={true}
                                ensureDomOrder={true}
                                onRowDataUpdated={() => {
                                    hideShowPaginatation(gridProps);
                                }}
                                onColumnResized={(params: any) => handleColumnResized(params, gridProps)}
                                paginationAutoPageSize={
                                    gridProps.paginationAutoPageSize || false
                                }
                                rowSelection={gridProps.rowSelection || 'single'}
                                onCellClicked={(event: any) => {
                                    handleMouseEvent(event, gridRef, gridProps)
                                }}
                                enableBrowserTooltips={true}
                                skipHeaderOnAutoSize={true}
                                onSelectionChanged={(event: any) => onSelectionChanged(event, gridProps, rowData)}
                                onRowClicked={(event: any) => {
                                    handleMouseEvent(event, gridRef, gridProps)
                                }}
                                onPaginationChanged={(event: any) => {
                                    onPaginationChanged(event, gridProps, rowData)?.then((row: any) => {
                                        if (row) {
                                            setRowData([...row])
                                        }
                                    })
                                }}
                                rowBuffer={GridDefaults.rowBuffer}
                                onCellMouseDown={(event: any) => {
                                    handleMouseEvent(event, gridRef, gridProps)
                                }}
                                overlayNoRowsTemplate={`<span class="nz-noData-in-grid-${gridProps.className}">No Rows To Show</span>`}
                            ></AgGridReact>
                        </div>
                    </>
                )
                }
            </div >}
        </>
    )
}

export default BasicGrid