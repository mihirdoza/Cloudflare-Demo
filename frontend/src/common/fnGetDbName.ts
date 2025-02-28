type DataItem = { id: number; name: string };

async function findNameById(data: DataItem[], id: number): Promise<string | null> {
    const item = data.find(obj => obj.id === id);
    return item ? item.name : null; // Returns name if found, otherwise null
}


export default findNameById;