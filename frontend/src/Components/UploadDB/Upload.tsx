import { useEffect, useState } from 'react'
import { BrowseFileControl } from '../DisplayControls/BrowseFileControl/BrowseFileControl'
import { useNavigate } from 'react-router-dom'
import EditTextControl from '../DisplayControls/EditTextControl/EditTextControl'
import { Base_Url } from '../../Common/Api'
import { Button } from '@mui/material'
import Label from '../Label/Label'



const Upload = () => {
  const [file, setFile] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [fileName, setFileName] = useState<any>("")
  const [responseMessage, setResponseMessage] = useState<any>("")
  const [error, setError] = useState<any>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [logData, setLogData] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<any>('')
  const [dbFile, setDbFile] = useState<any[]>([])
  const [dbFileName, setDbFileName] = useState<any>("")
  const [dbName, setDBName] = useState<any>('')





  const HnadleUploadFileName = (fileDataArray: any[]) => {

    console.log("HnadleUploadFileName", fileDataArray)
    let array = "";
    fileDataArray?.map((val) => {
      array += `${val.fullName}, `
    })
    setFileName(array)
    console.log(array)

  }

  const handleLoading = async () => {
    setLoading((prev) => !prev);
  }
  useEffect(() => {
    console.log("Loading state changed:", loading);
  }, [loading]);


  const flattenLogData = (data: any) => {

    console.log(data)
    // Recursively flatten the data if it's an array
    return data.reduce((acc: any, item: any) => {

      console.log(acc, item)
      if (Array.isArray(item)) {
        // If the item is an array, recursively flatten it
        acc.push(...flattenLogData(item));

      } else {
        // If the item is not an array, add it directly to the accumulator
        acc.push(item);

      }
      return acc;
    }, []);
  };






  const handleFileChange = async (fileDataArray: any[], name: any, isDefault: any) => {
    setFile([])

    await handleLoading();

    HnadleUploadFileName(fileDataArray)
    if (Array.isArray(fileDataArray)) {
      fileDataArray.forEach((file, index) => {
        if (
          file &&
          typeof file.extension === "string" &&
          typeof file.fileContentBlob === "string" &&
          typeof file.fileName === "string" &&
          typeof file.fullName === "string"
        ) {

          // Directly use the Base64 string from `fileContentBlob`
          const base64String = file.fileContentBlob;
          console.log(`File ${index + 1}:`);
          console.log("Name:", file.fileName);
          console.log("Extension:", file.extension);
          console.log("Base64 content:", base64String);

          // You can replace `setFile` logic with a state update that handles multiple files
          setFile((prevFiles: any[]) => [...prevFiles, { fileContentBlob: base64String, fileName: file.fileName, extension: file.extension }]); // Assuming `setFile` accepts an array
          setLoading(false)
        } else {
          setLoading(false)
          console.error(`Invalid file data structure at index ${index}:`, file);
        }
      }
      );

    } else {
      setLoading(false)
      setError(`Unexpected file data format: ${fileDataArray}`)
      console.error("Unexpected file data format:", fileDataArray);
    }

  };


  const HandleClearFn = async () => {
    setExecutionTime(0)
    setFileName("");
    setSelectedTable("");
    setResponseMessage("");
    setError("");
    setFile([]);
    setLogData([]);
    setLoading(true);
    let data: any;
    try {
      const response = await fetch(`${Base_Url}/clear-database`, {
        method: "DELETE",

      })
      data = await response.json();
      setLoading(false);
      console.log(data)
      if (data.success == true) {
        setLogData(flattenLogData([`${data.message}`]))
        setResponseMessage(data.message)
        console.log("Database Clear successfully!");
      }
      else {

        setLoading(false)
        setError(data.message)
        setLogData(flattenLogData([`${data.message}`]))
        console.log(data.message)
      }

    }
    catch (err: any) {
      setLoading(false)
      setError(data.message)
      setLogData(flattenLogData([`${data.message}`]))
      console.log(err)
    }



  }

  const handleFileUpload = async () => {

    setError("")
    setResponseMessage("")
    setLogData([])
    console.log(file, selectedTable)

    setLoading(true)
    const formData = new FormData();

    // Log file to check its structure
    console.log(file);

    if (Array.isArray(file)) {
      file.forEach((item, index) => {
        if (
          item &&
          typeof item.fileContentBlob === "string" &&
          typeof item.fileName === "string" &&
          typeof item.extension === "string"
        ) {
          try {
            // Decode the Base64 string
            const base64Content = item.fileContentBlob;
            const byteCharacters = atob(base64Content); // No need to split
            const byteArrays = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteArrays[i] = byteCharacters.charCodeAt(i);
            }

            // Create a Blob and File object
            const fileBlob = new Blob([byteArrays], { type: `application/json` }); // Adjust MIME type as needed
            const fileObj = new File([fileBlob], `${item.fileName}.json`, { type: `application/json` });

            // Append to FormData
            formData.append("file", fileObj);
          } catch (error) {

            console.error(`Error processing file at index ${index}:`, error);
          }
        } else {
          console.error(`Invalid file data structure at index ${index}:`, item);
        }
      });
    } else {
      console.error("Unexpected file data format:", file);
    }

    formData.append("tableName", selectedTable);
    const startTime = performance.now();
    try {
      const response = await fetch(`${Base_Url}/upload`, {
        method: "POST",
        body: formData,
      });
      console.log("response :", response)
      const endTime = performance.now();
      setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));
      if (response.ok) {

        setLoading(false)
        const data = await response.clone().json();
        console.log(data)
        setLogData(flattenLogData(data.logData))
        setResponseMessage("File uploaded successfully!")
        console.log("File uploaded successfully:", "File uploaded successfully!");;

      }
      else {

        const data = await response.json();
        setError(data.error)
        const logDetails = await flattenLogData(data.logData)
        setLogData(logDetails)
        console.log("response :", data)
        setError(`Upload failed: ${logDetails[logDetails.length - 1]}`)
        setLoading(false)
      }

    } catch (error: any) {
      console.log(error)
      setLoading(false)
      setError(error.message)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setError("Network error: Please check your internet connection.");
      } else {
        setError(`Error uploading file : ${error.message}`);
      }
      console.log("response :", error)

    }
  };



  const HandleJsonBackup = async () => {
    setError("")
    setResponseMessage("")
    setLogData([])
    setLoading(true);
    const startTime = performance.now();
    try {
      const response = await fetch(`${Base_Url}/export`, {
        method: "GET",
      });
      const endTime = performance.now();
      setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));
      setLoading(false);
      if (!response.ok) {
        const data = await response.json();
        console.log("json backup data -->", data)
        setError(data.message)
        const logDetails = await flattenLogData([`${data.message}`])
        setLogData(logDetails)

        console.log("response :", data)
        
        setError(`Upload failed: ${data.message}`)
        setLoading(false)
        throw Error(`Upload failed: ${data.message}`)

      }

      // Convert response to a downloadable file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "database_backup.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setResponseMessage("Database exported as ZIP successfully!");
    } catch (error: any) {
      setLoading(false)
      setError(error.message)
      console.log("Error exporting database:", error.message);

    }
  };



  const HandleExport = async () => {
    setError("");
    setResponseMessage("");
    setLogData([]);
    setLoading(true);
    const startTime = performance.now();

    try {
      const response = await fetch(`${Base_Url}/export-db`, {
        method: "GET",
      });

      const endTime = performance.now();
      setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));
      setLoading(false)
      if (!response.ok) {
        const data = await response.json();
        setError(data.error);
        const logDetails = await flattenLogData(data.logData);
        setLogData(logDetails);
        console.log("Response:", data);
        setError(`Export failed: ${logDetails[logDetails.length - 1]}`);
        setLoading(false);
        return;
      }

      // Convert response to a downloadable file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "database_backup.sql"; // Ensure the correct file extension
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setResponseMessage("Database exported successfully!");
    } catch (error: any) {
      setLoading(false);
      setError(error.message);
      console.error("Error exporting database:", error);
      alert("Failed to export database!");
    }
  };




  const handleDatabseFileChange = async (fileDataArray: any[], name: any, isDefault: any) => {
    setDbFile([]); // Reset previous files
    setFile([]); // Reset previous files for other formats

    console.log(fileDataArray);

    if (Array.isArray(fileDataArray)) {
      fileDataArray.forEach(async (file, index) => {
        if (
          file &&
          typeof file.extension === "string" &&
          typeof file.fileContentBlob === "string" &&
          typeof file.fileName === "string" &&
          typeof file.fullName === "string"
        ) {

          if (file.extension === "sql") {
            try {
              setDbFileName(file.fullName);

              // Store .sql file data
              setDbFile((prevFiles: any[]) => [
                ...prevFiles,
                {
                  fileContentBlob: file.fileContentBlob,
                  fileName: file.fullName,
                  extension: "sql",
                },
              ]);

              console.log("SQL file stored successfully:", file.fullName);
            } catch (error: any) {
              console.error(`Error handling SQL file at index ${index}:`, error);
              setError(`Error handling SQL file: ${error.message}`);
            }
          }
          else {
            // Directly use the Base64 string for non-ZIP, non-SQL files
            setFile((prevFiles: any[]) => [
              ...prevFiles,
              {
                fileContentBlob: file.fileContentBlob,
                fileName: file.fileName,
                extension: file.extension,
              },
            ]);
          }

          setLoading(false);
        } else {
          setLoading(false);
          console.error(`Invalid file data structure at index ${index}:`, file);
        }
      });
    } else {
      setLoading(false);
      setError(`Unexpected file data format: ${fileDataArray}`);
      console.error("Unexpected file data format:", fileDataArray);
    }
  };


  const HandleRestore = async () => {
    setError("");
    setResponseMessage("");
    setLogData([]);
    setLoading(true)

    if (dbFile.length === 0) {
      setLoading(false);
      setError("No file selected for restoration.");
      return;
    }


    let data: any;
    try {
      const formData = new FormData();

      // Retrieve the ZIP file from dbFile
      const sqlFile = dbFile[0];
      const sqlBlob = new Blob([atob(sqlFile.fileContentBlob)], { type: "application/sql" });

      formData.append("database", sqlBlob, sqlFile.fileName);

      const startTime = performance.now();
      // API call
      const response = await fetch(`${Base_Url}/import`, {
        method: "POST",
        body: formData,
      });
      const endTime = performance.now();
      setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));
      setLoading(false);
      data = await response.clone().json();
      console.log(data)
      if (response.status === 200) {
        setLogData(flattenLogData([`${data.message}`]))
        setResponseMessage(data.message)
        setLoading(false)
      }
      else {
        setError(`Failed to restore database: ${data.error}`);
        setLogData(flattenLogData([`${data.message}`, `${data.error}`]))
      }

      setLoading(false)
      console.log(response);
    } catch (error: any) {
      setLoading(false)
      setError(`Failed to restore database: ${data.error}`);
      console.error("Error restoring database:", error);
    }
  };




  const HandleCreateDatabase = async () => {
    setError("");
    setResponseMessage('');
    setLogData([]);
    setLoading(true);
    if (dbName === '') {
      setError("Please enter Database Name");
      return;
    }

    try {
      const response = await fetch(`${Base_Url}/create-db`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: dbName })
      });

      setLoading(false);
      // 🔹 Check if response is not OK (e.g., 400 or 500)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorDetails || "Failed to create database");
      }

      const data = await response.json();
      console.log("Response:", data);

      if (data.success) {
        setError('');
        setLogData(flattenLogData([`${data.message}`]));
        setResponseMessage("Database created successfully!");
        console.log("Database created successfully!");
      } else {
        setError(data.errorDetails || "Unknown error");
        setLogData(flattenLogData(data.errorDetails || "Unknown error"));
      }

    } catch (err: any) {
      console.error("Catch Block Error:", err);
      setError(err.message || "Failed to create database");
    }
  };

  const HandleRemoveDatabase = async () => {
    setError("");
    setResponseMessage('');
    setLogData([]);
    setLoading(true)
    try {
      const response = await fetch(`${Base_Url}/remove-db`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },

      });
      setLoading(false)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorDetails || "Failed to Remove database");
      }

      const data = await response.json();
      console.log("Response:", data);

      if (data.success) {
        setError('');
        setLogData(flattenLogData([`${data.message}`]));
        setResponseMessage("Database Removed successfully!");
        console.log("Database Removed successfully!");
      } else {
        setError(data.errorDetails || "Unknown error");
        setLogData(flattenLogData(data.errorDetails || "Unknown error"));
      }

    } catch (err: any) {
      console.error("Catch Block Error:", err);
      setError(err.message || "Failed to Remove database");
    }
  };





  const navigate = useNavigate()
  return (
    <div className='d-flex    justify-content-center w-100' >

      <div className=' w-50 upload-body border'>
        <div className=' d-flex  justify-content-between align-items-center'>
          <h4 className=' ms-1 justify-self-center '><b><Label uniqueName={''} label={'Manage Database'}></Label></b></h4>
          <Button disabled={loading} variant={'contained'} className='upload-btn justify-self-end me-1' onClick={() => { navigate("/search") }}><Label uniqueName={'Search'} label={'Search'}></Label></Button>
        </div>
        <div className='d-flex justify-content-between align-items-center mt-1'>
          <div className=''>
            <p className='errMsg'>{error !== "" && `*` + error}</p>
            <p className='successMsg'>{responseMessage}</p>
          </div>
          <p className='me-1'>{loading ? <p className='d-flex align-items-center'>
            <img src='./assets/loading.gif' className='buffer-img'></img>
            <Label uniqueName={"Loading..."} label={"Loading..."}></Label>
          </p>
            : executionTime > 0 && <Label uniqueName={" Time Taken - "} label={` Time Taken - ${executionTime}`}></Label>}</p>

        </div>
        <hr></hr>
        <div className='upload-form-main' >
          <div className='d-flex d-flex-column justify-content-center' >
            <p><u><Label uniqueName={''} label={'Create Database'}></Label></u></p>
            <div className=' d-flex align-items-center  justify-content-between  ' >

              <EditTextControl tooltip='Database Name' uniqueName={''} label='Database Name' disabled={loading} value={dbName} data={dbName} placeHolder='Database Name' handleValueChange={(newValue: string, name: string, isDefault: boolean) => { console.log(newValue); setDBName(newValue); setError('') }} isRenderAsForm={true}></EditTextControl>

              <Button onClick={HandleCreateDatabase} title='Create Database in Cloudflare' disabled={loading || dbName == ""} variant={'contained'} className='upload-btn align-self-end mt-1'>
                <Label uniqueName={'create Database'} label={'Create'}></Label></Button>
            </div>

            <div className='d-flex justify-content-center align-items-center upload-file mb-1 mt-1' >


            </div>

          </div>


          <div className='d-flex d-flex-column justify-content-center' >

            <p><u><Label uniqueName={''} label={'Upload Database'}></Label></u></p>
            <div className='d-flex align-items-end upload-file' >
              <EditTextControl uniqueName={'UploadFileName'} label='File Name' disabled={true} value={fileName} nameDesc='Table Name' isRenderAsForm={true} placeHolder='Uploaded File Name' ></EditTextControl>
              <BrowseFileControl defaultFile={file} uniqueName={'UploadData'} disabled={loading} multiple={true} isRenderAsForm={false} w={'100'} h={'30px'} fileTypeAccepts={".json"} handleValueChange={handleFileChange}  ></BrowseFileControl>
              <Button variant={'contained'} disabled={loading} className='upload-btn' title='Import Table in json' onClick={handleFileUpload} >  <Label uniqueName={"Import"} label={"Import"}></Label></Button>
            </div>
            <div className=' d-flex align-items-center  justify-content-between  ' >

              <p><Label label='Export Database' uniqueName={'ct'}></Label></p>

              <Button onClick={HandleJsonBackup} title='Export Tables in json from Cloudflare' disabled={loading} variant={'contained'} className='upload-btn align-self-end mt-1'><Label uniqueName={'Export Json Tables'} label={'Export'}></Label></Button>
            </div>

          </div>


          <div className='d-flex d-flex-column  mt-1 mb-1'>
            <p className=' align-self-start mt-1'><u><Label uniqueName={'Backup and Restore Database'} label={'Backup and Restore Database'}></Label></u></p>
            <div className='d-flex align-items-end upload-file w-100 '>
              <EditTextControl uniqueName={'UploadFileName'} label='Database File Name' disabled={true} value={dbFileName} nameDesc='Database File' isRenderAsForm={true} placeHolder='Uploaded File Name' ></EditTextControl>
              <BrowseFileControl defaultFile={dbFile} uniqueName={'UploadDbData'} disabled={loading} multiple={false} isRenderAsForm={false} w={'240'} h={'30px'} fileTypeAccepts={".sql"} handleValueChange={handleDatabseFileChange}  ></BrowseFileControl>
              <Button onClick={HandleRestore} title='Upload Database' variant={'contained'} disabled={loading} className='upload-btn'><Label uniqueName={'Upload Database'} label={'Upload'}></Label></Button>


            </div>
            <div className=' d-flex align-items-center  justify-content-between  ' >

              <p><Label label='Download Database' uniqueName={'ct'}></Label></p>

              <Button onClick={HandleExport} title='Download Database' disabled={loading} variant={'contained'} className='upload-btn align-self-end mt-1'><Label uniqueName={'Download Database'} label={'Download'}></Label></Button>
            </div>

          </div>
          <div className=' upload-footer-main mt-1 mb-1'>
            <p className='align-self-start'><u><Label uniqueName={''} label={'Remove and Clear Database'}></Label></u></p>
            <div className=' d-flex align-items-center  justify-content-between upload-footer-inner mt-1' >

              <p><Label label='Clear All Tables' uniqueName={'ct'}></Label></p>
              <Button disabled={loading} variant={'contained'} title={'Clear All Tables from Cloudflare'} className='upload-btn justify-self-end' onClick={HandleClearFn}><Label uniqueName={'Clear All Tables'} label={'Clear'}></Label></Button>
            </div>

            <div className=' d-flex align-items-center  justify-content-between upload-footer-inner mt-1' >

              <p><Label label='Remove Database' uniqueName={'ct'}></Label></p>
              <Button disabled={loading} variant={'contained'} title={'Remove Database from Cloudflare'} className='upload-btn justify-self-end' onClick={HandleRemoveDatabase}><Label uniqueName={'Remove Database'} label={'Remove'}></Label></Button>
            </div>

          </div>
        </div></div>
      <div className='d-flex d-flex-column align-self-center upload-msg-main mt-1'>
        {logData.length > 0 && logData.map((val, index) => (<p key={index} >{val}</p>))}
      </div>
    </div>

  )
}

export default Upload