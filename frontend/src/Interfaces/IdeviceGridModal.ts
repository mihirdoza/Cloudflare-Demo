

export interface ModalProps {
  showModal: boolean;
  colDef:Array<any>;
    Name:string;
  handleMouseEvent:(event: any, gridRef: any) => void;
  setShowModal: (value: boolean) => void;
  filterResult: Array<{
    EQID: string;
    Manufacturer: string;
    EQType: string;
    MfgProdLine: string;
    MfgProdNo: string;
    ShapeID: string;
  
  }>;
}