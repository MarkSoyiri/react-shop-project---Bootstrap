import { useState } from "react";


function UserProfile(){

    const [ActiveMenu,SetActiveMenu] = useState("AS")
    

    function showAccountSettings() {
    SetActiveMenu("AS");
    }

    function showPastOrders() {
        SetActiveMenu("PO");
    }

    function showPaymentMethod() {
        SetActiveMenu("PM");
    }


    return(
        
        <>
            <div className="container-lg account-box">
                <div className="acc-menu-box">
                    <h1>Hello,Mark!</h1>
                    <div className="acc-menus">
                        <span className="menu" onClick={showAccountSettings} style={{border:ActiveMenu === "AS" ? "2px solid rgba(67, 170, 255, 0.58)": "none",borderRadius:"5px"}}>Account Settings</span>
                        <span className="menu" onClick={showPastOrders} style={{border:ActiveMenu === "PO" ? "2px solid rgba(67, 170, 255, 0.58)": "none",borderRadius:"5px"}}>Past Orders</span>
                        <span className="menu" onClick={showPaymentMethod} style={{border:ActiveMenu === "PM" ? "2px solid rgba(67, 170, 255, 0.58)": "none",borderRadius:"5px"}}>Payment Methods</span>
                        <span className="menu">Saved Address</span>
                    </div>
                </div>
                <div className="acc-menu-info-box">
                    <div className="menu-info-n-btn" style={{display:ActiveMenu === "AS" ? "flex" : "none" }}>
                        <span className="menu-info-span">
                            <h1>ACCOUNT SETTINGS</h1>
                        </span>
                        <span className="menu-info-span">
                            <h2>PERSONAL INFO</h2>
                            <p>Name: Mark</p>
                            <p>Email: Marksoyiri45@gmail.com</p>
                            <p>Phone: +233 50 747 8327</p>
                        </span>
                        <span className="btn-span">
                            <button className="btn edit-btn">Edit</button>
                            <button className="btn save-btn">Save</button>
                            <button className="btn edit-btn">Delete</button>
                        </span>
                        <span className="btn-span">
                            <button className="btn edit-btn">SignOut</button>
                            
                        </span>
                    </div>
                    <div className="menu-info-n-btn" style={{display:ActiveMenu === "PO" ? "flex" : "none"}}>
                        <span className="menu-info-span">
                            <h1>PAST ORDERS</h1>
                        </span>
                        <span className="menu-info-span">
                            <h2 >No orders here</h2>
                            <p style={{fontSize:"20px",color:"grey"}}>Looks like you dont have any orders yet...</p>
                            
                        </span>
                        <span className="btn-span" style={{border:"none"}}>
                            <a href="/menu"><button className="btn edit-btn" style={{width:"150px"}}>Order now</button></a>
                            
                        </span>
                    </div>
                </div>

            </div>
        </>
    );
}

export default UserProfile