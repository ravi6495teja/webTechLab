import React from "react";
import StudentCard from "./components/StudentCard";

function App() {
  const students = [
    { id: 1, name: "Ravi", department: "CSE", marks: 85 },
    { id: 2, name: "Teja", department: "ECE", marks: 90 },
    { id: 3, name: "Kiran", department: "EEE", marks: 78 },
    { id: 4, name: "Rahul", department: "MECH", marks: 82 }
  ];

  return (
    <div className="container">
      <h1>Student Cards</h1>

      <div className="card-container">
        {students.map((stu) => (
          <StudentCard
            key={stu.id}
            name={stu.name}
            department={stu.department}
            marks={stu.marks}
          />
        ))}
      </div>
    </div>
  );
}

export default App;