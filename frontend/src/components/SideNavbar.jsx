import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation , useNavigate } from "react-router-dom";
import NoteContext from "../context/notes/noteContext";
import { logout } from "../functions/logout";
import defaultUserImg from "../assets/defaultUserImg.png";
import NotificationBadge from "./notificationBadge";
import AlertSound from "../assets/notification.mp3"
import '../css/sidenavbar.css'

const sideNavbar = () => {

  const navigate = useNavigate()

  const location = useLocation();
  const value = useContext(NoteContext);
  const [originalUser, setoriginalUser] = useState(null); //state for original user details
  const [unseen, setunseen] = useState(false)
  const [profilePath, setprofilePath] = useState(`/social/profile/${value.userId}`)
  const [isVisible, setisVisible] =  useState(window.innerWidth <= 625 ? false : true)
  //function to save original user details
  const getOriUser = async () => {
    const res = await fetch(`${value.host}/api/auth/getuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authToken: `${value.authtoken}`,
      },
      body: JSON.stringify({
        user: `${value.userId}`,
        userId: `${value.userId}`
      }),
    });
    const data = await res.json();
    if (data.error) {
      value.setisOK(false)
      value.setmessage(data.message)
    } else {
      setoriginalUser(data.user);
    }
  };

  window.addEventListener('resize', () => {
    window.innerWidth <= 625 ? setisVisible(false) :  setisVisible(true)
  })

  useEffect(() => {
    getOriUser()
  }, [])

  useEffect(() => {
    if (localStorage.getItem("unseen")) {
      localStorage.getItem("unseen") === "true" ? setunseen(true) : ""
    }
    if (location.pathname === "/social/notifications") {
      setunseen(false)
      localStorage.setItem("unseen", false)
    }
  }, [value.unReadNotificationLength])


  useEffect(() => {
    if (unseen === true && value.unReadNotificationLength > 0) {
      document.querySelector("audio").play()
    }
  }, [unseen, value.unReadNotificationLength])


  return (
    <>
      {!isVisible && (
        <button 
          className="btn border-0 position-fixed" 
          style={{ top: '15px', left: '15px', zIndex: 1050, color: 'var(--accent-color)' }}
          onClick={() => setisVisible(true)}
        >
          <i className="fa-solid fa-bars fs-4"></i>
        </button>
      )}
      
      <div className={`sideNavbar d-flex flex-column justify-content-between p-3 ${isVisible ? '' : 'd-none'}`} id='sideNavbar' style={{height:`${window.innerHeight}px`, width: "260px", flexShrink: 0, backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)', boxShadow: 'var(--accent-glow)'}}>
      
      <div className="top-section">
        <div className="d-flex justify-content-between align-items-center mb-4 px-2">
            <h5 className="mb-0 fw-bold tracking-tight" style={{ color: 'var(--text-primary)', textShadow: '0 0 5px var(--accent-color)'}}>NoteBridge</h5>
            <button className="btn btn-sm border-0" onClick={() => setisVisible(false)} style={{ color: 'var(--accent-color)' }}>
                <i className="fa-solid fa-bars fs-5"></i>
            </button>
        </div>

        <ul className="nav nav-pills flex-column mb-auto" id="menu">
          <li className="nav-item mb-2 w-100">
            <Link to="/dashboard" className={`nav-link text-start sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`} onClick={() => value.seturlPath("/dashboard")}>
              <i className="fa-solid fa-house-user me-3"></i> Home
            </Link>
          </li>
          <li className="nav-item mb-2 w-100">
            <Link to="/about" className={`nav-link text-start sidebar-link ${location.pathname === "/about" ? "active" : ""}`} onClick={() => value.seturlPath("/about")}>
              <i className="fa-solid fa-circle-info me-3"></i> About Us
            </Link>
          </li>
          <li className="nav-item mb-2 w-100">
            <Link to={value.islogout === false ? `/your/files/${value.userId}` : ""} className={`nav-link text-start sidebar-link ${location.pathname.includes("your/files") ? "active" : ""}`}
              data-bs-toggle={value.islogout === true ? "modal" : ""}
              data-bs-target={value.islogout === true ? "#exampleModalLogin" : ""}
            >
              <i className="fa-solid fa-file me-3"></i> Your Files
            </Link>
          </li>
          <li className="nav-item mb-2 w-100">
            <Link to={value.islogout === false ? "/social/notifications" : ""} className={`nav-link text-start sidebar-link position-relative ${location.pathname === "/social/notifications" ? "active" : ""}`}
              data-bs-toggle={value.islogout === true ? "modal" : ""}
              data-bs-target={value.islogout === true ? "#exampleModalLogin" : ""}
            >
              <audio src={AlertSound}></audio>
              <i className="fa-solid fa-bell me-3"></i> Notifications
              <div className={`${location.pathname === "/social/notifications" ? "d-none" : ""} ${unseen === true && value.unReadNotificationLength > 0 ? "" : "d-none"} position-absolute top-50 translate-middle-y`} style={{right: '10px'}}><NotificationBadge /></div>
            </Link>
          </li>
        </ul>
      </div>

      <div className="dropdown mt-auto">
        <hr style={{borderColor: 'var(--border-color)'}}/>
        <a
          href="#"
          className="d-flex align-items-center text-decoration-none dropdown-toggle px-2 py-2 rounded-2 sidebar-link"
          id="dropdownUser1"
          style={{ cursor: "pointer", color: 'var(--text-primary)' }}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src={originalUser !== null ? value.islogout === true || originalUser.profileimg === "undefined" ? defaultUserImg : originalUser.profileimg : defaultUserImg}
            alt="hugenerd"
            width="32"
            height="32"
            className="rounded-circle me-3"
            style={{ objectFit: "cover" }}
          />
          <strong className="me-auto text-truncate" style={{maxWidth: '120px'}}>{value.islogout ? "Guest" : (originalUser ? originalUser.firstName : "User")}</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow mb-2 w-100">
          <li style={{ cursor: "pointer" }} className={`${value.islogout === false ? "d-none" : ""}`}>
            <Link className="dropdown-item" to="/user/logIn">Log in</Link>
          </li>
          <li style={{ cursor: "pointer" }} className={`${value.islogout === true ? "d-none" : ""}`}>
            <Link className="dropdown-item" to={profilePath}>Profile</Link>
          </li>
          <li style={{ cursor: "pointer" }}>
            <hr className="dropdown-divider" />
          </li>
          <li className={`${value.islogout === true ? "d-none" : ""}`}>
            <a className="dropdown-item" onClick={(e) => {
                e.preventDefault();
                logout();
                value.setislogout(true);
                navigate("/");
            }}>Sign out</a>
          </li>
        </ul>
      </div>
    </div>
    </>
  );
};

export default sideNavbar;
