import React from "react";

function StudentProfile() {
  const student = {
    name: "Ravi Teja",
    department: "CSE",
    year: "3rd Year",
    section: "A"
  };

  return (
    <div className="card">
      <h2>Student Profile</h2>
      <p><b>Name:</b> {student.name}</p>
      <p><b>Department:</b> {student.department}</p>
      <p><b>Year:</b> {student.year}</p>
      <p><b>Section:</b> {student.section}</p>
    </div>
  );
}

export default StudentProfile;