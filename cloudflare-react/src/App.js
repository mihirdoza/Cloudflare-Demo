import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import axios from "axios";
import Draggable from "react-draggable";
import CustomDropdown from "./component/DropDown";
import Loader from "./loader";

function ManufacturerSearch() {
  const [keywords, setKeywords] = useState("");
  const [condition, setCondition] = useState("OR");
  const [filterResult, setFilterResult] = useState([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const nodeRef = useRef(null);

  const handleSearch = async () => {
    setLoading(true)
    const startTime = performance.now();
    try {
      const res = await axios.post(
        "https://workers.rahul-p-dd9.workers.dev/selected_manufacturer",
        {
          selectedManufacturer: selectedManufacturer,
          selectedEquipmentType: selectedEquipmentType,
          selectedProductLine: selectedProductLine,
          selectedProductNumber: selectedProductNumber,
          condition:condition,
          keywords:keywords,
        }
      );
      console.log("responce===>", res);
      const response = res?.data;
      setFilterResult(response);
      setShowModal(true);
  
      const endTime = performance.now();
      setExecutionTime(((endTime - startTime) / 1000).toFixed(2));
    } catch (err) {
      console.log(err);
    }
    finally{
      setLoading(false)
    }
  };

  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  
  const [attribute,setAttribute]=useState('')

  const [equipmentType, setEquipmentType] = useState([]);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState("");

  const [productLine, setProductLine] = useState([]);
  const [selectedProductLine, setSelectedProductLine] = useState("");

  const [productNumber, setProductNumber] = useState([]);
  const [selectedProductNumber, setSelectedProductNumber] = useState("");

  const [allEquipmentData, setAllEquipmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log("manufacturers", manufacturers);
  console.log("selectedManufacturer", selectedManufacturer);
  const manufacturerApi = async () => {
    setLoading(true)
    try {
      const startTime = performance.now();
      // https://wandering-meadow-b4e6.rahul-p-dd9.workers.dev
      const response = await axios.post(
        "https://workers.rahul-p-dd9.workers.dev/manufacturer",
        {
          // apiToken:'7rIiBBGVbZu8Mo9fB1sTuEelJHo_PwU64HSYtBlN',
          // accountId:"dd9b190e5bb824e610cd76610082c40b",
          // databaseId:'dcc9bc13-e2fa-4687-8c6e-9b43fda04a58',
          search: keywords,
          condition: condition,
        }
      );
      console.log("response", response);
      console.log("response1", response?.data.manufacturers);
      const allManufacturers = await response?.data?.manufacturers;
      console.log(allManufacturers);
      const manufacturerNames = [
        ...new Set(allManufacturers?.map((item) => item)),
      ];
      setManufacturers(manufacturerNames);
      const endTime = performance.now();
      setExecutionTime(((endTime - startTime) / 1000).toFixed(2));
      setSelectedManufacturer('')
      setSelectedEquipmentType('');
      setEquipmentType('')
      setSelectedProductLine('');
      setProductLine('')
      setSelectedProductNumber('')
      setProductNumber('')
    } catch (err) {
      console.log("err", err);
    }
    finally{
      setLoading(false)
    }
  };
  const EquipmentApi = async () => {
    setLoading(true)
    try {
      const startTime = performance.now();
      // "http://localhost:6600/api/quipment"  local path
      const response = await axios.post(
        "https://workers.rahul-p-dd9.workers.dev/equipment",
        { Manufacturer: selectedManufacturer, condition : condition,keywords:keywords }
      );
      console.log("allEquipment response +++>", response.data);
      const allEquipment = response?.data;
      setAllEquipmentData(allEquipment);

      const equipmentNames = [
        ...new Set(allEquipment.map((item) => item.EQType)),
      ];
      setEquipmentType(equipmentNames);

      const productNames = [
        ...new Set(allEquipment.map((item) => item.MfgProdLine)),
      ];
      setProductLine(productNames);

      const productNumberNames = [
        ...new Set(allEquipment.map((item) => item.MfgProdNo)),
      ];
      setProductNumber(productNumberNames);

      const endTime = performance.now();
      if (selectedManufacturer != "") {
        setExecutionTime(((endTime - startTime) / 1000).toFixed(2));
      }
    } catch (err) {
      console.log("err", err);
    }
    finally{
      setLoading(false)
    }
    
  };

  useEffect(() => {
    manufacturerApi();
    // callCloudflareAPI()
  }, []);
  useEffect(() => {
    if (selectedManufacturer != '') {
      EquipmentApi();
    }
  }, [selectedManufacturer]);

  useEffect(() => {
    if (selectedEquipmentType) {
   
      const filteredData = allEquipmentData.filter(
        (item) => item.EQType === selectedEquipmentType
      );
    
  console.log('filteredData',filteredData )
      setProductLine([...new Set(filteredData.map((item) => item.MfgProdLine))]);
      setProductNumber([...new Set(filteredData.map((item) => item.MfgProdNo))]);
    } else {
 
    }
  }, [selectedEquipmentType, allEquipmentData]);
  useEffect(() => {
    if (selectedProductLine) {
      const filteredData = allEquipmentData.filter(
        (item) => item.MfgProdLine === selectedProductLine &&(!selectedEquipmentType || item.EQType === selectedEquipmentType))
      setProductNumber([...new Set(filteredData.map((item) => item.MfgProdNo))]);
    } else {
    }
  }, [selectedProductLine, allEquipmentData]);
 
  return (
    <div className="container  mt-5 position-relative d-flex justify-content-center ">
       {loading && <Loader/>}
      <div className="p-4 shadow main-manufacturer">
        <h3 className="mb-4">Manufacturer Search</h3>
        <div className="mb-3 d-flex w-100">
          <label className="form-label w-30">Enter Keywords :</label>
          <div className=" d-flex w-70  justify-content-between">
            <input
              type="text"
              className="w-75"
              style={{ width: "max-content" }}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <button
              className=" ms-3 w-25"
              onClick={() => {
                manufacturerApi();
              }}
            >
              Search
            </button>
          </div>
        </div>
        <div className="mb-3  d-flex  align-items-center">
          <label className="form-label w-30">Condition :</label>
          <div className=" w-70">
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                value="AND"
                id='and'
                checked={condition === "AND"}
                onChange={(e) => setCondition(e.target.value)}
              />
              <label htmlFor="and" className="form-check-label" >AND</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="radio"
                className="form-check-input"
                value="OR"
                id="or"
                checked={condition === "OR"}
                onChange={(e) => setCondition(e.target.value)}
              />
              <label htmlFor="or" className="form-check-label">OR</label>
            </div>
          </div>
        </div>

        <CustomDropdown
          count={manufacturers.length}
          options={manufacturers}
          label="Manufacturer"
          value={selectedManufacturer}
          showLength={true}
          onChange={(value) => (
            setSelectedManufacturer(value),
            setSelectedEquipmentType(""),
            setSelectedProductLine(""),
            setSelectedProductNumber("")
          )}
          placeholder="Select Manufacturer"
        />

        <CustomDropdown
          count={equipmentType.length}
          options={equipmentType}
          label="Equipment"
          showLength={true}
          value={selectedEquipmentType}
          onChange={(value) => (
            setSelectedEquipmentType(value),
            setSelectedProductLine(""),
            setSelectedProductNumber("")
          )}
          placeholder="Select Equipment"
        />

        <CustomDropdown
          count={productLine.length}
          options={productLine}
          label="ProductLine"
          showLength={true}
          value={selectedProductLine}
          onChange={(value) => (
            setSelectedProductLine(value), setSelectedProductNumber("")
          )}
          placeholder="Select Product Line"
        />

        <CustomDropdown
          count={productNumber.length}
          options={productNumber}
          label="ProductNumber"
          showLength={true}
          value={selectedProductNumber}
          onChange={(value) => setSelectedProductNumber(value)}
          placeholder="Select Product Number"
        />

<CustomDropdown
          count={productNumber.length}
          options={['All', 'Racks/Cabinets', 'Rackmountable', 'Cards/Modules']}
          label="ProductNumber"
          showLength={false}
          value={attribute}
          onChange={(value) => setAttribute(value)}
          placeholder="Filter By Attribute"
        />

        <div className="mb-3 d-flex  align-items-center">
          <label className="form-label w-30 ">Search Result</label>
          <button
            className="justify-self-start"
            onClick={handleSearch}
            disabled={!selectedManufacturer}
          >
            Search
          </button>
        </div>

        <div className="mt-3 d-flex">
          <label className="form-label w-30">Total Seconds</label>
          <p className="">{executionTime}</p>
        </div>
      </div>

      {showModal && (
        <Draggable
          bounds={{ top: -10, left: -300, right: 300, bottom: 100 }}
          nodeRef={nodeRef}
        >
          <div
            ref={nodeRef}
            className="table-main position-absolute top-0 bg-white d-flex flex-column shadow z-3 "
            style={{ padding: "20px", width: "80%", maxWidth: "800px" }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mx-4">
              <h5>Search Results ({filterResult.length})</h5>
              <button
                className="btn btn-danger"
                onClick={() => setShowModal(false)}
              >
                X
              </button>
            </div>

            {/* Table */}
            <div className="table-main1 p-1">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>EQID</th>
                    <th>Manufacturer</th>
                    <th>EQType</th>
                    <th>MfgProdLine</th>
                    <th>MfgProdNo</th>
                    <th>ShapeID</th>
                  </tr>
                </thead>
                <tbody>
                  {filterResult.length !== 0 ? (
                    filterResult.map((item, index) => (
                      <tr key={index}>
                        <td>{item.EQID}</td>
                        <td>{item.Manufacturer}</td>
                        <td>{item.EQType}</td>
                        <td>{item.MfgProdLine}</td>
                        <td>{item.MfgProdNo}</td>
                        <td>{item.ShapeID}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>No Data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
}

export default ManufacturerSearch;
