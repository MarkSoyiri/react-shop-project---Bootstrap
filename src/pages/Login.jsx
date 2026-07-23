import zestylogo from '../images/zestylogo.png'
import { useState, useContext } from 'react';
import axiosFetch from '../api/axiosFetchAPI';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


function Login () {

    const navigate = useNavigate()

    const [Email, SetEmail] = useState("");
    const [Password, SetPassword] = useState("");
    const [Username, SetUsername] = useState("");
    const [EmailError, SetEmailError] = useState("");
    const [PasswordError, SetPasswordError] = useState("");
    const [UsernameError, SetUsernameError] = useState("");
    const [ServerError, SetServerError] = useState("");
    
    const { login } = useContext(AuthContext);

    // FORM VALIDATION
    const loginHandler = async (event) => {
        event.preventDefault();
        SetServerError("");

        try {
            if (Email === "") {
                SetEmailError("Invalid Email");
                return; 
            }
    
            if (Password === "") {
                SetPasswordError("Invalid Password");
                return;
            }
    
            const response = await axiosFetch.post('/login', {
                email: Email,
                password: Password
            })
    
            if (response.status === 200 || response.status === 201) {
                const { token, user } = response.data;
                if (token && user) {
                    localStorage.setItem("token", token);
                    login(user, token);
                    navigate('/');
                } else {
                    SetServerError("Invalid response from server");
                }
            }
        } catch (error) {
            if (error.response) {
                const msg = error.response.data?.message || error.response.statusText || "Login failed";
                SetServerError(msg);
                console.error("Login Error:", error.response.status, error.response.data);
            } else {
                SetServerError(error.message);
                console.error("Login Error:", error.message);
            }
        }
    }

    const registerHandler = async (event) => {
        event.preventDefault();
        SetServerError("");

        try {
            if (Email === "") {
                SetEmailError("Invalid Email");
                return;
            }
 
            if (Password === "") {
                SetPasswordError("Invalid Password");
                return;
            }
 
            if (Username === "") {
                SetUsernameError("Username cannot be empty");
                return;
            }
 
            const response = await axiosFetch.post("/register", {
                username: Username,
                email: Email,
                password: Password
            })

            if (response.status === 200 || response.status === 201) {
                alert("Registration Successful! Please Login.");
                SetUsername("");
                SetEmail("");
                SetPassword("");
                SetUsernameError("");
                SetEmailError("");
                SetPasswordError("");
                SetShowLogin(true);
            }
        } catch (error) {
            if (error.response) {
                const msg = error.response.data?.message || error.response.statusText || "Registration failed";
                SetServerError(msg);
                console.error("Register Error:", error.response.status, error.response.data);
            } else {
                SetServerError(error.message);
                console.error("Register Error:", error.message);
            }
        }
    }
    
    // LOGIN & REGISTER SWITCHER
    const [showLogin, SetShowLogin] = useState(true);

    function regClick() {
        SetShowLogin(false);
        SetServerError("");
        SetEmailError("");
        SetPasswordError("");
        SetUsernameError("");
    }
    function logClick() {
        SetShowLogin(true);
        SetServerError("");
        SetEmailError("");
        SetPasswordError("");
        SetUsernameError("");
    }

    return (
        <div className='registry'>
           {showLogin ? 
     
                //LOGIN FORM
                <div className='loginBox'>
                <a href="/"><img className='logo' src={zestylogo} alt="logo image"  /></a>
                <h1>SIGN IN</h1>
                <form onSubmit={loginHandler} method='post'>
                    <fieldset>
                        {ServerError && <p className='errorMsg' style={{color:"red",textAlign:"center"}}>{ServerError}</p>}
                        <label htmlFor="">Email address *</label>
                        <input type="email" name='email' id='email' onChange={(e)=>{SetEmail(e.target.value); SetEmailError("")}} value={Email}/>
                        <p className='errorMsg'>{Email === "" ? EmailError : null }</p>
                        <label htmlFor="">Password *</label>
                        <input type="password" name='password' id='password' onChange={(e)=>{SetPassword(e.target.value); SetPasswordError("")}} value={Password}/>
                        <p className='errorMsg'>{Password === "" ? PasswordError : null }</p>
                        <p className='TnC'>By signing in, you agree to our <a href="">Privacy Policy</a><br></br> and <a href="">Terms and Conditions</a></p>
                        <button type='submit' className='send-btn'>Sign In</button>
                        <p className='log-switch'>Don't have an account?<span onClick={regClick}>Register</span></p>
                    </fieldset>
                </form>
            </div>
            
            :
            

                       // REGISTER FORM
                <div className='loginBox'>
                    <a href="/"><img className='logo' src={zestylogo} alt="logo image"  /></a>
                    <h1>SIGN UP</h1>
                    <form onSubmit={registerHandler} method='post'>
                        <fieldset>
                            {ServerError && <p className='errorMsg' style={{color:"red",textAlign:"center"}}>{ServerError}</p>}
                            <label htmlFor="">Username*</label>
                            <input type="text" name='username' id='username' onChange={(e)=>{SetUsername(e.target.value); SetUsernameError("")}} value={Username}/>
                            <p className='errorMsg'>{Username === "" ? UsernameError : null }</p>
                            <label htmlFor="">Email address *</label>
                            <input type="email" name='email' id='email' onChange={(e)=>{SetEmail(e.target.value); SetEmailError("")}} value={Email}/>
                            <p className='errorMsg'>{Email === "" ? EmailError : null }</p>
                            <label htmlFor="">Password *</label>
                            <input type="password" name='password' id='password' onChange={(e)=>{SetPassword(e.target.value); SetPasswordError("")}} value={Password}/>
                            <p className='errorMsg'>{Password === "" ? PasswordError : null }</p>
                            <p className='TnC'>By signing in, you agree to our <a href="">Privacy Policy</a><br></br> and <a href="">Terms and Conditions</a></p>
                            <button type='submit' className='send-btn'>Submit</button>
                            <p className='log-switch'>Already have an account?<span onClick={logClick}>Login</span></p>
                        </fieldset>
                    </form>
                </div>
                }
                
           

        </div>
    );
}

export default Login;
