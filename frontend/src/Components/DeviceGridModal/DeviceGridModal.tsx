import React, { useEffect} from "react";
import BasicGrid from "../BasicGrid/BasicGrid";
import { ModalProps } from "../../Interfaces/IdeviceGridModal";





const SearchResultsModal: React.FC<ModalProps> = ({
  showModal,
  setShowModal,
  filterResult,
  colDef,
  handleMouseEvent,
  Name
}) => {



  useEffect(
    () => {
      console.log("45",filterResult)
      return;
    }, [filterResult]
  )


  return (
    <>

      {(showModal && filterResult.length>0)&& (
        <div className="table-main">
          <BasicGrid uniqueName={Name} hideCopyIcon={true}  handleMouseEvent={handleMouseEvent} 
          onSelectionChanged={() => console.log("")} hideCopyRowIcon={true} hideKebabMenu={true} hideRowKebabMenu={true} autoHeightRow={true} allowColumnResize={true} allowPagination={true} allowEditButton={false} allowDrag={false} paginationAutoPageSize={true} isReadOnly={true} allowAutoSizeColumn={true} instanceName={""} showGrid={true} columnDefs={colDef} rowData={filterResult} ></BasicGrid>
        </div>

      )}


</>

)};

export default SearchResultsModal;
