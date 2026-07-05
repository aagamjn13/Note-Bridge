import React, { useEffect, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import io from "socket.io-client";
import NoteContext from "../context/notes/noteContext";
import Navbar from './navbar'
import Footer from './Footer'
import '../css/about.css'

const about = () => {
    const location = useLocation();

    const value = useContext(NoteContext);
    const socket = io(`${value.host}`);


    const [like, setlike] = useState(false)
    const [view, setview] = useState(false)
    const [follow, setfollow] = useState(false)
    const [comments, setcomments] = useState([])
    const [isNavbaeShow, setisNavbaeShow] = useState(false)
    const [originalUser, setoriginalUser] = useState(null);

    const getOriUser = async () => {
        if(!value.authtoken || !value.userId) return;
        try {
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
            if (!data.error) {
                setoriginalUser(data.user);
            }
        } catch(e) {}
    };

    useEffect(() => {
        getOriUser();
    }, [value.authtoken]);

    useEffect(() => {
        socket.emit("userConnected", `${value.userId}`); //connect to io

        //get accept req status
        socket.on("acceptReq", (data) => {
            setfollow(!follow);
        });
        //socket reply of followReqStatus
        socket.on("postComment", (data) => {
            setcomments(data)
        });
        //get accept req status
        socket.on("denyReq", (data) => {
            setfollow(!follow);
        });
        //socket reply for likes
        socket.on("postLike", (data) => {
            setlike(!like)
        });

        //socket reply of view request status
        socket.on("viewReq", (data) => {
            setview(!view);
        });

        //socket reply of followReqStatus
        socket.on("followReqStatus", (data) => {
            setfollow(!follow);
        });
    }, [])

    useEffect(() => {
        value.fetchNotificationToRead()
    }, [follow, comments, like, view])

    useEffect(() => {
        window.innerWidth <= 625 ? setisNavbaeShow(true) : setisNavbaeShow(false)
    }, [])

    window.addEventListener('resize', () => {
        window.innerWidth <= 625 ? setisNavbaeShow(true) : setisNavbaeShow(false)
    })

    return (
        <>

            <div className="container-fluid h-100 position-relative" id="about">

                <div className="position-absolute w-100 top-0 z-3">
                    <Navbar search={() => { }} />
                </div>
                    
                <div className="w-100 d-flex flex-column align-items-center pb-5" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <div className="w-100 mt-5 pt-5" style={{ maxWidth: '800px' }}>
                        
                        {/* Title Section */}
                        <div className="mb-5 px-4 text-center">
                            <h1 className="fw-bold mb-3" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>About NoteBridge</h1>
                            <p className="fs-5" style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                                A minimalist, unified workspace bridging the gap between secure cloud storage and real-time community interaction.
                            </p>
                        </div>

                        {/* Tech Stack Card */}
                        <div className="card shadow-sm rounded-4 border mb-5 mx-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <div className="card-body p-5">
                                <h3 className="fw-bold mb-4 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                                    <i className="fa-solid fa-layer-group me-3" style={{ color: 'var(--text-secondary)' }}></i>
                                    Architecture & Stack
                                </h3>
                                <p className="fs-6 mb-4 lh-lg" style={{ color: 'var(--text-secondary)' }}>
                                    Built from the ground up as a robust MERN application. NoteBridge employs JWT for stateless authentication, Socket.io for instantaneous communication, and Google Firebase for reliable, secure file storage.
                                </p>
                                
                                <div className="d-flex flex-wrap gap-2 mt-4">
                                    <span className="badge rounded-pill border px-3 py-2 fw-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>React.js</span>
                                    <span className="badge rounded-pill border px-3 py-2 fw-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Node.js</span>
                                    <span className="badge rounded-pill border px-3 py-2 fw-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Express</span>
                                    <span className="badge rounded-pill border px-3 py-2 fw-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>MongoDB</span>
                                    <span className="badge rounded-pill border px-3 py-2 fw-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Socket.io</span>
                                    <span className="badge rounded-pill border px-3 py-2 fw-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Firebase</span>
                                </div>
                            </div>
                        </div>

                        {/* Creator Profile Card */}
                        <div className="card shadow-sm rounded-4 border mx-3 mb-5" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <div className="card-body p-5 text-center">
                                <h3 className="fw-bold mb-5" style={{ color: 'var(--text-primary)' }}>Meet the Creator</h3>
                                <div className="creator-profile d-flex flex-column align-items-center">
                                    <div className="avatar-circle mb-4" style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border-color)", padding: '4px', backgroundColor: 'var(--bg-secondary)' }}>
                                        <img src={`https://ui-avatars.com/api/?name=${originalUser ? originalUser.firstName : 'Aagam+Jain'}&background=random&size=120`} alt={originalUser ? originalUser.firstName : "Aagam Jain"} className="img-fluid rounded-circle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <h4 className="fw-bold mb-2 text-white">{value.islogout ? "Aagam Jain" : (originalUser ? originalUser.firstName : "Aagam Jain")}</h4>
                                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Full Stack Web Developer</p>
                                    
                                    <div className="d-flex justify-content-center gap-3">
                                        <a href="https://github.com/aagamjn13" target="_blank" rel="noreferrer" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: "45px", height:"45px", borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}><i className="fa-brands fa-github fs-5"></i></a>
                                        <a href="#" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: "45px", height:"45px", borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}><i className="fa-brands fa-linkedin-in fs-5"></i></a>
                                        <a href="mailto:aagamjn13@gmail.com" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: "45px", height:"45px", borderColor: 'var(--border-color)', color: 'var(--text-primary)'}}><i className="fa-solid fa-envelope fs-5"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>

    );
}

export default about;
