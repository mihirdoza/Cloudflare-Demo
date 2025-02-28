
import { format } from "date-fns";
import { Measurement } from "../../Interfaces/Defaults";
import { fnCopyToClipboard } from "../../Common/fnCopyToClipboard";

// after rending component this function will call
export const onGridReady = (params: any, props: any) => {
};
// when cell editing is stopped
export const handleCellEditingStopped = async (event: any, props: any, rowData: any) => {
    debugger
let updateRowData: any = rowData;
if (props.entityName === "NZLicenseKey") {
    let licensekeyData = rowData.filter((item: any) =>
        item._AP === "_NZLicenseKey" ? item : null
    );
    if (licensekeyData.length > 0) {
        // let value = licensekeyData[0].Value;
        // validateLicense(value).then(async (resp: any) => {
        //     if (checkIsSuccess(resp)) {
        //         let subValiData = resp.data;
        //         if (subValiData.valid) {
        //             for (let index = 0; index < rowData.length; index++) {
        //                 const element = rowData[index];
        //                 if (element._AP == "ProductName") {
        //                     element.Value = subValiData.productName;
        //                 } else if (element._AP == "StartDate") {
        //                     element.Value = subValiData.dateStart;
        //                 } else if (element._AP == "EndDate") {
        //                     element.Value = subValiData.dateEnd;
        //                 } else if (element._AP == "UserCount") {
        //                     element.Value = subValiData.count;
        //                 }
        //             }
        //             updateRowData = [...rowData]
        //         } else {
        //             for (let index = 0; index < rowData.length; index++) {
        //                 const element = rowData[index];
        //                 if (element._AP == "ProductName") {
        //                     element.Value = "";
        //                 } else if (element._AP == "StartDate") {
        //                     element.Value = "";
        //                 } else if (element._AP == "EndDate") {
        //                     element.Value = "";
        //                 } else if (element._AP == "UserCount") {
        //                     element.Value = "";
        //                 }
        //             }
        //             updateRowData = [...rowData];
        //             dispatchActionData({
        //                 type: "ERROR",
        //                 message: "Invalid License key !",
        //             });
        //         }
        //     }
        // });
    }
}
if (props?.instanceName === "PG.Notes") {
    let row: any = await document.querySelector(
        ".nz-add-edit-row-dialog .MuiPaper-root"
    );

    if (row?.offsetHeight <= 250) {
        row.style.height = "auto";
    }
}
if (event.value !== event.data.OldValue) {
    if (props.isNewRowAllow &&  props.apValueChange) {
        props.apValueChange(rowData).then((resp: any) => {
            if (resp) {
                event.data.IsSaved = true;
                event.data.OldValue = event.value;
                event.api.refreshCells({ force: true });
            }
        });
    } else {
        if (props.instanceName === "PropertyPane") {

            let value =
                event.value === "" &&
                    event?.data?.IsRequired &&
                    event?.data?.OldValue !== ""
                    ? event?.data?.OldValue
                    : event.value;
            event.data.OldValue = value;
            event.data.Value = value;
            event.value = value;
            let payload: any = {};
            let dataObj: any = {};
            if (props.propertyData?.rowData) {
                for (let index = 0; index < props.propertyData.rowData.length; index++) {
                    const element = props.propertyData.rowData[index];
                    if (index === 0 && element.RecID) {
                        dataObj["RecID"] = element.RecID;
                        dataObj["EntID"] = element.EntID;
                    }

                    dataObj[element._AP] = element.Value ? element.Value : null;
                }
            }
            if (dataObj && props?.tableName) {
                //Measurement
                for (const key in dataObj) {
                    if (dataObj.hasOwnProperty(key)) {
                        const value = dataObj[key];
                        console.log(`Key: ${key}, Value: ${value}`);
                        if (Measurement.includes(key.toLowerCase())) {
                            // let getMeasurement: string | null = getStorageItem('Measurement')
                            // if (getMeasurement && value) {
                            //     let realValue = convertToStore(getMeasurement, value, key);
                            //     dataObj[key] = realValue;
                            // }
                        }
                    }
                }
                payload = { [props.tableName]: [dataObj] };
            }


            if (payload && !props.isReadOnly) {
                alert('UpdateTableRecord api call')
                // await UpdateTableRecord(JSON.stringify(payload)).then((resp: iAPIResponse) => {
                //     if (checkIsSuccess(resp)) {
                //         if (props.instanceName == "PropertyPane") {
                //             event.data.IsSaved = true;
                //             event.data.OldValue = value;
                //             event.data.Value = value;
                //         }
                //         event.api.refreshCells({ force: true });
                //     }
                // });
            }
        } else if (props.containerName === "delegate_to_user" ) {
            var rowCount = event.api.getSelectedNodes();
            let selectedData: any = [];
            rowCount.forEach((item: any) => {
                if (item.data) {
                    selectedData.push(item.data);
                }
            });
            let value =
                event.value === "" &&
                    event?.data?.IsRequired &&
                    event?.data?.OldValue !== ""
                    ? event?.data?.OldValue
                    : event.value;
            if (event?.column?.colId === "StartDate" && event.value) {
                let todayDate: Date = new Date();
                let startDate: Date = new Date(event.value);
                let endDate: Date = new Date(event.data?.EndDate);
                if (startDate > endDate) {
                    event.data.StartDate = format(todayDate, "MM/dd/yyyy");
                    event.value = format(todayDate, "MM/dd/yyyy");
                    event.api.refreshCells({ force: true });
                } else {
                    props.apValueChange && props.apValueChange(value, event.data.EntID, event, selectedData);
                    event.value = value;
                    event.api.refreshCells({ force: true });
                }
            } else if (event?.column?.colId === "EndDate" && event.value) {
                let todayDate: Date = new Date();
                let startDate: Date = new Date(event.data?.StartDate);
                let endDate: Date = new Date(event.value);
                let lastYearDate: Date = new Date(
                    todayDate.getFullYear() + 1,
                    0,
                    0
                );
                if (endDate < startDate) {
                    event.data.EndDate = format(startDate, "MM/dd/yyyy");
                    event.value = format(startDate, "MM/dd/yyyy");
                    event.api.refreshCells({ force: true });
                } else if (endDate > lastYearDate) {
                    event.data.EndDate = format(startDate, "MM/dd/yyyy");
                    event.value = format(startDate, "MM/dd/yyyy");
                    event.api.refreshCells({ force: true });
                } else {
                    props.apValueChange && props.apValueChange(value, event.data.EntID, event, selectedData);
                    event.value = value;
                    event.api.refreshCells({ force: true });
                }
            } else {
                props.apValueChange &&   props.apValueChange(value, event.data.EntID, event, selectedData);
                event.value = value;
                event.api.refreshCells({ force: true });
            }
        } else {
            let value =
                event.value === "" &&
                    event?.data?.IsRequired &&
                    event?.data?.DefaultAPValue !== ""
                    ? event?.data?.DefaultAPValue
                    : event.value;
                    if(props.apValueChange){
                        props.apValueChange(value, event.data.EntID, event, 0, props.instanceName).then((resp: any) => {
                            if (resp) {
                                if (props.instanceName === "settings") {
                                    event.data.IsSaved = true;
                                }
                                event.data.Value = value;
                                event.data.OldValue = value;
                                event.api.refreshCells({ force: true });
                            }
                        }).catch((error: any) => {
                            event.data.Value = event.data.OldValue;
                            event.api.refreshCells({ force: true });
                        });
                    }else{
                        event.data.Value = value;
                        event.data.OldValue = value;
                        event.api.refreshCells({ force: true });
                    }
        }
    }
} else if (event.data.Value !== event.value && props.instanceName === "PropertyPaneForDci") {
    let value =
        event.value === "" &&
            event?.data?.IsRequired &&
            event?.data?.DefaultAPValue !== ""
            ? event?.data?.DefaultAPValue
            : event.value;
    props.apValueChange(value, event.data.EntID, event, 0, props.instanceName).then((resp: any) => {
        if (resp) {
            if (props.instanceName === "settings") {
                event.data.OldValue = value;
                event.data.Value = value;
                event.data.IsSaved = true;
            }
            event.api.refreshCells({ force: true });
        }
    }).catch((error: any) => {
        event.data.Value = event.data.OldValue;
        event.api.refreshCells({ force: true });
    });
}
return updateRowData;
};
// when pagination is changed
export const onPaginationChanged = (params: any, props: any, rowData: any) => {
    let updateRowData = null
    if (params?.api && params.newPage) {
        let last = params?.api?.paginationGetCurrentPage()
        let total = params?.api?.paginationGetTotalPages()
        let count = params?.api?.paginationGetCurrentPage()
        if (total === last + 1) {
            // Get the current page index (zero-based)
            const currentPageIndex = params.api.paginationGetCurrentPage();

            // Get the number of rows displayed per page
            const pageSize = params.api.paginationGetPageSize();

            // Calculate the start and end row indexes of the current page
            const startRow = currentPageIndex * pageSize;
            const endRow = startRow + pageSize;
            if (props.instanceName === "nz_forcensic_log") {
                let paylaod: any = props.apiPayloadForPangination
                paylaod.startRec = startRow + 1
                let orinalVal = paylaod.endRec
                paylaod.endRec = (((count + 1) * paylaod.endRec) >= Number(props.totalRecords)) ? props.totalRecords : endRow
                if ((count + 1 * orinalVal) <= Number(props.totalRecords)) {
                    updateRowData = makeApiCallForPagination(paylaod, props, rowData)
                }
            }
        }
    }
    if (props.instanceName === "nz_forcensic_log") {
        const paginationPanel = document.querySelector('.ag-paging-panel');
        if (paginationPanel) {
            let recordCountElement: any = paginationPanel.querySelector('.custom-record-count');
            if (!recordCountElement) {
                recordCountElement = document.createElement('span');
                recordCountElement.className = 'custom-record-count';
                paginationPanel.insertBefore(recordCountElement, paginationPanel.firstChild);
            }
            recordCountElement.innerText = `Total Records: ${props.totalRecords}`;
        }
    }
    return updateRowData
}
// when cell is clicked
export const handleMouseEvent = async (event: any, gridRef: any, props: any) => {
    console.log('props', props)
    props.handleMouseEvent(event, gridRef, props)
};
// when selection is changed
export const onSelectionChanged = (event: any, props: any, rowData: any) => {
    props.onSelectionChanged(event, props, rowData)
}
//Column resize
export const handleColumnResized = (params: any, props: any) => {

}
// custom logic for hide pagination and show dynamicaly base on data
export const hideShowPaginatation = (props: any) => {
    if (props?.dynamicPagination === true) {

        let div: any = null;
        let divCols: any = null;

        div = document.querySelector(".layout-pane.layout-pane-primary");
        if (props.instanceName === "reminder_grid") {
            div = document.querySelector('.nz-reminder-main-dev')
        }
        if (props.jsonPropertyGrid || props.instanceName === "reminder_grid") {
            divCols = document.querySelector('.nz-jsonPropertyGrid .ag-center-cols-clipper')
        } else {
            divCols = document.querySelector(
                ".layout-pane.layout-pane-primary .ag-center-cols-clipper"
            );
        }

        if (div) {
            let headerHeight: any = null;
            headerHeight = document.querySelector(".nz-form-title-bar");
            let headerRowHeight: any = document.querySelector(
                ".ag-header-container"
            );
            let pageDiv: any = null
            if (props.jsonPropertyGrid && props.allowPagination) {
                pageDiv = document.querySelector(".nz-jsonPropertyGrid .ag-paging-panel");
                let fqdiv: any = document.querySelector('.nz-feature-qa-container')
                let jsonGrid: any = document.querySelector('.nz-jsonPropertyGrid')
                let addGrid: any = document.querySelector('.nz-tableTopForm')
                let title: any = document.querySelector('.nz-grid-main-container-div .nz-form-title-bar')
                let populateGridTitle: any = document.querySelector('.nz-populet-nz-entity-grid-main .nz-form-title-bar ')
                let jsonGridHeight: number = 0
                let addGridHeight: number = addGrid?.offsetHeight ? addGrid?.offsetHeight : 0
                let titleHeight: number = title?.offsetHeight ? title?.offsetHeight : 0
                let titlePopulateHeight: number = populateGridTitle?.offsetHeight ? (populateGridTitle?.offsetHeight + 40) : 0
                jsonGridHeight = fqdiv?.offsetHeight - (addGridHeight + titleHeight + titlePopulateHeight);
                if (jsonGrid) {
                    jsonGrid.setAttribute("style", `height: ${jsonGridHeight > 100 ? jsonGridHeight : 100}px`);
                }
            } else {
                pageDiv = document.querySelector(".ag-paging-panel");
            }
            let height =
                headerHeight && headerRowHeight && pageDiv
                    ? headerHeight.offsetHeight +
                    headerRowHeight.offsetHeight +
                    pageDiv.offsetHeight +
                    props.dynamicheight
                    : props.dynamicheight;
            // 
            if (props.jsonPropertyGrid) {
                let addFrom: any = document.querySelector(
                    ".nz-tableTopForm"
                );
                if (addFrom) {
                    height = height + addFrom.offsetHeight
                    console.log('addFrom height', height)
                    console.log('addFrom.offsetHeight', addFrom.offsetHeight)
                }
            }
            let heightRow = div.offsetHeight - height;
            let divCount = heightRow / 30;
            if (pageDiv && divCols) {
                if (props.rowData.length < divCount) {
                    divCols.setAttribute("style", `height: ${props.rowData.length * 30}px`);
                    pageDiv.classList.add("nz-pagination-hide");
                    divCols.classList.remove("nz-heightClassForGrid");
                } else {
                    pageDiv.classList.remove("nz-pagination-hide");
                }
            }
        }
    }
};
// Copy data to clipboard
export const copyDisplayedColumnsData = (props: any, gridRef: any) => {
    debugger
    if (props.gridRef && props.gridRef.current && props.gridRef.current.api) {
        const displayedColumns =
            props.gridRef.current.api.getAllDisplayedColumns();
        const allRowNodes = props.gridRef.current.api.getModel().rowsToDisplay;
        if (!allRowNodes || allRowNodes.length === 0) {
            console.error("No rows to copy.");
            return;
        }

        // Loop through each selected row
        const dataToCopy = allRowNodes.map((node: any, index: number) => {
            const rowData: any = {};
            displayedColumns.forEach((column: any, colIndex: number) => {
                // console.log('props.gridRef.current.api. :', props.gridRef.current.api,node);
                const cellValue = props.gridRef.current.api.getValue(column, node);
                rowData[column.getColDef().headerName] = cellValue;
            });
            return rowData;
        });

        // Copy data to clipboard as JSON string
        const jsonData = JSON.stringify(dataToCopy, null, 2);

        // Copy data to clipboard
        fnCopyToClipboard(jsonData, props.exportFileName, props.isExportOnCopy);
    } else if (gridRef.current && gridRef.current.api) {
        console.log('gridRef.current', gridRef.current)
        const displayedColumns =
            gridRef.current.api.getAllDisplayedColumns();
        const allRowNodes = gridRef.current.api.getModel().rowsToDisplay;
        if (!allRowNodes || allRowNodes.length === 0) {
            console.error("No rows to copy.");
            return;
        }

        // Loop through each selected row
        const dataToCopy = allRowNodes.map((node: any) => {
            const rowData: any = {};
            displayedColumns.forEach((column: any) => {
                console.log('nodeallRowNodes', node, column)
                const cellValue = gridRef.current.api.getValue(column, node);
                rowData[column.getColDef().headerName] = cellValue;
            });
            return rowData;
        });

        // Copy data to clipboard as JSON string
        const jsonData = JSON.stringify(dataToCopy, null, 2);
        // Copy data to clipboard
        fnCopyToClipboard(jsonData, props.exportFileName, props.isExportOnCopy);
    }
};
// widwow resize the it will call
export const handleResize = (props: any) => {
    setTimeout(() => {
        let row: any = document.querySelector(
            ".nz-add-edit-row-dialog .MuiPaper-root"
        );
        if (row) {
            if (props.importGrid) {
                const data: any = document.querySelector(".nz-fqa-bar-grid");
                if (data) {
                    row.style.width = data.offsetWidth + "px";
                }
            } else {
                const data: any = document.querySelector(".nz-form-title-bar");
                if (data) {
                    row.style.width = data.offsetWidth + "px";
                }
            }
        }
    }, 100);
    const cell: any = props.className
        ? document.querySelector(`.${props.className} .ag-cell-popup-editing`)
        : document.querySelector(`.ag-cell-popup-editing`);
    const popupEditor: any = props.className
        ? document.querySelector(`.${props.className} .ag-popup-editor`)
        : document.querySelector(`.ag-popup-editor`);
    if (popupEditor) {
        popupEditor.style.width = cell.offsetWidth + "px";

    }
    hideShowPaginatation(props);
};
//set popup with of cell
export const setWidthPopup = (props: any) => {
    let spilterPrimary: any = "";
    if (props.importGrid) {
        spilterPrimary = document.querySelector(".nz-fqa-bar-grid");
    } else {
        spilterPrimary = document.querySelector(".nz-form-title-bar");
    }
    if (spilterPrimary) {
        let width = spilterPrimary.offsetWidth;
        let popup: any = document.querySelector(
            ".nz-add-edit-row-dialog .MuiPaper-root"
        );

        if (popup) {
            popup.style.width = width + "px";
        }
    }
};
// api call for pagination data.
const makeApiCallForPagination = async (payload: any, props: any, rowData: any) => {
    console.log('payload api call', payload, props, rowData)
    let updateRowData = null
    alert("Api call for Pagination")
    return updateRowData
}