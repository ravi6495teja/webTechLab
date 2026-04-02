import React from "react";

function App() {
  const name = "Ravi Teja";
  const department = "CSE";
  const year = "3rd Year";
  const section = "A";

  return (
    <div className="container">
      <h1>Student Profile</h1>

      <div className="card">
        <p><b>Name:</b> {name}</p>
        <p><b>Department:</b> {department}</p>
        <p><b>Year:</b> {year}</p>
        <p><b>Section:</b> {section}</p>
      </div>
    </div>
  );
}

export default App;