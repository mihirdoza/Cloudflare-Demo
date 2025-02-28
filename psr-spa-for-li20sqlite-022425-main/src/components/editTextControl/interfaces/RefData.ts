
export interface IrefTableData {
    GroupName: string;         // Name of the group to which the reference belongs
    SubGroupName: string;      // Name of the subgroup
    Name: string;              // Name of the reference item
    RefValue: string;          // Reference value
    SortOrder: number;         // Sorting order for the item
    IsNZ: boolean;             // Indicates if this is a NetZoom-related reference
    EntID: string;             // Entity ID (unique identifier)
    RecID: string;             // Record ID (unique identifier)
    LastUpdated: string;       // Timestamp of the last update
    NodeType: string;          // Type of the node (e.g., "Ref")
    Label?: string;            // Label to show if found
    Description?: string;      // Decription to show tooltip if needed
}


export interface IrefData {
    Name: string;              // Name of the reference item
    Value: string;            // Value will be set from name and will be used to show data
    Label?: string;            // Label to show if found
    SortOrder?: number;         // Sorting order for the item
    Description?: string;      // Decription to show tooltip if needed
    EntID?: string;             // Entity ID (unique identifier)
    RefValue: string;          // Reference value
}