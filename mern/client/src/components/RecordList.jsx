import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx/xlsx.mjs';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaFilter } from "react-icons/fa";

const Record = (props) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      <input
        type="checkbox"
        checked={props.selectedRecords.includes(props.record._id)}
        onChange={() => props.handleSelect(props.record._id)}
      />
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.record.name}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.record.position}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.record.level}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to={`/edit/${props.record._id}`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
          color="red"
          type="button"
          onClick={() => {
            props.deleteRecord(props.record._id);
          }}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [allRecords, setAllRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedFilterRecords, setselectedFilterRecords] = useState([]);
  const [filterRecords, setfilterRecords] = useState([]);
  const [filters, setFilters] = useState({
    intern: false,
    junior: false,
    senior: false,
  });
  const [openFilterDropDown, setOpenFilterDropDown] = useState(false);
  const handleFilterDropDown = () => {
    setOpenFilterDropDown(!openFilterDropDown);
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };
  const handleFormSubmit = (event)=>{
    event.preventDefault()
    const selectedFilters = Object.keys(filters).filter((key) => filters[key]);
    console.log(selectedFilters);
    setselectedFilterRecords(selectedFilters);
  }

  useEffect(()=>{setselectedFilterRecords(records)},[records])

  // This method fetches the records from the database.
  useEffect(() => {
    async function getRecords() {
      const response = await fetch(`http://localhost:5050/record/`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const records = await response.json();
      setRecords(records);
    }
    getRecords();
  }, [records.length]);

  // This method will delete a record
  async function deleteRecord(id) {
    await fetch(`http://localhost:5050/record/${id}`, {
      method: "DELETE",
    });
    const newRecords = records.filter((el) => el._id !== id);
    setRecords(newRecords);
  }

  // This method will delete selected records
  async function deleteSelectedRecords() {
    try {
      selectedRecords.map(idy=>{
        fetch(`http://localhost:5050/record/${idy}`, {
          method: "DELETE",
        });
        const newRecords = records.filter((el) => el._id !== idy);
        setRecords(newRecords);
      })



  } catch (error) {
      console.error('Failed to delete records:', error);
      // Optionally, display an error message to the user
      alert('An error occurred while deleting records. Please try again.');
  }
  }

  // Toggle select all records
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRecords(records.map((record) => record._id));
      console.log(selectedRecords);
    } else {
      setSelectedRecords([]);
    }
  };

  // Toggle individual record selection
  const handleSelect = (id) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter((recordId) => recordId !== id));
    } else {
      setSelectedRecords([...selectedRecords, id]);
    }
  };

  // This method will map out the records on the table
  function recordList() {
    return filteredRecords.map((record) => {
      return (
        <Record
          record={record}
          deleteRecord={() => deleteRecord(record._id)}
          key={record._id}
          selectedRecords={selectedRecords}
          handleSelect={handleSelect}
        />
      );
    });
  }

  var ExcelToJSON = function() {

    this.parseExcel = function(file) {
      var reader = new FileReader();

      reader.onload = function(e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary'
        });
        workbook.SheetNames.forEach(function(sheetName) {
          // Here is your object
          var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
          var json_object = JSON.stringify(XL_row_object);
          console.log(JSON.parse(json_object));
          setAllRecords(JSON.parse(json_object));
          console.log(allRecords);
        })
      };

      reader.onerror = function(ex) {
        console.log(ex);
      };

      reader.readAsBinaryString(file);
    };
  };

  function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
  }

  // This function will handle the submission.
  function onSubmit() {
    console.log("hi");

    try {
      let response;
      allRecords.map((eachRecord) => {
        console.log(eachRecord);
        // if we are adding a new record we will POST to /record.
        response = fetch("http://localhost:5050/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eachRecord),
        });
      }); 

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('A problem occurred adding or updating a record: ', error);
    } finally{
        window.location.reload(); // Refresh the page
    }
  }


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRecords = records.filter(rec => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const isLevelMatch = filterRecords.includes(rec.position); 


    return (
      rec.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      rec.position.toLowerCase().includes(lowerCaseSearchTerm) 
      || rec.level.toLowerCase().includes(lowerCaseSearchTerm)

    );
  });

  // This following section will display the table with the records of individuals.
  return (
    <>
      <h3 className="text-lg font-semibold p-4">Employee Records</h3>
      
      <div className="border rounded-lg overflow-hidden">
      <nav className="navbar navbar-light bg-light">
        <form className="form-inline">
          <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" onChange={handleSearchChange}/>
        </form>
      </nav>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&amp;_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Position
                </th>
                <th className="h-12 flex relative justify-between items-center px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Level
                  <button onClick={handleFilterDropDown}>
                    <FaFilter size={14} />
                  </button>
                  {openFilterDropDown && (
                    <form onSubmit={handleFormSubmit} className="absolute flex flex-col gap-2 right-4 shadow-lg top-7 border border-[#eee] p-2 z-10 w-32 bg-white rounded-md ">
                      <div className=" flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="intern"
                          checked={filters.intern}
                          onChange={handleCheckboxChange}
                        />

                        <label htmlFor="intern">Intern</label>
                      </div>
                      <div className=" flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="junior"
                          checked={filters.junior}
                          onChange={handleCheckboxChange}
                        />

                        <label htmlFor="junior">Junior</label>
                      </div>
                      <div className=" flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="senior"
                          checked={filters.senior}
                          onChange={handleCheckboxChange}
                        />

                        <label htmlFor="senior">Senior</label>
                      </div>
                      <button type="submit" className="bg-blue-400 text-white rounded-md px-2 py-1 cursor-pointer w-fit" onClick={handleFormSubmit}>Apply</button>
                    </form>
                  )}
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&amp;_tr:last-child]:border-0">
              {recordList()}
            </tbody>
          </table>
          <form encType="multipart/form-data">
            <input id="upload" type="file" name="files[]" onChange={handleFileSelect}/>
            <button onClick={onSubmit} type="button">Upload</button>
          </form>
        </div>
      </div>
      <div className="mt-4">
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          onClick={deleteSelectedRecords}
          disabled={selectedRecords.length === 0}
        >
          Delete Selected
        </button>
      </div>
    </>
  );
}