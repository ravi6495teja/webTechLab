import React, { useEffect, useState } from "react";
import DataList from "./DataList";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts");
        if (!res.ok) throw new Error("Error fetching data");

        const result = await res.json();
        setData(result.slice(0, 10));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <h2>API Data</h2>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && <DataList data={data} />}
    </div>
  );
}

export default App;