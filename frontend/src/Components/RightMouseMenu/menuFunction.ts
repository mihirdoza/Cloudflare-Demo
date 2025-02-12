
import { fnGetImmediateParentTreeInfoUsingDiv } from "../../Common/fnGetImmediateParentTreeInfoUsingDiv"
import { fnGetSessionVariableFromStorage } from "../../Common/fnGetSessionVariableFromStorage"
import { ChartEntityNameArr } from "../../Interfaces/Defaults"

export const fnHasChildren = (hasChildren: any) => {
    if (hasChildren === 1)
        return true
    else
        return false
}
//////////////////////////////////////////////////////////////////////////
// fnHasChildren()
// {
// If ExplorerNode.HasChildren === 1 then return true else return false
// }
//////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// fnHasPowerPort()
// {
// If ExplorerNode.HasPowerPort > 0 then return true else return false
// }
///////////////////////////////////////////////////////////////////////
export const fnHasPowerPort = (hasPowerPort: any) => {
    if (hasPowerPort > 0)
        return true
    else
        return false
}
///////////////////////////////////////////////////////////////////////////////////
// fnHasNetworkPort()
// {
// If ExplorerNode.HasNetworkPort > 0 then return true else return false
// }
///////////////////////////////////////////////////////////////////////////////////

export const fnHasNetworkPort = (HasNetworkPort: any) => {
    if (HasNetworkPort > 0)
        return true
    else
        return false
}

export const fnPowerBI = (selected_node: any) => {
    return true
}

export const fnFloorDevice = (selectednode: any) => {
    let ParentNode = fnGetImmediateParentTreeInfoUsingDiv(selectednode.node)
    if (ParentNode &&( ParentNode?.NodeType === "Floor" || ParentNode?.NodeType === "Location")) {
        return true
    }
    else {
        return false
    }
}
/////////////////////////////////////////////////////////////////////////////
//We are returning NodeType = RU and PortStatus: MountedFilled
//fnRUNormalAllowed - PortStatus <> MountedFilled AND (PortStatus <> Normal)
//fnRUNormal: PortStatus is Normal

// Offer Normal RU – fnRUNormalAllowed 
// Offer BAD, Reserved, Block – fnRUNormal
/////////////////////////////////////////////////////////////////////////////
export const fnRUNormalAllowed = (selectednode: any) => {
    if ((selectednode?.node?.NodeType === "RU") &&
        (selectednode?.node?.PortStatus?.toLowerCase() !== "filled" && (selectednode?.node?.PortStatus !== null && selectednode?.node?.PortStatus?.toLowerCase() !== "normal"))) {
        return true
    } else {
        return false
    }
}
export const fnRUNormal = (selectednode: any) => {
    if ((selectednode?.node?.NodeType === "RU") &&
        (selectednode?.node?.PortStatus === null || selectednode?.node?.PortStatus?.toLowerCase() === "normal")) {
        return true
    } else {
        return false
    }
}
////////////////////////////////////////////////////////////////////////////////////////////
// We are returning NodeType = Slot and PortStatus = Filled

// fnSlotNormalAllowed - PortStatus <> Filled AND(PortStatus <> Normal)
// fnSlotNormal: PortStatus is Normal
// Offer Normal RU – fnSlotNormalAllowed
// Offer BAD, Reserved, Block – fnSlotNormal
////////////////////////////////////////////////////////////////////////////////////////////

export const fnSlotNormalAllowed = (selectednode: any) => {
    if ((selectednode?.node?.NodeType === "Slot" || selectednode?.node?.NodeType === "wide slot") &&
        (selectednode?.node?.PortStatus?.toLowerCase() !== "filled"
            && (selectednode?.node?.PortStatus !== null && selectednode?.node?.PortStatus?.toLowerCase() !== "normal"))) {
        return true
    } else {
        return false
    }

}
export const fnSlotNormal = (selectednode: any) => {
    if ((selectednode?.node?.NodeType === "Slot" || selectednode?.node?.NodeType === "wide slot") &&
        (selectednode?.node?.PortStatus === null || selectednode?.node?.PortStatus?.toLowerCase() === "normal")) {
        return true
    } else {
        return false
    }
}
//////////////////////////////////////////////////////////////////////////////////////////
// for Port
// fnPortNormalAllowed - PortStatus <> Cabled AND(PortStatus <> Normal)
// fnPortNormal: PortStatus is Normal
// fnPortCabled - PortStatus <> Cabled

