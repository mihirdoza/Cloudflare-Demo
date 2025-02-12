
import React, { useEffect, useRef, useState } from 'react'
import { IrightMouseMenu } from '../../Interfaces/IrightMouseMenu';
import { feature_data } from '../../SampleDataset/Featuredata'; // remove
import { fnBinDispose, fnBinMoveToDisposable, fnBinMoveToUnused, fnCharts, fnDeviceImportBin, fnDiscoverable, fnFloorDevice, fnHasChildren, fnHasNetworkPort, fnHasPowerPort, fnMapPort, fnMigrationEnabled, fnMonitorable, fnNetworkCableImportBin, fnPasteSource, fnPortAvailable, fnPortConnected, fnPortMapNeeded, fnPortNormal, fnPortNormalAllowed, fnPowerCableImportBin, fnRUAvailable, fnSelectedCell, fnSlotAvailable, fnSwapMountedDevice, IsAdminNZSessionNode, IsAdminNZTaskNode, IsAdminNZWinSVCNode, IsSelectedAuditSessionApprove, IsSelectedAuditSessionClose, IsSelectedAuditSessionDelete, IsSelectedAuditSessionOpen, IsSelectedAuditSessionReject, IsSelectedAuditSessionSnapshot } from './menuFunction';
import { FEnums, RightMouseMenuRange } from '../../Interfaces/Defaults';
import { fnGetKebabMenu } from '../../SampleDataset/fnGetKebabMenu'; // remove
import { fnGetFilePath } from '../../Common/fnGetFilePath'
import { fnUpdateFeatureLabelFromSession } from '../../Common/fnUpdateFeatureLabelFromSession';
import BaseRightMouseMenu from './BaseRightMouseMenu/BaseRightMouseMenu';

