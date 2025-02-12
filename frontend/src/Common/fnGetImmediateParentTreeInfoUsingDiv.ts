
// get parent data based on node
export const fnGetImmediateParentTreeInfoUsingDiv = (info: any) => {

    if (info.parentEntID) {
        let nodeDiv: any = document.getElementById(info.parentEntID)
        if (nodeDiv) {
            let nodeInfo = nodeDiv?.getAttribute("node-info")
            if (nodeInfo) {
                nodeInfo = JSON.parse(nodeInfo)
                return nodeInfo;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
    return null;
}