// Offer Normal RU – fnPortNormalAllowed 
// Offer BAD, Reserved, Block – fnPortNormal

// Offer Disconnect cable, Disconnect Port: fnPortCabled
/////////////////////////////////////////////////////////////////////////////////////////////
export const fnPortNormalAllowed = (selectednode: any, props: any) => {
    console.log('selectednode fnPortNormalAllowed', selectednode)
    if ((selectednode?.node?.NodeType === "Port"
        || (props.container === "cabling_componet_deviceA" && selectednode?.node?.FromDevicePortNodeType === "DevicePortNode")
        || (props.container === "mapping_FrontA" && selectednode?.node?.NodeType === "DevicePortNode")
        || (props.container === "mapping_FrontB" && selectednode?.node?.NodeType === "DevicePortNode")
        || (props.container === "cabling_componet_cableB" && selectednode?.node?.PortBNodeType === "CablePortNode")
        || (props.container === "cabling_componet_deviceC" && (selectednode?.node?.ToDevicePortNodeType === "DevicePortNode" || selectednode.node.NodeType === "DevicePortNode"))
    ) &&
        (selectednode?.node?.PortStatus?.toLowerCase() !== "cabled"
            || selectednode?.node?.FromDevicePortStatus?.toLowerCase() !== "cabled"
            || selectednode?.node?.PortBStatus?.toLowerCase() !== "cabled"
            || selectednode?.node?.ToDevicePortStatus?.toLowerCase() !== "cabled"
            || selectednode?.node?.MappedPortsA?.toLowerCase() !== "cabled"
        )
        && ((selectednode?.node?.PortStatus !== null || selectednode?.node?.MappedPortsA !== null || selectednode?.node?.FromDevicePortStatus !== null || selectednode?.node?.PortBStatus !== null || (selectednode?.node?.ToDevicePortStatus !== null || selectednode.node.NodeType !== null))
            && (selectednode?.node?.PortStatus?.toLowerCase() !== "normal"
            || selectednode?.node?.FromDevicePortStatus?.toLowerCase() !== "normal"
            || selectednode?.node?.PortBStatus?.toLowerCase() !== "normal"
            || selectednode?.node?.ToDevicePortStatus?.toLowerCase() !== "normal"
            || selectednode?.node?.MappedPortsA?.toLowerCase() !== "normal")
        )) {
        return true
    } else {
        return false
    }

}
export const fnPortNormal = (selectednode: any, props: any) => {
    if ((selectednode?.node?.NodeType === "Port"
        || (props.container === "cabling_componet_deviceA" && selectednode?.node?.FromDevicePortNodeType === "DevicePortNode")
        || (props.container === "mapping_FrontA" && selectednode?.node?.NodeType === "DevicePortNode")
        || (props.container === "mapping_FrontA" && selectednode?.node?.NodeType === "CablePortNode")
        || (props.container === "mapping_FrontB" && selectednode?.node?.NodeType === "DevicePortNode")
        || (props.container === "mapping_FrontB" && selectednode?.node?.NodeType === "CablePortNode")
        || (props.container === "cabling_componet_cableB" && selectednode?.node?.PortBNodeType === "CablePortNode")
        || (props.container === "cabling_componet_deviceC" && (selectednode?.node?.ToDevicePortNodeType === "DevicePortNode" || selectednode.node.NodeType === "DevicePortNode"))

    ) &&
        ((selectednode?.node?.PortStatus === null || selectednode?.node?.MappedPortsA === null || selectednode?.node?.FromDevicePortStatus === null || selectednode?.node?.PortBStatus === null || (selectednode?.node?.ToDevicePortStatus === null || selectednode.node.NodeType === null)) ||
            (selectednode?.node?.PortStatus?.toLowerCase() === "normal"
                || selectednode?.node?.FromDevicePortStatus === "normal"
                || selectednode?.node?.PortBStatus?.toLowerCase() === "normal"
                || selectednode?.node?.ToDevicePortStatus?.toLowerCase() === "normal"
                || selectednode?.node?.MappedPortsA?.toLowerCase() === "normal"
            ))) {
        return true
    } else {
        return false
    }

}
export const fnPortCabled = (selectednode: any) => {
    if (selectednode?.node?.NodeType === "Port" && selectednode?.node?.PortStatus?.toLowerCase() !== "Cabled") {
        return true
    } else {
        return false
    }
}

