import React from "react";
import '../css/Header.css';
import '../css/Theme.css'
import { useTheme } from "./ThemeProvider";

const Header = () => {
    const { isDarkMod, toggleTheme } = useTheme(); 
    

    function logOut(){
        localStorage.removeItem("user_id");
        window.location.href = "/";
    }


    return (
        <div className="header">
            <div className="text">TrelloClone</div>

           
            <div className="buttonswitch">
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMod ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </button>

                <button  onClick={() => logOut()}   className="LogOut">Log out </button>

            </div>

           

        </div>
    );
}

export default Header;
