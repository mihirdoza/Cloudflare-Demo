import { ItoggleControl } from "./DisplayControls/ItoggleControl"


export const DefaultStyles = {
    FontSize: "14px",
    Width: "auto",
    Height: "auto",
    Border: "none",
    FontStyle: "normal",
    FontWeight: "normal",
    BGColor: "white",
    Color: "inherit",
    Cursor: "default",
    Align: "center"
}

export const BrowseButtonStyle = {
    Width: "100px",
    Height: "30px"
}

export enum DropableControlElementEnums {
    SiteName = "SiteName",
    RoomName = "RoomName",
    FloorName = "FloorName",
    LocationName = "LocationName",
    DeviceName = "DeviceName"
}

export enum ReminderPaneEnum {
    AddReminder = 'Add Reminder',
    EditReminder = 'Edit Reminder',
    ReminderEntityName = 'Reminder'
}

export enum FEnums {
    AssetManagement = "103",
    Settings = "995",
    MySettings = "95",
    Import = "945",
    Export = "950",
    InventoryManagement = "353",
    InventoryConfiguration = "356",
    AssetConfiguration = "106",
    DeviceManagement = "253",
    DeviceConfiguration = "256",
    NewSession = "12",
    AssetPowerCabling = "153",
    AssetNetworkCabling = "156",
    InventoryImport = "365",
    InventoryExport = "368",
    DevicePowerCabling = "259",
    DeviceNetworkCabling = "262",
    DeviceImport = "265",
    DeviceExport = "268",
    ImportCables = "373",
    ExportCables = "376",
    Discover = "306",
    Monitor = "309",
    IntelDCMConsole = "303",
    Configure = "312",
    // PlatformOS = "353",
    // Applications = "356",
    PhysicalCompute = "403",
    VirtualCompute = "406",
    CloudCompute = "409",
    ComputeAlerts = "412",
    ModelBusinessService = "453",
    BusinessServiceAlerts = "459",

    TrendsAndForecast = "509",
    FilterCapacity = "512",
    OptimizeCapacity = "515",
    ReportBuilder = "653",
    Optimize = "903",
    Stop = "921",
    Start = "924",
    ManageAuditSessions = "603",
    AuditDataCenter = "606",
    InventoryReconciliation = "609",
    BackgroundTasks = "18",
    Reminders = "21",
    UserProfile = "8",
    Documentation = "6",
    DataCenterHierarchy = "905",
    InventoryStoreHierarchy = "910",
    ManageBusinessService = "456",
    Home = "990",
    MigrateDB = "915",
    PowerBI = "506",
    AnalyticsAndCharts = "503",
    close = "4",
    FloorLayout = "258",
    StopNetZoom = "909",
    StartNetZoom = "906",
}

export const DELIMITER = {
    separator: ";"
}

export enum DisplayControlEnums {
    ToggleControl = "ToggleControl",
    CheckedListBoxControl = "CheckedListBoxControl",
    ComboBoxControl = "ComboBoxControl",
    PeriodControl = "PeriodControl",
    DateControl = "DateControl",
    EditComboControl = "EditComboControl",
    EditTextControl = "EditTextControl",
    EncryptedEditTextControl = "EncryptedEditTextControl",
    HiddenEditTextControl = "HiddenEditTextControl",
    HTMLEditControl = "HTMLEditControl",
    HyperlinkControl = "HyperlinkControl",
    jsonPropertyGrid = "jsonPropertyGrid",
    jsonPropertyGridRW = "jsonPropertyGridRW",
    jsonPropertyGridAdd = "jsonPropertyGridAdd",
    ListBoxControl = "ListBoxControl",
    FileSelectControl = "FileSelectControl",
    SpinControl = "SpinControl",
    TextControl = "TextControl",
    FileUploadComboControl = "FileUploadComboControl",
    PropertyMapComponent = "JsonPropertyMapGrid",
    ActionImage = "ActionImage",
    TrueFalseControl = "TrueFalseControl",
    WordEditControl = "WordEditControl",
    YesNoControl = "YesNoControl",
    EnableDisableControl = "EnableDisableControl",
}

export const Measurement = ["width", "length", "depth", "height", 'power']

export const RefDataForPeriodControl = [{

    "Name": "refForensicLogPeriod",
    "Value": "Month",
    "EntID": "00000000-0000-0000-0000-000000000000",
    "Label": "",
    "Description": ""
},
{
    "Name": "refForensicLogPeriod",
    "Value": "Today",
    "EntID": "00000000-0000-0000-0000-000000000000",
    "Label": "",
    "Description": ""
},
{
    "Name": "refForensicLogPeriod",
    "Value": "Week",
    "EntID": "00000000-0000-0000-0000-000000000000",
    "Label": "",
    "Description": ""
},
{
    "Name": "refForensicLogPeriod",
    "Value": "Year",
    "EntID": "00000000-0000-0000-0000-000000000000",
    "Label": "",
    "Description": ""
},
{
    "Name": "refForensicLogPeriod",
    "Value": "Yesterday",
    "EntID": "00000000-0000-0000-0000-000000000000",
    "Label": "",
    "Description": ""
}
]

export const ContainerStyle = {
    width: "100%",
    height: "100%",
};
export const GridDefaults = {
    paginationPageSize: 10, //default page size
    rowHeight: 30,// default height of row
    rowSelection: 'single', // default row selection
    rowBuffer: 100,// default row buffer
}
export const multiCheckedTableList = []

export const ChartEntityNameArr = {
    EntityNames: 'Site, Room, Floor, Rack; Device; MountedDevice; Cable;',
}

export const RightMouseMenuRange = {
    MIN: 10000
}


export const APP = {
    TAGLINE: "Visual Data Center Infrastructure Management and Analytics",
    IMAGE_BASE_PATH: "/assets/",
    TEMPLATE_BASE_PATH: "/Templates/"
    // IMAGE_BASE_PATH:"https://storage.googleapis.com/n20-2023/n20-img-public/Templates/iCons/"
}

export const searchControlChecks :ItoggleControl[]=[
    {
         uniqueName: "AND",//unique identifier name for the control
         isRenderAsForm: true, //Indicates whether render as form or not 
         label: "AND", //Label to show for the toggle 
         value: "0", // Indicates the toggle is ON (can be "0" for OFF)
         isDefault: false, // Whether value set by default or not
         tooltip: "AND", //Tooltip to show on the control
         disabled: false, // Disable the toggle control
         
     },
     {
         uniqueName: "OR",//unique identifier name for the control
         isRenderAsForm: true, //Indicates whether render as form or not 
         label: "OR", //Label to show for the toggle 
         value: "1", // Indicates the toggle is ON (can be "0" for OFF)
         isDefault: false, // Whether value set by default or not
         tooltip: "OR", //Tooltip to show on the control
         disabled: false, // Disable the toggle control
         
     },
 ]