////////////////////////////////////////////////////////////////////////////
// fnPortConnected()
// {
// If ExplorerNode.PortStatus<> ”Cabled” then return true else return false
// }
/////////////////////////////////////////////////////////////////////////////
export const fnPortConnected = (selectednode: any, props: any) => {
    let status = ['normal', 'block', 'reserve', 'bad']
    if (props.container === "cabling_componet_deviceA" || props.container === "cabling_componet_cableB" || props.container === "cabling_componet_deviceC" || props.container === "mapping_FrontA" || props.container === "mapping_FrontB") {
        if ((selectednode?.node?.FromDevicePortNodeType === "DevicePortNode" && (selectednode?.node?.FromDevicePortStatus !== null && !status.includes(selectednode?.node?.FromDevicePortStatus?.toLowerCase())))
            || (selectednode?.node?.PortBNodeType === "CablePortNode" && (selectednode?.node?.PortBStatus !== null && !status.includes(selectednode?.node?.PortBStatus?.toLowerCase())))
            || (selectednode?.node?.NodeType === "CablePortNode" && (selectednode?.node?.MappedPortsA !== null && !status.includes(selectednode?.node?.MappedPortsA?.toLowerCase())))
            || (selectednode?.node?.NodeType === "DevicePortNode" && (selectednode?.node?.ToDevicePortStatus !== null && !status.includes(selectednode?.node?.ToDevicePortStatus?.toLowerCase())))
            || (selectednode?.node?.ToDevicePortNodeType === "DevicePortNode" && ((selectednode?.node?.ToDevicePortStatus !== null || selectednode.node.NodeType !== null) && !status.includes(selectednode?.node?.ToDevicePortStatus?.toLowerCase())))) {
            return true
        } else {
            return false
        }


    } else {

        if (selectednode?.node?.NodeType === "Port" && selectednode.node.PortStatus?.toLowerCase() === "cabled") {
            return true
        } else {
            return false
        }

    }

}

export const fnSelectedCell = (selectednode: any, props: any) => {
    if (props.container === "cabling_componet_deviceA" || props.container === "cabling_componet_cableB" || props.container === "cabling_componet_deviceC" || props.container === "mapping_FrontA" || props.container === "mapping_FrontB") {
        return true
    } else {
        return false
    }
}
/////////////////////////////////////////////////////////////////////////
// fnDiscoverable
// {
// If ExplorerNode.NodeType ===”Device” then return true else return false
// }
/////////////////////////////////////////////////////////////////////////
export const fnDiscoverable = (selectednode: any) => {
    if (selectednode.node.NodeType === "Device") {
        return true
    } else { return false }
}
///////////////////////////////////////////////////////////////////////////////////
// fnMonitorable
// {
// If ExplorerNode.NodeType ===”Device” then return true else return false
// }
///////////////////////////////////////////////////////////////////////////////////
export const fnMonitorable = (selectednode: any) => {
    if (selectednode.node.NodeType === "Device") {
        return true
    } else { return false }
}
////////////////////////////////////////////////////////////////////////////////
// fnPortMapNeeded()
// {
// If ExplorerNode.EntityName ===”_PatchPanel” then return true else return false
// }
////////////////////////////////////////////////////////////////////////////////

