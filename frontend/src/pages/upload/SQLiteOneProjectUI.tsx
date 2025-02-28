import Label from "../../components/psrLabel/Label";
import ActionLabel from "../../components/psrActionLabel/ActionLabel";
import EditTextControl from "../../components/editTextControl/EditTextControl";
import ConfirmYesNo from "../../components/psrConfirmYesNo/ConfirmYesNo";
import { EditComboControl } from "../../components/editComboControl/EditComboControl";
import "../../psrStyles/index.css";
import { useState, useEffect } from "react";
import { IeditTextControl } from "../../components/editTextControl/interfaces/IeditTextControl";
import { IlistBoxControl } from "../../components/psrListBoxControl/interfaces/IlistBoxControl";
import axios from "axios";
import JSZip from 'jszip';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"


const SQLiteOneProjectUI = () => {

  const [currentDatabase, setCurrentDatabase] = useState<any>("");
  const [newDbName, setNewDbName] = useState("");

  const [selectedDbId2attach, setSelectedDbId2attach] = useState<any>("");
  const [isOpenConfirmBox, setIsOpenConfirmBox] = useState<boolean>(false);

  const [databases, setDatabases] = useState<Array<any>>([])
  const [jsonFiles, setJsonFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState<boolean>(false)

  const [confrimBoxActionCode, setConfrimBoxActionCode] = useState("");
  const [confirmBoxMessage, setConfirmBoxMessage] = useState<string>("");

  const navigate = useNavigate()


  const Header = {
    "Authorization": `Bearer ${import.meta.env.VITE_API_TOKEN}`,  // Cloudflare API Token
    "X-Account-Id": import.meta.env.VITE_ACCOUNT_ID,
    "X-Worker-Name": import.meta.env.VITE_WORKER_NAME
  }

  const BASE_URL = localStorage.getItem("worker_url")

  // Create New Database
  const createNewDatabase = async (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    console.log(
      `createNewDatabase Mouse event From Parent:${event.type} ,data passed : ${actionCode}`
    );
    if (newDbName != undefined && newDbName.length > 1) {
      try {
        setLoading(true)
        const response = await axios.post(`${BASE_URL}/database/create`, { "name": newDbName }, { headers: { ...Header } })
        console.log("createdatabase ==>", response)
        if (response.status == 200) {
          setNewDbName("")
          setLoading(false);
          toast.success(response.data.message)
          showDatabase();
        }
      }
      catch (err: any) {
        setLoading(false);
        try {
          const errorString = err.response.data.error; // The full error string
          const jsonMatch = errorString.match(/{.*}/s); // Extract JSON part safely

          if (jsonMatch) {
            const errorDetails = JSON.parse(jsonMatch[0]); // Parse extracted JSON
            const errorMessage = errorDetails.errors?.[0]?.message || "Unknown error occurred";

            toast.error(errorMessage);
          } else {
            toast.error("Error: " + errorString); // Fallback to showing raw error string
          }
        } catch (e: any) {
          console.error("Error parsing response:", e);
          toast.error("An error occurred while processing the response.");
        }
      }
    } else {
      toast.error("Enter Value for new database Name");
    }
  };


  // Database Bind with Selected Database
  const attachDatabase = async (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    try {
      setLoading(true)
      const response = await axios.post(`${BASE_URL}/bind-database`, { "database_id": selectedDbId2attach?.id }, { headers: { ...Header } })
      console.log("showDatabase ==>", response)
      if (response.status == 200) {
        setLoading(false)
        CurrentDatabase()
        toast.success(response.data.message)
      }
    }
    catch (err: any) {
      setLoading(false)
      toast.error(err.response.data.error)
      console.log(err)
    }
  };



  //  Detach Database Confirm Call
  const deAttachDatabase = (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    console.log(
      `Mouse event From Parent:${event.type} ,data passed : ${actionCode}`
    );
    setConfirmBoxMessage(
      `Are you sure you want to detach the database: ${currentDatabase?.database_name}`
    );
    setConfrimBoxActionCode("detach-db");
    setIsOpenConfirmBox(true);
  };

  //  Backup Database Confirm Call
  const backUpDatabase = (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    console.log(
      `Mouse event From Parent:${event.type} ,data passed : ${actionCode}`
    );
    setConfirmBoxMessage(
      `Are you sure you want to backup the currently attached database: ${currentDatabase?.database_name} `
    );
    setConfrimBoxActionCode("backup-db");
    setIsOpenConfirmBox(true);
  };

  //  Purge Confirm Call
  const purgeDatabase = (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    console.log(
      `Mouse event From Parent:${event.type} ,data passed : ${actionCode}`
    );
    setConfirmBoxMessage(
      `Are you sure you want to delete all records from all tables in the currently attached database: ${currentDatabase?.database_name}`
    );

    setConfrimBoxActionCode("purge-db");
    setIsOpenConfirmBox(true);
  };

  // Import Confirm Call
  const importDatabase = (
    event: React.MouseEvent<Element>,
    actionCode?: string
  ) => {
    console.log(
      `Mouse event From Parent:${event.type} ,data passed : ${actionCode}`
    );
    setConfirmBoxMessage(
      `Are you sure you want to Import data into the currently attached database: ${currentDatabase?.database_name}`
    );
    setConfrimBoxActionCode("import-db");

    setIsOpenConfirmBox(true);
  };

  // Download Currently Binding Database
  const exportDatabase = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${BASE_URL}/database-download-json`,
        {},
        { headers: { ...Header } }
      );

      if (response.data.success && response.data.files?.length > 0) {
        const zip = new JSZip();

        // Add each JSON file to the ZIP
        response.data.files.forEach((file: any) => {
          const { filename, content } = file;
          const jsonData = atob(content);  // Decode base64 content
          zip.file(filename, jsonData);
        });

        // Generate the ZIP file
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Create download link for the ZIP
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `database_export_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        setLoading(false)
        toast.success("Database exported successfully as ZIP.");
      } else {
        setLoading(false)
        toast.error("No tables found to export.");
      }
    } catch (error: any) {
      setLoading(false)
      console.error(error);
      toast.error(error?.response?.data?.message || error?.response?.data?.error);
    }
  };


  //  Confirmation Box Events :
  const handelYesButtonClick = async () => {
    setIsOpenConfirmBox(false);

    // Detach Currect Binding Database
    if (confrimBoxActionCode == "detach-db") {
      try {
        setLoading(true)
        const response = await axios.post(`${BASE_URL}/unbind-database`, {}, { headers: { ...Header } })
        console.log("showDatabase ==>", response)
        if (response.status == 200) {
          setLoading(false)
          CurrentDatabase()
          toast.success(response.data.message)
        }
      }
      catch (err: any) {
        setLoading(false)
        toast.error(err?.response?.data?.message || err?.response?.data?.error)
        console.log(err)
      }
    }

    // Backup Current Binding Database
    if (confrimBoxActionCode == "backup-db") {
      try {
        setLoading(true)
        const response = await axios.post(`${BASE_URL}/backup/initiate`, {}, { headers: { ...Header } }
        )
        console.log("databasePurge", response)
        if (response.status == 200) {
          setLoading(false)

          toast.success(response.data.message)
        }
      }
      catch (err: any) {
        setLoading(false)
        toast.error(err?.response?.data?.message || err?.response?.data?.error)
        console.log(err)
      }
    }

    // Clean All Tables From Current Binding Database
    if (confrimBoxActionCode == "purge-db") {
      try {
        setLoading(true)
        const response = await axios.post(`${BASE_URL}/purge-tables`, {}, { headers: { ...Header } })
        console.log("databasePurge", response)
        if (response.status == 200) {
          setLoading(false)
          toast.success(response.data.message)
        }
      }
      catch (err: any) {
        setLoading(false)
        toast.error(err.response.data.message || err.response.data.error)
        console.log(err)
      }
    }

    // Import Database on Current Binding Database
    if (confrimBoxActionCode === "import-db") {
      jsonFiles.length > 0 && setJsonFiles([]);
      console.info("**** do import-db");

      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".json";
      input.style.display = "none";

      input.addEventListener("change", (event: any) => {
        const selectedFiles = Array.from(event.target.files);

        setJsonFiles((prevFiles: any) => {
          const updatedFiles = [...prevFiles, ...selectedFiles];

          // Ensure ImportJsonData() is called with the updated state
          if (updatedFiles.length > 0) {
            ImportJsonData(updatedFiles);
          }

          return updatedFiles;
        });

        console.log("Selected Files:", selectedFiles);

        // Clear the input value to free up storage after upload
        input.value = "";
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    }

    setConfrimBoxActionCode("");
  };




  // Import JSon Data In Current Binding Database
  const ImportJsonData = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file: File) => formData.append("files", file));

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/database-upload-json`, {
        method: "POST",
        body: formData, // No need for headers
        headers: { ...Header }
      });

      const result = await response.json();
      console.log("Response:", result);
      setJsonFiles([])
      if (response.ok) {
        setLoading(false);
        toast.success(result.message);
      } else {
        setJsonFiles([])
        throw new Error(result.message || "Upload failed");
      }
    } catch (err: any) {
      setJsonFiles([])
      setLoading(false);
      toast.error(err.response.data.message || err.response.data.error || err.message || "Error uploading file");
      console.error("Upload error:", err);
    }
  };

  // Show Currend Bind Database
  const CurrentDatabase = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BASE_URL}/binding`, { headers: { ...Header } })

      console.log(response);
      if (response.status == 200) {
        setLoading(false)
        setCurrentDatabase(response.data)
      }

    }
    catch (err: any) {
      setLoading(false)
      setCurrentDatabase("")
      console.log(err)
      toast.error(err.response.data.message || err.response.data.error)


    }


  }

  // Show All D1 Databases
  const showDatabase = async () => {
    try {
      setLoading(true)

      const response = await axios.get(`${BASE_URL}/databases`, {
        headers: {
          ...Header
        }
      })
      console.log("showDatabase ==>", response)
      if (response.status == 200) {
        setLoading(false)
        setDatabases(response?.data?.databases)
      }
    }

    catch (err: any) {
      setLoading(false)
      console.log(err)
    }
  }


  //  Cancel Confirm Box
  const handelNoButtonClick = () => {
    setIsOpenConfirmBox(false);
    if (confrimBoxActionCode == "detach-db") {
      console.warn("**** do not detach-db");
    }
    if (confrimBoxActionCode == "backup-db") {
      console.warn("**** do not backup-db");
    }
    if (confrimBoxActionCode == "purge-db") {
      console.warn("**** do not purge-db");
    }
    if (confrimBoxActionCode == "import-db") {
      console.warn("**** do not import-db");
    }

    setConfrimBoxActionCode("");
  };



  // Change Input Value
  const handleEditTextValueChange: IeditTextControl["handleValueChange"] = (
    newValue,
    oldValue,
    isDefault
  ) => {
    console.log(
      `Value changed for ${oldValue}: newValue:`,
      newValue,
      "Default status:",
      isDefault
    );

    setNewDbName(newValue);
  };


  // Change Input Value
  const handleListBoxValueChange: IlistBoxControl["handleValueChange"] = (
    newValue,
    name,
    isDefault
  ) => {
    console.log(
      `Value changed for ${name}: ${newValue} with Default?:${isDefault}`
    );

    setSelectedDbId2attach(newValue == null ? "" : newValue);
  };



  useEffect(() => {
    CurrentDatabase()
    showDatabase()
  }, [])

  return (
    <div className="psr-parent-container p-1">
      <ConfirmYesNo
        isOpen={isOpenConfirmBox}
        handelYesButtonClick={handelYesButtonClick}
        handelNoButtonClick={handelNoButtonClick}
        uniqueName="data-delete-confirm-box-1"
        message={confirmBoxMessage}
      />
      <ActionLabel
        styleClasses="sqlite-page-button mr-5 mt-5"
        actionCode="crt-nw-db"
        handleMouse={() => { navigate('/search') }}
        uniqueName="Search"
        tooltip="Search"
        label={{ label: "Search", uniqueName: "Search-Page" }}
        disabled={currentDatabase == "" || currentDatabase.length <= 0 || loading}

      />

      <Label
        uniqueName="CreatNewDatabaselbl"
        label="Manage lib20 Databases"
        styleClasses="sqlite-page-title text-2xl"
      />
      <div className="component-container sqlite-page-section ">
        <Label
          uniqueName="pageSubTitleLbl"
          label="Current Database"
          styleClasses="bg-gray-200"
        />
        <Label
          uniqueName="pageCurrentdbLbl"
          label={currentDatabase?.database_name}
          styleClasses="border-2 border-gray-300 px-1 py-1 mt-2  h-[30px] text-medium"
        />
      </div>

      <div className="component-container sqlite-page-section ">
        <Label
          uniqueName="CreatNewDatabaselbl"
          label="Create a New Database"
          styleClasses="bg-gray-200 "
        />
        <div className="sqlite-page-div-container  ">
          <EditTextControl
            uniqueName="textControl"
            handleValueChange={handleEditTextValueChange}
            value={newDbName}
            allowInputChangeEvent={true}
            isRenderAsForm={true}
            styleClasses="my-auto w-full"
            disabled={loading}
          />

          <ActionLabel
            styleClasses="sqlite-page-button mt-0!"
            actionCode="crt-nw-db"
            handleMouse={createNewDatabase}
            uniqueName="createNewDbAcLbl"
            tooltip="Create a new database"
            label={{ label: "Create", uniqueName: "CreateNeDB" }}
            disabled={newDbName.length <= 0 || loading}
          />
        </div>
      </div>
      <div className="component-container sqlite-page-section">
        <Label
          uniqueName="AttachDatabaselbl"
          label="Attach Database"
          styleClasses="bg-gray-200"
        />
        <div className="sqlite-page-div-container ">
          <EditComboControl
            tooltip="Show available Databases"
            uniqueName="selctdblb"
            inputMask="refCountry"
            isRenderAsForm={true}
            isRequired={false}
            value={selectedDbId2attach}
            // label="Databases"

            isDefault={true}
            type="databases"
            preventDefaultValue={true}
            handleValueChange={handleListBoxValueChange}
            styleClasses="w-full mt-1"
            optionsData={(databases?.length > 0 ? databases : []) || loading}

          />
          <ActionLabel
            styleClasses="sqlite-page-button"
            actionCode="atch-nw-db"
            handleMouse={attachDatabase}
            uniqueName="AttachDbAcLbl"
            tooltip="attach selected Database"
            label={{ label: "Attach", uniqueName: "AttachDB" }}
            disabled={selectedDbId2attach.length <= 0 || loading}
          />
        </div>
      </div>
      <div className="component-container sqlite-page-section">
        <Label
          uniqueName="DetachDatabaseLbl"
          label="Detach Database "
          styleClasses="bg-gray-200 "
        />
        <div className="sqlite-page-div-container">
          <Label
            label={currentDatabase?.database_name}
            uniqueName="currentDatabaselbl"
            styleClasses="border-2 border-gray-300 w-full px-1 py-1 h-[30px] mt-2 mr-1 text-medium"
          />

          <ActionLabel
            styleClasses="sqlite-page-button"
            actionCode="datch-nw-db"
            handleMouse={deAttachDatabase}
            uniqueName="DeAttachDbAcLbl"
            tooltip={`Detach the attached Database: ${newDbName}`}
            label={{ label: "Detach", uniqueName: "DeAttachDB" }}
            disabled={currentDatabase == "" || currentDatabase.length <= 0 || loading}
          />
        </div>
      </div>
      <div className="component-container sqlite-page-section flex flex-col">
        <div className="bg-gray-200 ">&nbsp;</div>
        <ActionLabel
          styleClasses="sqlite-page-button sqlite-page-button-left mt-2!"
          actionCode="bckup-nw-db"
          handleMouse={backUpDatabase}
          uniqueName="bckupDbAcLbl"
          tooltip={`Attached database will be backed up as: ${currentDatabase?.database_name}-yymmdd-hhmmss`}
          label={{ label: "Backup Database", uniqueName: "bckupDB" }}
          disabled={currentDatabase == "" || currentDatabase?.length <= 0 || loading}
        />
        <ActionLabel
          styleClasses="sqlite-page-button sqlite-page-button-left"
          actionCode="Purge-db"
          handleMouse={purgeDatabase}
          uniqueName="PurgeallDbAcLbl"
          tooltip="Purge all records from Database/tables"
          label={{ label: "Purge Database", uniqueName: "PurgeallDBlbl" }}
          disabled={currentDatabase == "" || currentDatabase?.length <= 0 || loading}
        />

        <ActionLabel
          styleClasses="sqlite-page-button sqlite-page-button-left"
          actionCode="import-db"
          handleMouse={importDatabase}
          uniqueName="importDbAcLbl"
          tooltip="Import json data to into respective Database/tables"
          label={{ label: "Import Json", uniqueName: "importDBlbl" }}
          disabled={currentDatabase == "" || currentDatabase?.length <= 0 || loading}
        />
        <ActionLabel
          styleClasses="sqlite-page-button sqlite-page-button-left"
          actionCode="export-db"
          handleMouse={exportDatabase}
          uniqueName="exportDbAcLbl"
          tooltip="Export json data from Database/tables "
          label={{ label: "Export Json", uniqueName: "exportDBlbl" }}
          disabled={currentDatabase == "" || currentDatabase?.length <= 0 || loading}
        />
      </div>
      {loading && (
        <div className='pop-up'>
          <div className='loading-boader'></div>
        </div>
      )}
    </div>
  );
};

export default SQLiteOneProjectUI;
