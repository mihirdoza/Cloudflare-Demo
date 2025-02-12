
import React, { useEffect, useState } from "react";

import "../../App.css";
import { useNavigate } from "react-router-dom";
import ComboboxControl from "../DisplayControls/ComboBoxControl/ComboBoxControl";
import { searchProps } from '../../SampleDataset/TestDirtyFlag';
import SearchControl from "../SearchControl/SearchControl";
import SearchResultsModal from "../DeviceGridModal/DeviceGridModal";
import { Base_Url } from "../../Common/Api";
import { ToggleControl } from "../DisplayControls/ToggleControl/ToggleControl";
import filterByAttribute from "../../JsonData/filterByAttribute.json";
import { SearchDatacolDef } from "./config";
import { valueOfKey } from "../../Common/fnValueOfKey";
import Label from "../Label/Label";
import { EquipmentData } from "../../Interfaces/Ihome";
import { Button } from "@mui/material";
console.log(filterByAttribute)



const Home: React.FC = () => {
  const [keywords, setKeywords] = useState<string>("");
  const [condition, setCondition] = useState<any>("OR");
  const [filterResult, setFilterResult] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchControlProps, setSearchControlProps] = useState<any>(searchProps);
  const [lensValue, serLensValue] = useState<string>('')
  const [isRelated,setIsRelated]=useState<boolean>(false)