export const fnPortMapNeeded = (selectednode: any) => {
    if (selectednode?.node?.NodeEntityname === "_PatchPanel") {
        return true
    } else {
        return false
    }
}
////////////////////////////////////////////////////////////////////////////////////
// fnPasteSource;//defined in NZPG.Session.pasteSource  in Session table
// {
//     If(Explorer.Node.NodeType
//         in (Floor; SubFloor; Ceiling; Wall; Location) OR fnSlotAvailable) AND(NZPG.Session.pasteSource<> ””) then return true else return false
// }
////////////////////////////////////////////////////////////////////////////////////
export const fnPasteSource = (selectednode: any) => {
    let sessionData: any = sessionStorage.getItem("session_variables")
    sessionData = JSON.parse(sessionData)
    let PasteSource: any = sessionData.filter((item: any) => {
        return item.VariableName === "PasteSource" ? item : null
    })
    PasteSource = PasteSource[0]

    if ((((selectednode.node.NodeType === "Floor" ||
        selectednode.node.NodeType === "SubFloor" ||
        selectednode.node.NodeType === "Ceiling" ||
        selectednode.node.NodeType === "Wall" ||
        selectednode.node.NodeType === "Location")) ||
        fnSlotAvailable(selectednode)) &&
        PasteSource.SessionValue !== "") {
        return true
    } else {
        return false
    }
}
//////////////////////////////////////////////////////////////////////////////
//     fnDeviceImportBin()
//     {
//         If((ExplorerNode.NodeType ===”Bin”) AND
//             (ExplorerNode.Name =”New” OR  ExplorerNode.Name =”Other”))
//  then return true else return false
//     }
/////////////////////////////////////////////////////////////////////////////////////
export const fnDeviceImportBin = (selectednode: any) => {
    if ((selectednode.node.NodeType === "Bin") && (selectednode?.node?.Name === "New" || selectednode?.node?.Name === "Other")) {
        return true
    } else {
        return false
    }
}
///////////////////////////////////////////////////////////////////////////////////////
// fnPowerCableImportBin()
// {
//     If((ExplorerNode.NodeType ===”Bin”) AND
//         (ExplorerNode.Name =”Network Cables” OR ExplorerNode.Name =”Power Cables”))
//  then return true else return false
// }

///////////////////////////////////////////////////////////////////////////////////////
export const fnPowerCableImportBin = (selectednode: any) => {
    if ((selectednode.node.NodeType === "Bin") && selectednode?.node?.Name === "Power Cables") {
        return true
    } else {
        return false
    }
}
///////////////////////////////////////////////////////////////////////////////////////

// fnNetworkCableImportBin()
// {
//     If((ExplorerNode.NodeType ===”Bin”) AND
//         (ExplorerNode.Name =”Network Cables” OR  ExplorerNode.Name =”Power Cables”))
//  then return true else return false
// }
///////////////////////////////////////////////////////////////////////////////////////

export const fnNetworkCableImportBin = (selectednode: any) => {
    if ((selectednode.node.NodeType === "Bin") && selectednode?.node?.Name === "Network Cables") {
        return true
    } else {
        return false
    }
}
///////////////////////////////////////////////////////////////////////////////////////
// fnBinMoveToUnused;
//{
//         If(<Node>.NodeType===Bin and <Node>.Type===New or Other) return true else return false
// }
///////////////////////////////////////////////////////////////////////////////////////
export const fnBinMoveToUnused = (selectedNode: any) => {
    if (selectedNode?.node?.NodeType === "Bin" && (selectedNode?.node?.Type === "New" || selectedNode?.node?.Type === "Other")) {
        return true;
    } else {
        return false;
    }
}
///////////////////////////////////////////////////////////////////////////////////////
//fnBinMoveToDisposable;
//{
//         If((<Node>.NodeType===Bin and <Node>.Type ===Unused) return true else return false
//}
///////////////////////////////////////////////////////////////////////////////////////
export const fnBinMoveToDisposable = (selectedNode: any) => {
    if (selectedNode?.node?.NodeType === "Bin" && selectedNode?.node?.Type === "Unused") {
        return true
    } else {
        return false
    }
}
///////////////////////////////////////////////////////////////////////////////////////
//fnBinDispose;
//{
//                 If((<Node>.NodeType===Bin and <Node>.Type ===Disposable) return true else return false
//}    
///////////////////////////////////////////////////////////////////////////////////////
export const fnBinDispose = (selectedNode: any) => {
    if (selectedNode?.node?.NodeType === "Bin" && selectedNode?.node?.Type === "Disposable") {
        return true
    } else {
        return false
    }
}
///////////////////////////////////////////////////////////////////////////////////////
// fnSwapMountedDevice
// {
//returns true if mounted device views can be swapped
//     If(NodeType === MountedDevice AND(ParentNode.NodeType === SLOT OR(ParentNode.NodeType === RU)
// Then Return true
// Else return false
// }
/////////////////////////////////////////////////////////////////////////////////////
export const fnSwapMountedDevice = (selectedNode: any) => {
    let ParentNode = fnGetImmediateParentTreeInfoUsingDiv(selectedNode.node)
    if (selectedNode?.node?.NodeType === "MountedDevice" && (ParentNode?.NodeType === "SLOT" || ParentNode?.NodeType === "RU")) {
        return true
    } else {
        return false
    }
}

