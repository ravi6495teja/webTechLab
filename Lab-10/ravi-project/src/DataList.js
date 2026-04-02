import React from "react";

function DataList({ data }) {
  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>
          <b>{item.title}</b>
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

export default DataList;