const [selectFBA,setSelectFBA]=useState<any>('All') // FBA = filter by attribute
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");

  const [equipmentType, setEquipmentType] = useState<string[]>([]);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>("");

  const [productLine, setProductLine] = useState<string[]>([]);
  const [selectedProductLine, setSelectedProductLine] = useState<string>("");

  const [productNumber, setProductNumber] = useState<string[]>([]);
  const [selectedProductNumber, setSelectedProductNumber] = useState<string>("");

  const [allEquipmentData, setAllEquipmentData] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<any>("");

  const navigate = useNavigate();

  const searchValueChange = (value: any) => {
    console.log("searchValueChange", value)
    setKeywords(value)
    serLensValue(value)
    setSearchControlProps({ ...searchControlProps, lensDirty: value ? true : false });

  }
  const handleFilterMouse = () => {
    alert('filter icon click')
  }
  const handleLensMouse = () => {
    manufacturerApi()
    setSelectedManufacturer("");
    setSelectedEquipmentType("");
    setEquipmentType([]);
    setSelectedProductLine("");
    setProductLine([]);
    setSelectedProductNumber("");
    setProductNumber([]);
    setManufacturers([])
    setShowModal(false)

  }

  const handleSearch = async () => {
setErr('')
const filterAttribute=valueOfKey(filterByAttribute,selectFBA)
    console.log("remaining ~~>", manufacturers)
    setLoading(true);
    const startTime = performance.now();
    try {
      const response = await fetch(`${Base_Url}/selected_manufacturer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedManufacturer, 
          selectedEquipmentType,
          selectedProductLine,
          selectedProductNumber,
          condition,
          keywords,
          isRelated,
          filterAttribute
          
        }),
      });
      const result = await response.json()
      console.log(result)
      if(result.error){setErr(result)}
      setFilterResult(result);
      setShowModal(true);

      const endTime = performance.now();
      setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));
    } catch (error: any) {
      setErr(`Error:${error.message}`)
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const manufacturerApi = async () => {
   
    setLoading(true);
    try {
      const startTime = performance.now();
      const response = await fetch(`${Base_Url}/manufacturer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search: keywords,
          condition,
        }),
      });
      const result = await response.clone().json();
      if(result.error){setErr(result)}
      console.log(result)
      const allManufacturers = (result?.manufacturers ?? []) as string[];
      setManufacturers([...new Set<string>(allManufacturers)]);
      const endTime = performance.now();
      setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));
    } catch (error: any) {
      setErr(`Error:${error.message}`)
      console.error("Error fetching manufacturers:", error);
    } finally {
      setLoading(false);
    }
  };

  const equipmentApi = async () => {
    setLoading(true);
    try {
      const startTime = performance.now();
      const response = await fetch(`${Base_Url}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Manufacturer: selectedManufacturer,
          condition,
          keywords,
          isRelated,
        }),
      });
      const result: EquipmentData[] = await response.json();
      setAllEquipmentData(result);

      setEquipmentType([...new Set(result.map((item) => item.EQType))]);
      setProductLine([...new Set(result.map((item) => item.MfgProdLine))]);
      setProductNumber([...new Set(result.map((item) => item.MfgProdNo))]);
      const endTime = performance.now();
      setExecutionTime(Number(((endTime - startTime) / 1000).toFixed(2)));

      setSelectedProductLine('')
      setSelectedProductNumber('');
    } catch (error: any) {
      setErr(`Error:${error.message}`)
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    manufacturerApi();
    setErr('')
  }, []);

  useEffect(() => {
    
    if (selectedManufacturer) {
      equipmentApi();
      setSelectedEquipmentType("");
      setEquipmentType([]);
      setSelectedProductLine("");
      setProductLine([]);
      setSelectedProductNumber("");
      setSelectFBA("All");
    }
    setErr('')
  }, [selectedManufacturer]);


  useEffect(() => {
    setErr('')
    if (selectedEquipmentType) {
      const filteredData = allEquipmentData.filter((item) => item.EQType === selectedEquipmentType);
      setProductLine([...new Set(filteredData.map((item) => item.MfgProdLine))]);
      setProductNumber([...new Set(filteredData.map((item) => item.MfgProdNo))]);
    }
    setSelectedProductLine('')
    setSelectedProductNumber('');
  }, [selectedEquipmentType, allEquipmentData]);

  useEffect(() => {
    if (selectedProductLine) {
      const filteredData = allEquipmentData.filter(
        (item) =>
          item.MfgProdLine === selectedProductLine &&
          (!selectedEquipmentType || item.EQType === selectedEquipmentType)
      );
      setProductNumber([...new Set(filteredData.map((item) => item.MfgProdNo))]);
      setSelectedProductNumber('');
    }
    setErr('')
  }, [selectedProductLine, allEquipmentData]);



  const SelectedFilter = (val: any) => {
    console.log("handleselect", val)
    return setCondition(val);
  };

  const HandleRelatedValue=async(value: string, name: string, isDefault?: boolean)=>{
   setIsRelated(value=="1"?true:false)

  }




  return (
    <div>
      <div className="home-main" >

        <div className="main-manufacturer">

          <div className="d-flex justify-content-between align-items-center ">
            <h3 className="">  <Label uniqueName={"Manufacturer Search"} label={"Manufacturer Search"}></Label></h3>
            <Button onClick={() => { navigate("/upload") }} variant={'contained'}  className='upload-btn'>
               <Label uniqueName={"Upload"} label={"Upload"}></Label>
            </Button>
          </div>
          <p className='errMsg'>{err!==""&&err.error}</p>
          <SearchControl {...searchControlProps} SelectedRightMouseItem={SelectedFilter} searchInputValue={lensValue} handleLensMouse={handleLensMouse} handleFilterMouse={handleFilterMouse} searchValueChange={searchValueChange} isShowFilterControl={false}></SearchControl>
          <ToggleControl uniqueName={"Include Releted"} isRenderAsForm={true} value={`${isRelated}`} label={"Include Releted"}  handleValueChange={HandleRelatedValue} ></ToggleControl>
          <ComboboxControl isRenderAsForm={false} uniqueName='Manufacturer' label={`Manufacturer  (${manufacturers.length})`} value={selectedManufacturer} optionsData={manufacturers?.length > 0 ? manufacturers : []} type='string' handleValueChange={(value, action) => {
            console.log("Combobox changed:", value, action);

            setSelectedManufacturer(value)
          }} nameDesc={`Manufacturers`}   ></ComboboxControl>
          <ComboboxControl uniqueName='Equipment types' label={`Equipment Types (${equipmentType.length})`} value={selectedEquipmentType} optionsData={equipmentType} type='string' handleValueChange={(value, action) => {
            console.log("Combobox changed:", value, action);
            setSelectedEquipmentType(value)
          }} nameDesc={`EquipMent Types`}></ComboboxControl>
          <ComboboxControl uniqueName='Product line' label={`Product Line (${productLine.length})`} value={selectedProductLine} optionsData={productLine} type='string' handleValueChange={(value, action) => {
            console.log("Combobox changed:", value, action);
            setSelectedProductLine(value)
          }} nameDesc={`Product Line`}></ComboboxControl>
          <ComboboxControl uniqueName='Product number' label={`Product Number (${productNumber.length})`} value={selectedProductNumber} optionsData={productNumber} type='string' handleValueChange={(value, action) => {
            console.log("Combobox changed:", value, action);
            setSelectedProductNumber(value)

          }} nameDesc={`Product Number`}></ComboboxControl>

<ComboboxControl uniqueName='Filter By Attribute' label={`Filter By Attribute (${filterByAttribute?.length})`} value={selectFBA} optionsData={filterByAttribute} type='string' handleValueChange={(value, action) => {
            console.log("Combobox changed:", value, action);
            setSelectFBA(value)
            console.log("vok",valueOfKey(filterByAttribute,value))

          }} nameDesc={`Filter By Attribute `}></ComboboxControl>

          <div className="d-flex justify-content-between align-items-center fbutton"  >
            {executionTime > 0 && <p>{"Time Taken - " + executionTime}</p>}
            <Button onClick={handleSearch} disabled={!selectedManufacturer} variant={'contained'}  className='upload-btn' >
              <Label uniqueName={"Search"} label={"Search"}></Label>
            </Button>
          </div>
        </div>
     <SearchResultsModal Name="search_result" filterResult={filterResult} handleMouseEvent={(event: any, gridRef: any) =>{console.log('')}} showModal={showModal} setShowModal={(val) => { setShowModal(val) }} colDef={SearchDatacolDef} ></SearchResultsModal>
   
      </div></div>
  );
};

export default Home;

