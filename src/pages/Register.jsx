import React, { useState,useEffect } from "react";
import api from "../api";
import apiAuth from "../apiAuth";


export default function Register() {
  const [email, setEmail] = useState("Mr@gmail.com");
   const [username, setUsername] = useState("Mr Man")
  const [password, setPassword] = useState("123456789");
  const [showError, setShowError] = useState(true);

  useEffect(() => {
    apiAuth.get("/users/",
    ).then((res) => {
      console.log(res.data)
    });
  }, []);

  

   useEffect(() => {
    api.get("/users/all/",
    ).then((res) => {
      console.log(res.data)
    });
  }, []);


//   const handleSignIn = async () => {
  // e.preventDefault();

//   try {
//     const response = await fetch('https://express-and-react.vercel.app/users', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//       username: 'Fred',
//       email: 'Flintstone@gmail.com',
//       password:'test123456789'
//     })
//     });
  
//     const data = await response.json();
//       console.log('Response from backend:', data);
//   } catch (error) {

//      console.error('Error:', error);
    
//   }

// };


  const handleSignIn = async (e) => {
    e.preventDefault();

 try {
   var register = await api.post('/register', {
     username: username,
     email: email,
     password:password
   })


   if (register.status == 201) {
    
     console.log(register.statusText)

   } else {

    console.log(register.statusText)
    
   }
   
 } catch (error) {
  
   console.log(error.response.data);
 }

  
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/netflix-bg.jpg') center/cover no-repeat",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <form
        style={{
          background: "rgba(0,0,0,0.75)",
          padding: "40px",
          borderRadius: "8px",
          width: "350px",
          color: "#fff",
          boxSizing: "border-box",
          position: "relative"
        }}
        onSubmit={handleSignIn}
      >
        <h1 style={{ marginBottom: "24px", fontWeight: "bold" }}>Sign In</h1>
        
        {showError && (
          <div
            style={{
              background: "#ffcc00",
              color: "#000",
              padding: "16px",
              borderRadius: "4px",
              marginBottom: "18px",
              fontWeight: "500"
            }}
          >
           
            
          </div>
        )}
           <div style={{ marginBottom: "14px" }}>
          <input
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #333",
              background: "#222",
              color: "#fff",
              fontSize: "15px",
              marginBottom: "6px"
            }}
          />
        </div>
        <div style={{ marginBottom: "14px" }}>
          <input
            type="text"
            value={email}
            placeholder="Email or mobile number"
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #333",
              background: "#222",
              color: "#fff",
              fontSize: "15px",
              marginBottom: "6px"
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #333",
              background: "#222",
              color: "#fff",
              fontSize: "15px"
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#e50914",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "18px"
          }}
        >
          Sign In
        </button>
        <div style={{ textAlign: "center", marginBottom: "16px", color: "#bbb" }}>
          <span style={{ display: "inline-block", width: "40%", borderBottom: "1px solid #333" }} />
          <span style={{ margin: "0 10px", fontSize: "13px" }}>OR</span>
          <span style={{ display: "inline-block", width: "40%", borderBottom: "1px solid #333" }} />
        </div>
       
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <a
            href="#"
            style={{
              color: "#b3b3b3",
              textDecoration: "underline",
              fontSize: "15px"
            }}
          >
            Forgot password?
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "18px" }}>
          <input
            type="checkbox"
            id="rememberMe"
            style={{ accentColor: "#b3b3b3", marginRight: "8px" }}
          />
          <label htmlFor="rememberMe" style={{ color: "#b3b3b3", fontSize: "15px" }}>
            Remember me
          </label>
        </div>
        <div style={{ color: "#b3b3b3", fontSize: "15px", marginBottom: "10px" }}>
          New to Netflix?{" "}
          <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>
            Sign up now.
          </a>
        </div>
        <div style={{ marginTop: "14px", color: "#8c8c8c", fontSize: "13px" }}>
          This page is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" style={{ color: "#0057b7", textDecoration: "underline" }}>Learn more.</a>
        </div>
      </form>
    </div>
  );
}