import React,{ useEffect, useState } from 'react';
// import '../../App.css';
import { IoIosAddCircle, IoMdAttach } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { FaFileDownload } from "react-icons/fa";
import axios from 'axios';
import { Base_Url } from '../../Common/Api';
import { TbDatabaseImport, TbDatabaseExport } from 'react-icons/tb';


const UploadNew = () => {
  const [open, setOpen] = useState(false);
  const [databaseval, setDatabaseval] = useState("");
  const [databases, setDatabases] = useState([]);
  const [selectedInstanceDb, setSelectedInstanceDb] = useState("");
  const [selectedDb, setSelectedDb] = useState("");

  const database = () => {
    setOpen(!open);
  };

  const createdatabase = async () => {
    if (databaseval.trim() === "") {
      alert("Please enter database name");
      return;
    }
    try {
      const response = await axios.post(`${Base_Url}/database/create`, { name: databaseval });
      console.log("createdatabase ==>", response);
      if (response.status === 200) {
        alert(response.data.message);
        showDatabase();
      }
    } catch (err) {
      try {
        const errorString = err.response.data.error; // The full error string
        const jsonMatch = errorString.match(/{.*}/s); // Extract JSON part safely

        if (jsonMatch) {
          const errorDetails = JSON.parse(jsonMatch[0]); // Parse extracted JSON
          const errorMessage = errorDetails.errors?.[0]?.message || "Unknown error occurred";

          alert(errorMessage);
        } else {
          alert("Error: " + errorString); // Fallback to showing raw error string
        }
      } catch (e) {
        console.error("Error parsing response:", e);
        alert("An error occurred while processing the response.");
      }
    }

    setOpen(false);
    setDatabaseval("");
  };

  const databaseDelete = async () => {
    const data = await window.confirm("Are you sure delete the database");
    if (data) {
      try {
        const response = await axios.delete(`${Base_Url}/database/${selectedDb}`);
        console.log("createdatabase ==>", response);
        alert(response.data.message);
        showDatabase();
      } catch (err) {
        console.log(err);
        alert(err.response.data.message);
      }
    }
  };

  const showDatabase = async () => {
    try {
      const response = await axios.get(`${Base_Url}/databases`);
      console.log("showDatabase ==>", response);
      if (response.status === 200) {
        setDatabases(response.data.databases);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const databaseDownload = async () => {
    try {
      const response = await axios.post(
        `${Base_Url}/database-export-sql`,
        { database_id: selectedDb },
        { responseType: "blob" } // 👈 Ensures we get raw data
      );

      if (response.status === 200) {
        // Create a downloadable SQL file
        const blob = new Blob([response.data], { type: "text/sql" }); // 👈 Correct MIME type
        const url = window.URL.createObjectURL(blob);

        // Create a temporary download link
        const a = document.createElement("a");
        a.href = url;
        a.download = "database_backup.sql"; // Ensure correct file name
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.log("Error exporting database:", error);
      alert("Failed to export database!");
    }
  };

  const databaseAttached = async () => {
    try {
      const response = await axios.post(`${Base_Url}/bind-database`, { "database_id": selectedInstanceDb });
      console.log("showDatabase ==>", response);
      if (response.status === 200) {
        alert(response.data.message);
      }
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    }
  };

  const databaseDetached = async () => {
    try {
      const response = await axios.post(`${Base_Url}/unbind-database`, { "database_id": selectedInstanceDb });
      console.log("showDatabase ==>", response);
      if (response.status === 200) {
        alert(response.data.message);
      }
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    }
  };

  const databasePurge = async () => {
    try {
      const response = await axios.delete(`${Base_Url}/purge-tables/${selectedInstanceDb}`);
      console.log("databasePurge", response);
      if (response.status === 200) {
        alert(response.data.message);
      }
    } catch (err) {
      alert(err.response.data.message);
      console.log(err);
    }
  };

  useEffect(() => {
    showDatabase();
  }, []);

  return (
   <>
      <div className="title">
        <h2 title="What you are developing for managing databases">What you are developing for <span className='manage'>managing databases</span></h2>

        <div className='list'>
          <ul>
            <div className='database'>
              <li title="Create a Database">Create a Database</li>
              <IoIosAddCircle
                onClick={() => database()}
                className='database-icon' style={{ cursor: "pointer", margin: "5px", fontSize: "large" }} />

            </div>
            <div className='database'>
              <li title='Show all databases (managed in your instance of Cloudflare)'>Show all databases (managed in your instance of Cloudflare)</li>
              <select >
                <option value="">All Databases</option>
                {
                  databases.length > 0 && databases.map((val) => (
                    <option disabled value={val.id} key={val.id}>{val.name}</option>
                  ))
                }

              </select>
            </div>
            <div className='database'>
              <li title="Select a Database">Select a Database</li>
              <select
                onClick={(e) => setSelectedDb(e.target .value)}>
                <option value="" >Select Databases</option>
                {
                  databases.length > 0 && databases.map((val) => (
                    <option value={val.id} key={val.id}>{val.name}</option>
                  ))
                }
              </select>
            </div>
            <div className='database'>
              <li title='Delete selected Database'>Delete selected Database </li>
              <MdDelete
                onClick={() => selectedDb !== "" && databaseDelete()}
                className='database-icon' style={{ cursor: (selectedDb === "" ? "not-allowed" : "pointer"), margin: "5px", fontSize: "large" }}
              />
            </div>
            <div className='database'>
              <li title='Download selected database'>Download selected database </li>
              <FaFileDownload onClick={() => selectedDb !== "" && databaseDownload()}
                className='database-icon' style={{ cursor: (selectedDb === "" ? "not-allowed" : "pointer"), margin: "5px", fontSize: "large" }}
              />
            </div>
          </ul>
        </div>
        <hr />
        <div className='mt-1'>
          <h2 title="Managing Worker, What you are developing for worker"><span className='manage'>Managing Worker,</span> What you are developing for worker managing databases</h2>

          <div className='list'>
            <ul>

              <div className='database'>
                <li title='Show all available databases (managed in Cloudflare instance)'>Show all available databases (managed in Cloudflare instance)</li>
                <select>
                  <option value="">All Databases</option>
                  {
                    databases.length > 0 && databases.map((val) => (
                      <option disabled value={val.id} key={val.id}>{val.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className='database'>
                <li title="Select a Database (managed in Cloudflare instance)">Select a Database (managed in Cloudflare instance)</li>
                <select
                  onClick={(e) => setSelectedInstanceDb(e.target.value)}>
                  <option value="">Select a Database</option>
                  {
                    databases.length > 0 && databases.map((val) => (
                      <option value={val.id} key={val.id}>{val.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className='database'>
                <li title='Attach Database with worker'>Attach Database with worker </li>
                <IoMdAttach
                  onClick={() => selectedInstanceDb !== "" && databaseAttached()}
                  className='database-icon' style={{ cursor: (selectedInstanceDb === "" ? "not-allowed" : "pointer"), margin: "5px", fontSize: "large" }}
                />
              </div>
              <div className='database'>
                <li title='Detach Database from worker'>Detach Database from worker </li>
                <IoMdAttach onClick={() => selectedInstanceDb !== "" && databaseDetached()}
                  className='database-icon' style={{ cursor: (selectedInstanceDb === "" ? "not-allowed" : "pointer"), margin: "5px", fontSize: "large" }}
                />
              </div>
              <div className='database'>
                <li title='Purge an attached Database (delete all its tables)'>Purge an attached Database (delete all its tables) </li>
                <MdDelete onClick={() => databasePurge()}
                  className='database-icon' style={{ cursor: "pointer", margin: "5px", fontSize: "large" }}
                />
              </div>
              <div className='populate-database'>
                <li title='populate Database'>Populate Database :</li>

                <dl className=''>
                  <div className='database1'>
                    <dt>Import json data to all Database/tables</dt>
                    <TbDatabaseImport className='database-icon' style={{ cursor: "pointer", margin: "5px", fontSize: "large" }}></TbDatabaseImport>
                  </div>
                  <div className='database1'>
                    <dt>Export json data from all Database/tables</dt>
                    <TbDatabaseExport className='database-icon' style={{ cursor: "pointer", margin: "5px", fontSize: "large" }}></TbDatabaseExport>
                  </div>
                  <dt>Import data/sql scripts to populate all Database/tables</dt>
                  <dt>Export data/sql scripts for all Database/tables</dt>
                </dl>
              </div>
            </ul>
          </div>
        </div>
      </div>
      <div>
      {open && (
        <div className='pop-up'>
          <div className='db-name'>
            <h3>Create Database</h3>
            <input
              type='text'
              name="database"
              value={databaseval}
              onChange={(e) => setDatabaseval(e.target.value)}
              placeholder='Enter Database Name' />
            <div className='db-button'>
              <button onClick={createdatabase}>Create</button>
              <button onClick={database}>Cancel</button>
            </div>
          </div>
        </div>
      )}</div>
    </>
  );
}

export default UploadNew;