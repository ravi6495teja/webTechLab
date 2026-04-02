import React, { useState } from "react";

function App() {
  const [count, setCount] = useState(0); // initial value

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  return (
    <div className="container">
      <h1>Counter App</h1>

      <div className="card">
        <h2>{count}</h2>

        <button onClick={increment}>Increase</button>
        <button onClick={decrement}>Decrease</button>
      </div>
    </div>
  );
}

export default App;