/////////////////////////////////////////////////////////////////////////////////////
// fnSlotAvailable(); used for RU, Slot and PORT only
// {//We are sending status or RU, Slot also as a PortStatus
// If ExplorerNode.PortStatus === “Avaialble” or "0”) then return true else return false
// }
/////////////////////////////////////////////////////////////////////////////////////

// export const fnSlotAvailable = (selectednode: any) => {
//     if ((selectednode.node.NodeType === "RU" ||
//         selectednode.node.NodeType === "TopRU" ||
//         selectednode.node.NodeType === "RU0" ||
//         selectednode.node.NodeType === "Slot") &&
//         (selectednode?.node?.PortStatus?.toLowerCase() === "available" ||
//             selectednode?.node?.PortStatus?.toLowerCase() === "" || selectednode?.node?.PortStatus === null) ||
//         selectednode.node.PortStatus === '0') {
//         return true
//     } else {
//         return false
//     }
// }

////////////////////////////////////////////////////////////////////////////////////////////
//     TU - You developed this function, please remove this one
//     fnSlotAvailable

// Now Develop these functions
//     a.fnRUAvailable		check NodeType = RU
//     b.fnSlotAvailable		check NodeType = SLOT
//     c.fnPortAvailable		check NodeType = Port
//     d.fnPortConnected
//     {
//         a.Return false; this logic will be implemented after cabling is done.
// }

//     e.fnFloorDevice
//     {
//         if (ParentEntID.NodeType === Floor or ParentEntID.NodeType === Location) 
// then Return true 
// else return false
// }
/////////////////////////////////////////////////////////////////////////////////////////

export const fnRUAvailable = (selectednode: any) => {
    if ((selectednode?.node?.NodeType === "RU" && (selectednode?.node?.PortStatus?.toLowerCase() === "available" ||
        selectednode?.node?.PortStatus?.toLowerCase() === "normal" ||
        selectednode?.node?.PortStatus?.toLowerCase() === "" || selectednode?.node?.PortStatus === null))) {
        return true
    }
    else {
        return false
    }
}
export const fnSlotAvailable = (selectednode: any) => {
    if ((selectednode?.node?.NodeType?.toLowerCase() === "slot" && (selectednode?.node?.PortStatus?.toLowerCase() === "available" ||
        selectednode?.node?.PortStatus?.toLowerCase() === "normal" ||
        selectednode?.node?.PortStatus?.toLowerCase() === "" || selectednode?.node?.PortStatus === null))) {
        return true
    }
    else {
        return false
    }
}
export const fnPortAvailable = (selectednode: any) => {
    if ((selectednode?.node?.NodeType?.toLowerCase() === "port" && (selectednode?.node?.PortStatus?.toLowerCase() === "available" ||
        selectednode?.node?.PortStatus?.toLowerCase() === "normal" ||
        selectednode?.node?.PortStatus?.toLowerCase() === "" || selectednode?.node?.PortStatus === null))) {
        return true
    }
    else {
        return false
    }
}

export const fnMapPort = (selectedNode: any) => {
    if (selectedNode.node.IsPatchPort) {
        return true
    } else {
        return false
    }
}

//Audit Session RTM Functions by NK
// IsSelectedAuditSessionApprove 
// If (AuditSessionNode AND
// SelectedAuditsession.DateCreated = true	AND
// SelectedAuditsession.DateApproved = False 	AND
// SelectedAuditsession. OpenDate = False 	AND
// SelectedAuditsession. CloseDate = False
// ) return =true else return false;
export const IsSelectedAuditSessionApprove = (selectedNode: any) => {
    if (selectedNode?.node && selectedNode?.node?.DateCreated && !selectedNode?.node?.DateApproved
        && !selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
        return true;
    }
    else {
        return false;
    }
}

// IsSelectedAuditSessionReject
// If(AuditSessionNode AND
// SelectedAuditsession.DateCreated = true	AND
// SelectedAuditsession.DateApproved = true 	AND
// SelectedAuditsession.OpenDate = False 		AND
// SelectedAuditsession.CloseDate = False
// ) return = true else return false;
export const IsSelectedAuditSessionReject = (selectedNode: any) => {
    if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
        && !selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
        return true;
    }
    else {
        return false;
    }
}

