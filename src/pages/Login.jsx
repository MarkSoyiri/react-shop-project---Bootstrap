import React, { useState } from "react";
import api from "../api";
import apiAuth from "../apiAuth";
import fetch from "../test";

export default function login() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456789");
  const [showError, setShowError] = useState(true);



  const GetThatData = async (e)=>{
e.preventDefault();
fetch.get("/news").then((req)=>{
console.log(req.status)
}).catch((error)=>{

 console.error(error)
})

try {
  const res = await fetch.get("/news");
  
  if (res.status === 200) {
    
    console.log(res.data);
  } else {
    
  }
} catch (error) {
  
}

  }

const handleProfile = async ()=>{

   try {

    var profile = await apiAuth.get('/profile')

     console.log(profile.data.message)
    
   } catch (error) {

    console.log(error.response.data.message)
    
   }
}



  const handleSignIn = async (e) => {
    e.preventDefault();
   try {
   var register = await api.post('/login', {
     email: email,
     password:password
   })


   if (register.status == 201) {
    

    localStorage.setItem("access",register.data.token)
    //  console.log(register.data.token)

    
     handleProfile();
    

   } else {

    console.log(register.data)
    
   }
   
 } catch (error) {
  
   console.log(error.response.data);
 }
    setShowError(true);
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
            <div>
              Incorrect password for <b>admin@gmail.com</b>
            </div>
            <div style={{ marginTop: 8, fontSize: 15 }}>
              You can{" "}
              <a href="#" style={{ color: "#0057b7", textDecoration: "underline" }}>
                use a sign-in code
              </a>
              ,{" "}
              <a href="#" style={{ color: "#0057b7", textDecoration: "underline" }}>
                reset your password
              </a>{" "}
              or try again.
            </div>
          </div>
        )}

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
        <button
          type="button"
          style={{
            width: "100%",
            padding: "10px",
            background: "transparent",
            color: "#fff",
            border: "1px solid #aaa",
            borderRadius: "4px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
            marginBottom: "14px"
          }}
        >
          Use a Sign-In Code
        </button>
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