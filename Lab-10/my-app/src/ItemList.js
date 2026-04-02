import React from "react";

function ItemList({ items, removeItem }) {
  if (items.length === 0) {
    return <p className="empty">No items available</p>;
  }

  return (
    <ul className="list">
      {items.map((item) => (
        <li key={item.id} className="list-item">
          {item.text}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}

export default ItemList;