// IsSelectedAuditSessionOpen
// If (AuditSessionNode AND
// SelectedAuditsession.DateCreated = true	AND
// SelectedAuditsession.DateApproved = true 	AND
// SelectedAuditsession. OpenDate = false 		AND
// SelectedAuditsession. CloseDate = False
// ) return =true else return false;
export const IsSelectedAuditSessionOpen = (selectedNode: any) => {
    if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
        && !selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
        return true;
    }
    else {
        return false;
    }
}

// IsSelectedAuditSessionClose
// If (AuditSessionNode AND
// SelectedAuditsession.DateCreated = true	AND
// SelectedAuditsession.DateApproved = true 	AND
// SelectedAuditsession. OpenDate = true 		AND
// SelectedAuditsession. CloseDate = False
// ) return =true else return false;
export const IsSelectedAuditSessionClose = (selectedNode: any) => {
    if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
        && selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
        return true;
    }
    else {
        return false;
    }
}

// IsSelectedAuditSessionSnapshot
// If (AuditSessionNode AND
// SelectedAuditsession.DateCreated = true	AND
// SelectedAuditsession.DateApproved = true 	AND
// SelectedAuditsession. OpenDate = true 		AND
// SelectedAuditsession. CloseDate = False
// ) return =true else return false;
export const IsSelectedAuditSessionSnapshot = (selectedNode: any) => {
    if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
        && selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
        return true;
    }
    else {
        return false;
    }
}

// IsSelectedAuditSessionDelete
// If (AuditSessionNode AND
// SelectedAuditsession.DateCreated = true	AND
// SelectedAuditsession.DateApproved = true 	AND
// SelectedAuditsession. OpenDate = true 		AND
// SelectedAuditsession. CloseDate = true
// ) return =true else return false;
export const IsSelectedAuditSessionDelete = (selectedNode: any) => {
    if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
        && selectedNode?.node?.OpenDate && selectedNode?.node?.CloseDate) {
        return true;
    }
    else {
        return false;
    }
}

// Function  IsAdminNZTaskNode
// If (NZTaskNode AND
//     Session.RequestedBy.LoginUserBasicRoleName = “Admin”
// ) return =true else return false;
export const IsAdminNZTaskNode = (selectedNode: any) => {
    let sessionVar = fnGetSessionVariableFromStorage("RequestedBy", "LoginUserBasicRoleName");
    if (selectedNode && sessionVar?.length > 0 && sessionVar[0].SessionValue === "Admin") {
        return true;
    }
    else {
        return false;
    }
}

// Function  IsAdminNZSessionNode
// If (NZSessionNode AND
//     Session.RequestedBy.LoginUserBasicRoleName = “Admin”
// ) return =true else return false;
export const IsAdminNZSessionNode = (selectedNode: any) => {
    let sessionVar = fnGetSessionVariableFromStorage("RequestedBy", "LoginUserBasicRoleName");
    if (selectedNode && sessionVar?.length > 0 && sessionVar[0].SessionValue === "Admin") {
        return true;
    }
    else {
        return false;
    }
}

// Function  IsAdminNZWinSVCNode
// If (NZWinSVCNode AND
//     Session.RequestedBy.LoginUserBasicRoleName = “Admin”
// ) return =true else return false;
export const IsAdminNZWinSVCNode = (selectedNode: any) => {
    let sessionVar = fnGetSessionVariableFromStorage("RequestedBy", "LoginUserBasicRoleName");
    if (selectedNode && sessionVar?.length > 0 && sessionVar[0].SessionValue === "Admin") {
        return true;
    }
    else {
        return false;
    }
}
export const fnMigrationEnabled = (selectedNode: any) => {
    return true
}
export const fnCharts = (selectedNode: any, nodeType: string) => {
    let splitData: string[] = nodeType.split(";").map(item => item.trim());
    if (selectedNode.NodeEntityname && splitData.includes(selectedNode.NodeEntityname)) {
        if (ChartEntityNameArr.EntityNames.includes(selectedNode.NodeEntityname)) {
            return true
        } else {
            return true
        }
    } else {
        return false
    }
}
