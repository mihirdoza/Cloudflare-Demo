
// this function get session variable from storage
export const fnGetSessionVariableFromStorage = (VariableContext: string = "", VariableName: string = "") => {
    let session_var_string = getStorageItem("session_variables");

    if (session_var_string && session_var_string.length > 0) {
        let session_var = JSON.parse(session_var_string);
        if (session_var && session_var.length > 0) {
            return session_var.filter((ele: any) => { return ele.VariableContext === (VariableContext && VariableContext !== "" ? VariableContext : ele.VariableContext) && ele.VariableName === (VariableName && VariableName !== "" ? VariableName : ele.VariableName) });
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
};

export const getStorageItem = (key: string) => {
    return window.sessionStorage.getItem(key);
}
