import React from "react";

export default function AmazonSecondaryNav() {

  const navItems = [
    { label:<><span style={{ fontSize: 22, marginRight: 3 }}>&#9776;</span> <a href="/">All</a></>, dropdown: false },
    { label:<><a href="/">Home</a></>},
    { label:<><a href="/shop">Shop</a></> },
    { label:<><a href="/contact">Contact</a></>},
    { label:<><a href="/checkout">Checkout</a></>},
    { label:<><a href="/about">About</a></>},
    { label:<><a href="/register">Register</a></> },
    { label: <><a href="/login">Login </a></>},
    { label: <><a href="/cart">Cart </a></>},
   

   
  ];

  return (
    <div style={{
      background: "#232f3e",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      minHeight: 40,
      fontFamily: "Amazon Ember, Arial, sans-serif",
      fontSize: 15,
      padding: "0 8px",
      position: "relative",
      borderBottom: "5px solid #1466f2"
    }}>
      {navItems.map((item, idx) => (
        <div
          key={idx}
          style={{
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            height: 38,
            cursor: "pointer",
            fontWeight: (idx === 0 ? "bold" : "normal"),
            position: "relative"
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}