const RightMouseMenu = (menuProps: IrightMouseMenu) => {
    const [menuData, setMenuData] = useState<any>();
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [selectedNodeData, setSelectedNodeData] = useState<any>();
    const [showKebabIcon, setShowKebabIcon] = useState<boolean>(false)

    const handleClick = (event: React.MouseEvent<HTMLImageElement>, actionCode: string) => {
        let rightMouseMenuList: any = [];
        if (menuProps.container === "entity_mfg_eqtype_tree") {
            let menu = [{ Label: "Create", Tooltip: "Create New Entity" }];
            rightMouseMenuList = menu
        } else if (menuProps.container === "gemini_info") {
            if (menuProps.searchedDeviceData.length > 0) {
                let menuList: any = [];
                let index: number = menuProps.searchedDeviceData.length;
                menuProps.searchedDeviceData.forEach((item: string) => {
                    if (item) {
                        menuList.push({ Label: `Page-${index}`, iconName: 'GoogleIcon_128x128.svg', result: item });
                    }
                    index--;
                })
                rightMouseMenuList = menuList
            }
        } else if (menuProps.container === "helpTip") {
            let menu: any = []
            menuProps.menuData.forEach((item: any, index: any) => {
                if (selectedItem && selectedItem.Label) {
                    menu.push({ Label: item.Label, selected: selectedItem && selectedItem.Label === item.Label ? true : false, mdString: item.mdString })
                } else {
                    menu.push({ Label: item.Label, selected: index === 0 ? true : false, mdString: item.mdString })
                }
            })

            rightMouseMenuList = menu
        } else if (menuProps.container === "dashboard_chart") {
            let menu = [{ Label: "Show Data", Tooltip: "Show Chart Data" }];
            rightMouseMenuList = menu
        }
        else if (menuProps.container === "cabling_componet_deviceA" || menuProps.container === "cabling_componet_cableB" || menuProps.container === "cabling_componet_deviceC" || menuProps.container === "mapping_FrontA" || menuProps.container === "mapping_FrontB") {

            let menu: any = [];
            if (feature_data) {
                if (selectedNodeData && selectedNodeData.node) {
                    let feature: any = null
                    menu = getRightMouseMenuForCablingGridRow(feature);

                }
                console.log('menu', menu)

                if (menu?.length > 0) {
                    //remove duplicate recodes
                    const unique: any = [];
                    const uniqueMenu = menu.filter((element: any) => {
                        const isDuplicate = unique.includes(element.Label);

                        if (!isDuplicate) {
                            unique.push(element.Label);
                            return true;
                        }
                        return false;
                    });
                    rightMouseMenuList = uniqueMenu
                }
                else {
                    rightMouseMenuList = []
                }
            }
        }
        else if (menuProps.container === "search_keyword") {
            let selectedMenu = selectedItem && selectedItem.Label ? selectedItem.Label : "AND"
            let menu = [{ Label: "AND", Tooltip: "AND", isCheckbox: true, checked: selectedMenu === "AND" ? true : false }, { Label: "OR", Tooltip: "OR", isCheckbox: true, checked: selectedMenu === "OR" ? true : false }];
            rightMouseMenuList = menu
        } else if (menuProps.container === "homeicon") {
            // let menu = [{ Label: defaultPageEnums.GoogleMap, Tooltip: defaultPageEnums.GoogleMap, icon: "GoggleMap_128x128.svg" }, { Label: defaultPageEnums.Dashbord, Tooltip: defaultPageEnums.Dashbord, icon: "Dashboard_128x128.svg" }, { Label: defaultPageEnums.LastSite, Tooltip: defaultPageEnums.LastSite, icon: "LastSite_128x128.svg" }];
            let featureData = feature_data?.filter((item: any) => {
                return item.MenuID === FEnums.Home && item._Feature > RightMouseMenuRange.MIN
            });
            featureData = fnUpdateFeatureLabelFromSession(featureData);
            rightMouseMenuList = featureData
        }
        else if (menuProps.container === "data_grid" && menuProps.selectedRow) {
            // dispatch({
            //     type: "RT_MOUSE_ACTION_GRID",
            //     data: null
            // });
            rightMouseMenuList = []
        }
        else if (menuProps.container === "background_tasks" && menuProps.featureId === FEnums.BackgroundTasks && feature_data && menuProps.selectedRow) {
            let featureData = feature_data?.filter((item: any) => {
                return item.MenuID === menuProps.featureId && (item?.NodeType?.includes(menuProps?.selectedRow?.NodeType) || item.NodeType === '')
            })
            rightMouseMenuList = featureData

        }
        else if (menuProps.container === "open_session" && menuProps.featureId === FEnums.BackgroundTasks && feature_data && menuProps.selectedRow) {
            console.log('menuProps?.selectedRow', menuProps?.selectedRow)
            let featureData = feature_data?.filter((item: any) => {
                return item.MenuID === menuProps.featureId && (item?.NodeType?.includes(menuProps?.selectedRow?.NodeType) || item.NodeType === '')
            })
            rightMouseMenuList = featureData
        }
        else if (menuProps.container === "background_window_service" && menuProps.featureId === FEnums.BackgroundTasks && feature_data && menuProps.selectedRow) {
            let featureData = feature_data?.filter((item: any) => {
                return item.MenuID === menuProps.featureId && (item?.NodeType?.includes(menuProps?.selectedRow?.NodeType) || item.NodeType === '')
            })
            rightMouseMenuList = featureData
        }
        else if (menuProps.container === "datacenter_hierarchy_treeview" || menuProps.container === "inventory_hierarchy_treeview" || menuProps.container === "dci_left_tree") {
            if (feature_data && selectedNodeData) {
                if (selectedNodeData && selectedNodeData.node) {

                    let menuData = getExplorerMenuData(selectedNodeData.node.NodeEntID);
                    if (menuData?.length > 0) {
                        //remove duplicate recodes
                        const unique: any = [];
                        const uniqueMenu = menuData.filter((element: any) => {
                            const isDuplicate = unique.includes(element.Label);

                            if (!isDuplicate) {
                                unique.push(element.Label);
                                return true;
                            }
                            return false;
                        });
                        rightMouseMenuList = uniqueMenu
                    }
                    else {
                        rightMouseMenuList = []

                    }
                }
            }
        }
        else if (menuProps.container === "explorer_tree") {
            let menu: any = [];
            if (feature_data) {
                if (selectedNodeData && selectedNodeData.node) {
                    menu = getExplorerMenuData();
                }
                if (menu?.length > 0) {
                    const unique: any = [];
                    const uniqueMenu = menu.filter((element: any) => {
                        const isDuplicate = unique.includes(element.Label);

                        if (!isDuplicate) {
                            unique.push(element.Label);
                            return true;
                        }
                        return false;
                    });
                    rightMouseMenuList = uniqueMenu
                }
                else {
                    rightMouseMenuList = []
                }
            }
            else {
                // api call for get get featuers data.

                // getFeatures(false, "").then((resp: any) => {
                //     if (checkIsSuccess(resp) && resp.data && resp.data.jsonString) {
                //         let featureData = JSON.parse(resp.data.jsonString);
                //         if (featureData && featureData.Features?.length > 0) {
                //             var filteredData = featureData.Features.filter((item: any) => { return item.MenuID === menuProps.featureId  && item._Feature > RightMouseMenuRange.MIN });
                //             if (filteredData?.length > 0) {

                //                 setRightMenus([...filteredData]);
                //                 setAnchorEl(event.target as HTMLImageElement);
                //             }
                //             else {
                //                 setRightMenus([]);

                //             }
                //         }
                //         else {

                //         }

                //     }
                // })
            }
        }
        else {

            //API will be called 
            // if (feature_data) {
            //     var filteredData = feature_data.filter((item: any) => { return item.MenuID === menuProps.featureId  && item._Feature > RightMouseMenuRange.MIN });
            //     if (filteredData?.length > 0) {
            //     //   rightMouseMenuList =filteredData
            //         setAnchorEl(event.target as HTMLImageElement);
            //     }
            //     else {
            //       rightMouseMenuList =[]
            //     }
            // }
            // else {
            //api call for featuer data.
            // getFeatures(false, "").then((resp: any) => {
            //     if (checkIsSuccess(resp) && resp.data && resp.data.jsonString) {

            //         let featureData = JSON.parse(resp.data.jsonString);
            //         if (featureData && featureData.Features?.length > 0) {
            //             var filteredData = featureData.Features.filter((item: any) => { return item.MenuID === menuProps.featureId  && item._Feature > RightMouseMenuRange.MIN });
            //             if (filteredData?.length > 0) {

            //                 setRightMenus([...filteredData]);
            //                 setAnchorEl(event.target as HTMLImageElement);
            //             }
            //             else {
            //                 setRightMenus([]);

            //             }
            //         }
            //         else {

            //         }
            //     }
            // })
            // }
        }
        setMenuData(rightMouseMenuList);
    }
    const getRightMouseMenuForCablingGridRow = (featureId: any) => {
        let menu: any = [];
        feature_data.forEach((item: any) => {
            if ((item.MenuID === featureId || featureId === null) && item._Feature > RightMouseMenuRange.MIN && item.Label !== "") {
                if (item.NodeType.includes('fnPortNormalAllowed')) {
                    if (fnPortNormalAllowed(selectedNodeData, menuProps)) {
                        menu.push(item)
                    }
                } else if (item.NodeType.includes('fnPortNormal')) {
                    if (fnPortNormal(selectedNodeData, menuProps)) {
                        menu.push(item)
                    }
                } else if (item.NodeType.includes("fnPortConnected")) {
                    if (fnPortConnected(selectedNodeData, menuProps)) {
                        menu.push(item)
                    }
                } else if (item.NodeType.includes("fnSelectedCell")) {
                    if (fnSelectedCell(selectedNodeData, menuProps)) {
                        menu.push(item)
                    }
                }

            }
            return;
        });
        return menu;
    }
    const handleSelect = (selectedRightMouseMenu: any) => {
        setSelectedItem(selectedRightMouseMenu)
        menuProps.handleSelect(selectedRightMouseMenu   )
    }
    const getExplorerMenuData = (featureId: string | null = null) => {
        let menu: any = [];
        console.log('featureId', featureId)
        let fnChildrenDisplayOrderToggleStatus = selectedNodeData && selectedNodeData?.node && selectedNodeData.node.DisplayOrder
        feature_data.forEach((item: any) => {
            if (item.MenuID === (featureId ? featureId : menuProps.featureId) && item._Feature > RightMouseMenuRange.MIN && item.Label !== "") {
                if (item.NodeType === "") {
                    menu.push(item)
                } else {
                    if (item.NodeType.includes("fnHasChildren")) {
                        if (fnHasChildren(selectedNodeData?.node?.HasChildren)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnDisplayOrder")) {
                        if (fnDisplayOrder(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes("fnHasNetworkPort")) {
                        if (fnHasNetworkPort(selectedNodeData?.node?.HasNetworkPorts)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnHasPowerPort")) {
                        if (fnHasPowerPort(selectedNodeData?.node?.HasPowerPorts)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnChildrenDisplayOrderToggle")) {


                        if (selectedNodeData?.node?.HasChildren > 1) {
                            if (!fnChildrenDisplayOrderToggleStatus) {
                                menu.push(item)
                            }
                        }
                        fnChildrenDisplayOrderToggleStatus = fnChildrenDisplayOrderToggleStatus === 1 ? 0 : 1
                    } else if (item.NodeType.includes("fnPortConnected")) {
                        if (fnPortConnected(selectedNodeData, menuProps)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnPortMapNeeded")) {
                        if (fnPortMapNeeded(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnPasteSource")) {
                        if (fnPasteSource(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnMonitorable")) {
                        if (fnMonitorable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnDiscoverable")) {
                        if (fnDiscoverable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnDeviceImportBin")) {
                        if (fnDeviceImportBin(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnNetworkCableImportBin")) {
                        if (fnNetworkCableImportBin(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnPowerCableImportBin")) {
                        if (fnPowerCableImportBin(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnSlotAvailable')) {
                        if (fnSlotAvailable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnBinMoveToUnused')) {
                        if (fnBinMoveToUnused(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnBinMoveToDisposable')) {
                        if (fnBinMoveToDisposable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnBinDispose')) {
                        if (fnBinDispose(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnSwapMountedDevice')) {
                        if (fnSwapMountedDevice(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnRUAvailable')) {
                        if (fnRUAvailable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnPortAvailable')) {
                        if (fnPortAvailable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnFloorDevice')) {
                        if (fnFloorDevice(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionApprove')) {
                        if (IsSelectedAuditSessionApprove(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionReject')) {
                        if (IsSelectedAuditSessionReject(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionOpen')) {
                        if (IsSelectedAuditSessionOpen(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionClose')) {
                        if (IsSelectedAuditSessionClose(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionSnapshot')) {
                        if (IsSelectedAuditSessionSnapshot(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionDelete')) {
                        if (IsSelectedAuditSessionDelete(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZTaskNode')) {
                        if (IsAdminNZTaskNode(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZSessionNode')) {
                        if (IsAdminNZSessionNode(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZWinSVCNode')) {
                        if (IsAdminNZWinSVCNode(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnMapPort')) {
                        if (fnMapPort(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnMigrationEnabled')) {
                        if (fnMigrationEnabled(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnCharts')) {
                        if (fnCharts(selectedNodeData.node, item.NodeType)) {
                            menu.push(item)
                        }
                    }

                    else {
                        let nodeTypeArray = item.NodeType.split(";");
                        nodeTypeArray = nodeTypeArray.map((el: any) => {
                            return el.trim();
                        });

                        if (selectedNodeData?.node?.NodeType) {

                            nodeTypeArray.forEach((element: any) => {
                                if (element.toLowerCase() === selectedNodeData?.node?.NodeType.toLowerCase()) {
                                    menu.push(item)
                                }
                            })
                        }

                    }
                }

            }
        });
        if (menu?.length > 0) {
            setShowKebabIcon(true);
        }
        else {
            setShowKebabIcon(false);
        }
        return menu;
    }
    const getExplorerMenuDataRef = useRef(getExplorerMenuData)

    ///////////////////////////////////////////////////////////////////////////////////////
    // function work flow
    //     fnDisplayOrder()
    //     {
    // 	If ExplorerNode.DisplayOrder === 0
    //         then
    //         {
    //             ExplorerNode.DisplayOrder = !ExplorerNode.DisplayOrder
    //             return true
    //         }
    // else
    // {
    //     ExplorerNode.DisplayOrder = !ExplorerNode.DisplayOrder
    //     return false
    // }
    // }
    ///////////////////////////////////////////////////////////////////////////////////////

    const fnDisplayOrder = (selectednode: any) => {
        let data: any = selectednode
        if (selectednode?.node?.DisplayOrder === 1) {
            data = { node: { ...selectednode.node, DisplayOrder: !selectednode?.node?.DisplayOrder } }
            setSelectedNodeData(data)
            return true
        }
        else {
            data = { node: { ...selectednode.node, DisplayOrder: !selectednode?.node?.DisplayOrder } }
            setSelectedNodeData(data)
            return false

        }
    }
    const getRightMouseMenuForGridRow = (selectedRow: any) => {
        let menu: any = [];
        feature_data.forEach((item: any) => {
            if (item.MenuID === menuProps.featureId && item._Feature > RightMouseMenuRange.MIN && item.Label !== "") {

                if (item.NodeType === "") {
                    menu.push(item)
                } else {
                    if (item.NodeType.includes('IsAdminNZTaskNode')) {
                        if (IsAdminNZTaskNode(selectedRow)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZSessionNode')) {
                        if (IsAdminNZSessionNode(selectedRow)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZWinSVCNode')) {
                        if (IsAdminNZWinSVCNode(selectedRow)) {
                            menu.push(item)
                        }
                    }
                    else {
                        let nodeTypeArray = item.NodeType.split(";");
                        nodeTypeArray = nodeTypeArray.map((el: any) => {
                            return el.trim();
                        });

                        if (selectedRow?.NodeType) {

                            nodeTypeArray.forEach((element: any) => {
                                if (element.toLowerCase() === selectedRow?.NodeType.toLowerCase()) {
                                    menu.push(item)
                                }
                            })
                        }

                    }
                }

            }
        });
        return menu;
    }
    const getRightMouseMenuForGridRowRef = useRef(getRightMouseMenuForGridRow)
    useEffect(() => {
        if (menuProps.selectedNode) {
            setSelectedNodeData({ node: menuProps.selectedNode });
        }
        else if (menuProps.selectedRow) {
            let menuItems: any = getRightMouseMenuForGridRowRef.current(menuProps.selectedRow);
            if (menuItems?.length > 0) {
                if (menuProps.selectedRow && (menuProps.container === "cabling_componet_deviceA" || menuProps.container === "cabling_componet_cableB" || menuProps.container === "cabling_componet_deviceC" || menuProps.container === "mapping_FrontA" || menuProps.container === "mapping_FrontB")) {
                    setShowKebabIcon(true);
                    setSelectedNodeData({ node: menuProps.selectedRow })

                } else {
                    setShowKebabIcon(true);
                    setMenuData(menuProps);
                }
            }
            else {
                setShowKebabIcon(true);
            }
        }

    }, [menuProps.selectedNode, menuProps?.selectedRow?.NodeType, getRightMouseMenuForGridRowRef, menuProps])
    useEffect(() => {
        if (menuProps.container === "entity_mfg_eqtype_tree") {
            if (selectedNodeData && selectedNodeData.node && selectedNodeData.node.NodeType?.toLowerCase() === "hwentity") {
                setShowKebabIcon(false);
            }
            else {
                setShowKebabIcon(true);
            }
        } else if (menuProps.container === "dashboard_chart") {
            setShowKebabIcon(true);
        } else if (menuProps.container === "datacenter_hierarchy_treeview"
            || menuProps.container === "inventory_hierarchy_treeview"
            || menuProps.container === "dci_left_tree") {
            if (feature_data && menuProps.selectedNode) {
                if (selectedNodeData && selectedNodeData.node) {
                    let menuData = getExplorerMenuDataRef.current(menuProps.selectedNode.node.NodeEntID);
                    if (menuData?.length > 0) {
                        setShowKebabIcon(true);
                    }
                    else {
                        setShowKebabIcon(false);
                    }
                }
            }
        }
        else if (menuProps.container === "fqa_property_tab") {
            
            if (selectedNodeData && selectedNodeData.node) {
                setSelectedItem(null)
                //put static data for property pane
                setMenuData([...fnGetKebabMenu]);
                setShowKebabIcon(true)
                // fnGetKebabMenu(nodeName, selectedNodeData.node.NodeType).then((resp: any) => {
                //     if (checkIsSuccess(resp)) {
                //         if (resp.data && resp.data.kebabJson?.length > 0) {
                //             let kebabData = JSON.parse(resp.data.kebabJson);
                //             let menuList: any = typeof kebabData == "object" && Object.keys(kebabData)?.length > 0 ? Object.values(kebabData)[0] : [];
                //             setRightMenus([...menuList]);
                //             setShowKebabIcon(true);
                //         }
                //         else {
                //             setShowKebabIcon(false);
                //         }
                //     }
                //     else {
                //         setShowKebabIcon(false);
                //     }
                // })
            }
            else {
                setShowKebabIcon(false);
            }
        } else if (menuProps.container === "gemini_info") {
            if (menuProps.searchedDeviceData.length > 0) {
                setShowKebabIcon(true);
            }
        }
        else {
            setShowKebabIcon(true);
        }

    }, [selectedNodeData, getExplorerMenuDataRef, menuProps])
    return (
        <div key={menuProps.uniqueName}>
             <BaseRightMouseMenu
                imageObject={{
                    image: {
                        uniqueName: "Kebabimage",
                        source: fnGetFilePath("Kebab_128x128.svg", "misc"),
                        type: "svg",
                        w: "20px",
                        h: "20px",
                        tooltip: "Clear"
                    },
                    handleMouse(event, actionCode) {
                    },
                    uniqueName: "Kebab",
                    w: "20px",
                    h: "20px",
                    actionCode: "RightMouseMenu",
                }}
                uniqueName={menuProps.uniqueName}
                menuData={menuData}
                handleClick={handleClick}
                showIcon={showKebabIcon}
                handleSelect={handleSelect} />
        </div>
    )
}
export default RightMouseMenu