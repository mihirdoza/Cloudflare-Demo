


// Split the keywords by spaces and escape single quotes for safety
export const HandleSearchWord=async(word)=>{
    const Sword = await word.trim().split(/\s+/).map((word) => word.replace(/'/g, "''"));
    return Sword ;
  }

// current date give in dd/mm/yyyy
  export const formatedDate=async()=>{
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
  console.log(`${dd}/${mm}/${yyyy}`)
    return  `${dd}/${mm}/${yyyy}`;
    
  }