import React, { useEffect, useState } from 'react'
import { BrowseFileControl } from '../DisplayControls/BrowseFileControl/BrowseFileControl'
import { useNavigate } from 'react-router-dom'
import EditTextControl from '../DisplayControls/EditTextControl/EditTextControl'
import { Base_Url } from '../../Common/Api'
import ComboboxControl from '../DisplayControls/ComboBoxControl/ComboBoxControl'
import JSZip from 'jszip'
import { Button } from '@mui/material'
import Label from '../Label/Label'


const Upload = () => {
  const [file, setFile] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [fileName, setFileName] = useState<any>("")
  const [responseMessage, setResponseMessage] = useState<any>("")
  const [error, setError] = useState<any>("")
  const [uploadDBLoading, setUploadDBLoading] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [logData, setLogData] = useState<any[]>([])
  const [tables,setTables]=useState<any[]>([]);
  const [selectedTable,setSelectedTable]=useState<any>('')
  const [dbFile,setDbFile]=useState<any[]>([])
  const [dbFileName, setDbFileName] = useState<any>("")



 

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

  


  const HandleGetTables=async()=>{
    try{
      const response = await fetch(`${Base_Url}/tables`, {
        method: "GET",
       
      }).then(async(res)=>{
        const resjson=await res.json()
        const arr:any=[]
       await resjson.tables.map((val:any)=>{
            arr.push(val.name)
        })
         setTables(arr)
        console.log(resjson)

      })
      .catch((err)=>{
        console.log(err)
      })
    }
    catch(err:any){
      setError(err.message)
      console.log(err)
    }
  }



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


  const HandleClearFn =async() => {
    setExecutionTime(0)
    setFileName("");
    setSelectedTable("");
    setResponseMessage("");
    setError("");
    setFile([]);
    setLogData([]);

    try{
      const response = await fetch(`${Base_Url}/clear-database`, {
        method: "DELETE",
       
      }).then(async(res)=>{
        const data = await res.clone().json();
        console.log(data)
        setLogData(flattenLogData(data.logData))
        setResponseMessage("Database all table Clear successfully!")
        console.log("Database Clear successfully!");
      

      })
      .catch((err)=>{
        console.log(err)
      })
    }
    catch(err:any){
      setError(err.message)
      console.log(err)
    }
  
    

  }

  const handleFileUpload = async () => {

    setError("")
    setResponseMessage("")
    setLogData([])
    console.log(file, selectedTable)
    if (file.length === 0 || selectedTable === "") {
      if (file.length === 0 && selectedTable === "") {
        alert("Please select a file to upload \nAdd Table Name")
      }
      else if (file.length === 0) {
        alert("Please select a file to upload")
      }
      else {
        alert("Add Table Name")
      }
      return;
    }
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



    const HandleBackup = async () => {
      setError("")
    setResponseMessage("")
    setLogData([])
    const startTime = performance.now();
      try {
        const response = await fetch(`${Base_Url}/export`, {
          method: "GET",
        });
        const endTime = performance.now();
        setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));
        if (!response.ok) {
          const data = await response.json();
          setError(data.error)
                  const logDetails = await flattenLogData(data.logData)
                  setLogData(logDetails)
                  console.log("response :", data)
                  setError(`Upload failed: ${logDetails[logDetails.length - 1]}`)
                  setLoading(false)
               
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
      } catch (error:any) {
        setLoading(false)
        setError(error.message)
        console.error("Error exporting database:", error);
        alert("Failed to export database!");
      }
    };



    const handleDatabseFileChange = async (fileDataArray: any[], name: any, isDefault: any) => {
      setDbFile([]); // Reset previous files
    
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
            if (file.extension === "zip") {
              try {
                setDbFileName(file.fullName);
                const zip = new JSZip();
                const zipData = await zip.loadAsync(file.fileContentBlob, { base64: true });
    
                let extractedFiles: any[] = [];
    
                for (const fileName in zipData.files) {
                  if (fileName.endsWith(".json")) {
                    const fileContent = await zipData.files[fileName].async("string");
                    const parsedData = JSON.parse(fileContent);
                    extractedFiles.push({ fileName, fileContentBlob: parsedData });
                  }
                }
    
                if (extractedFiles.length === 0) {
                  throw new Error("No JSON files found in ZIP.");
                }
    
                // Store both ZIP file and extracted JSON data
                setDbFile((prevFiles: any[]) => [
                  ...prevFiles,
                  {
                    originalZip: file.fileContentBlob, // Store original ZIP
                    fileName: file.fullName,
                    extractedFiles,
                  },
                ]);
    
              } catch (error: any) {
                console.error(`Error extracting ZIP file at index ${index}:`, error);
                setError(`Error extracting ZIP file: ${error.message}`);
              }
            } else {
              // Directly use the Base64 string for non-ZIP files
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
      
      if (dbFile.length === 0) {
        setLoading(false);
        setError("No file selected for restoration.");
        return;
      }
      
      setUploadDBLoading(true)
      try {
        const formData = new FormData();
        
        // Retrieve the ZIP file from dbFile
        const zipFile = dbFile[0];
        const byteCharacters = atob(zipFile.originalZip); // Decode Base64
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const zipBlob = new Blob([byteArray], { type: "application/zip" });
    
        // Append to FormData
        formData.append("database", zipBlob, zipFile.fileName);
        const startTime = performance.now();
        // API call
        const response = await fetch(`${Base_Url}/import`, {
          method: "POST",
          body: formData,
        });
        const endTime = performance.now();
        setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));
    if(response.ok){
      const data = await response.clone().json();
        console.log(data)
        setLogData(flattenLogData(data.logData))
        setResponseMessage("Database Restored successfully!")
        setUploadDBLoading(false)
    }

    setUploadDBLoading(false)
        console.log(response);
      } catch (error: any) {
        setUploadDBLoading(false)
        setError(`Failed to restore database: ${error.response?.data?.message || error.message}`);
        console.error("Error restoring database:", error);
      }
    };
    


  useEffect(()=>{
HandleGetTables();
  },[])


  const navigate = useNavigate()
  return (
    <div className='d-flex d-flex-column align-items-center  justify-content-center w-100' >

      <div className=' w-100 upload-body border'>
        <div className=' d-flex d-flex-column upload-body-inner'>
            <Button disabled={loading} variant={'contained'} className='upload-btn' onClick={() => { navigate("/") }}><Label uniqueName={'Back'} label={'Back'}></Label></Button>
        </div>
        <p className='errMsg'>{error}</p>
        <p className='successMsg'>{responseMessage}</p>
        <div className='upload-form-main' >
          <div className='d-flex d-flex-column justify-content-center' >
          <ComboboxControl uniqueName='Table Name' label={`Select Table (${tables.length})`} value={selectedTable} optionsData={tables} type='string' handleValueChange={(value, action) => {
            console.log("Combobox changed:", value, action);
            setSelectedTable(value)
          }} nameDesc={`Table Name`}></ComboboxControl>
          
            <div className='d-flex align-items-end upload-file' >
              <EditTextControl uniqueName={'UploadFileName'} label='File Name' disabled={true} value={fileName} nameDesc='Table Name' isRenderAsForm={true} placeHolder='Uploaded File Name' ></EditTextControl>
              <BrowseFileControl defaultFile={file} uniqueName={'UploadData'} disabled={loading} multiple={true} isRenderAsForm={false} w={'100'} h={'30px'} fileTypeAccepts={".json"} handleValueChange={handleFileChange}  ></BrowseFileControl>
            </div>

          </div>
          <div className=' d-flex align-items-center  justify-content-between upload-footer-main'>
            <p>{loading||uploadDBLoading ? <Label uniqueName={"Loading..."} label={"Loading..."}></Label> : executionTime > 0 &&<Label uniqueName={" Time Taken - "} label={` Time Taken - ${executionTime}`}></Label> }</p>
            <div className=' d-flex align-items-center  justify-content-between upload-footer-inner' >
              {loading ? <img src='./assets/loading.gif' className='buffer-img'></img> : <Button variant={'contained'} disabled={loading} className='upload-btn' title='Import Table in json' onClick={handleFileUpload} >  <Label uniqueName={"Import"} label={"Import"}></Label></Button>}
              {/* <Button disabled={loading} title='Export Table in json' variant={'contained'} className='upload-btn' onClick={HandleExportTable} >Export</Button> */}
              <Button disabled={loading} variant={'contained'} title={'Clear All Tables'} className='upload-btn' onClick={HandleClearFn}><Label uniqueName={'Clear All Tables'} label={'Clear All Tables'}></Label></Button>
              </div></div>

              <div className='d-flex d-flex-column justify-content-between align-items-center'>
                <p><Label uniqueName={'Backup and Restore DataBase'} label={'Backup and Restore DataBase'}></Label></p>
                <div className='d-flex align-items-end upload-file w-100 ' >
              <EditTextControl uniqueName={'UploadFileName'} label='Database File Name' disabled={true} value={dbFileName} nameDesc='DataBase File' isRenderAsForm={true} placeHolder='Uploaded File Name' ></EditTextControl>
              <BrowseFileControl defaultFile={dbFile} uniqueName={'UploadDbData'} disabled={loading} multiple={false} isRenderAsForm={false} w={'240'} h={'30px'} fileTypeAccepts={".zip"} handleValueChange={handleDatabseFileChange}  ></BrowseFileControl>
              { uploadDBLoading? <img src='./assets/loading.gif' className='buffer-img'></img> :  <Button onClick={HandleRestore} variant={'contained'} disabled={uploadDBLoading}  className='upload-btn'><Label uniqueName={'Upload DataBase'} label={'Upload DataBase'}></Label></Button>}
              
              
            </div>
            <Button onClick={HandleBackup} disabled={uploadDBLoading} variant={'contained'} className='upload-btn align-self-end mt-1'><Label uniqueName={'Download DataBase'} label={'Download DataBase'}></Label></Button>
          
              </div> 
        </div></div>
      <div className='d-flex d-flex-column align-self-start upload-msg-main'>
        {logData.length > 0 && logData.map((val, index) => (<p key={index} >{val}</p>))}
      </div>
    </div>

  )
}

export default Upload