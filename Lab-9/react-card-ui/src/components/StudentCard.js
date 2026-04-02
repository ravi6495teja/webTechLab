import React from "react";

function StudentCard(props) {
  return (
    <div className="card">
      <h3>{props.name}</h3>
      <p><b>Department:</b> {props.department}</p>
      <p><b>Marks:</b> {props.marks}</p>
    </div>
  );
}

export default StudentCard;