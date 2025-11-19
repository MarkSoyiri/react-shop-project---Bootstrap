
function UserProfile(){

    return(
        
        <>
            <div className="container-lg bg-color">
                <div className="acc-menu-box">
                    <h1>Hello,Mark!</h1>
                    <div className="acc-menus">
                        <span className="menu">Account Settings</span>
                        <span className="menu">Past Orders</span>
                        <span className="menu">Payment Methods</span>
                        <span className="menu">Saved Address</span>
                    </div>
                </div>
                <div className="acc-menu-info-box">
                    <div className="menu-info-n-btn">
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
                </div>

            </div>
        </>
    );
}

export default UserProfile