import React, { useState, useContext, useEffect } from "react";
import Alert from "../alert"
import { Link, useNavigate } from "react-router-dom";
import NoteContext from "../../context/notes/noteContext";
import { uploadFileToFirebase } from "../../firebase/savefile";
import { deleteFileFromFirebase } from "../../firebase/deletefile";
import '../../css/form.css'
import FormLoader from "./formLoader";
import Navbar from "../navbar";

const SignupForm = () => {

  const value = useContext(NoteContext)
  const navigate = useNavigate()

  const [alertMessage, setalertMessage] = useState("")
  const [alertIsOk, setalertIsOk] = useState(null)
  const [isSubmitting, setisSubmitting] = useState(false)

  const [tempimgurl, settempimgurl] = useState(value.userImg)
  const [profileImgfile, setprofileImgfile] = useState(null)
  const [isLoaded, setisLoaded] = useState(false)

  //show an error alert without leaving the form stuck
  const showError = (message) => {
    setalertIsOk(false)
    setalertMessage(message)
  }

  //function to display the selected image as profile image
  const handleimage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setprofileImgfile(file)
      settempimgurl(URL.createObjectURL(file))
    }
  }

  //function to create a new user
  const creatUser = async (e) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    const form = (e && e.currentTarget) || document.querySelector(".signupForm form")
    const firstName = form.querySelector("#exampleInputFirstName").value.trim()
    const lastName = form.querySelector("#exampleInputLastName").value.trim()
    const email = form.querySelector("#exampleInputEmail").value.trim()
    const password = form.querySelector("#exampleInputPassword").value
    const confirmPassword = form.querySelector("#exampleInputPasswordConfirm").value
    const about = form.querySelector("#exampleAboutUser").value.trim()

    //validate before doing any network work
    if (password !== confirmPassword) return showError("Passwords are different")
    if (firstName.length < 3) return showError("First name must be at least 3 characters")
    if (lastName.length < 3) return showError("Last name must be at least 3 characters")
    if (password.length < 5) return showError("Password must be at least 5 characters")
    if (about.length < 5) return showError("About must be at least 5 characters")
    if (!value.host) return showError("Server URL is not configured. Please contact the site owner.")

    setisSubmitting(true)
    let uploadedPath = null

    try {
      //upload the profile image to firebase if one was chosen
      let profileImgUrl = ""
      if (profileImgfile !== null) {
        uploadedPath = `profileIMG/${firstName}${lastName}${Date.now()}${Math.random().toString(36).slice(2)}`
        const uploaded = await uploadFileToFirebase(uploadedPath, profileImgfile)
        //savefile.js returns { error: true, message } on failure, not a URL
        if (!uploaded || typeof uploaded !== "string") {
          throw new Error((uploaded && uploaded.message) || "Profile image upload failed")
        }
        profileImgUrl = uploaded
      }

      //send the fields as JSON (the profile image is uploaded directly to Firebase)
      const res = await fetch(`${value.host}/api/auth/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          about,
          url: profileImgUrl
        })
      })

      const isJson = (res.headers.get("content-type") || "").includes("application/json")
      const data = isJson ? await res.json() : null

      if (!res.ok || !data || data.error) {
        if (uploadedPath) await deleteFileFromFirebase(uploadedPath)
        throw new Error((data && data.message) || `Sign-up failed (HTTP ${res.status})`)
      }

      //success: save the session and go to the dashboard
      localStorage.setItem("authtoken", data.jwtToken)
      localStorage.setItem("userId", data.userid)
      localStorage.removeItem("folderPath")
      localStorage.removeItem("baseFolderPath")

      value.setauthtoken(data.jwtToken)
      value.setuserId(data.userid)
      value.setislogout(false)

      form.reset()
      settempimgurl(value.userImg)
      setprofileImgfile(null)

      setalertIsOk(true)
      setalertMessage("User created successfully!")
      setTimeout(() => navigate("/dashboard", { replace: true }), 800)
    } catch (error) {
      setisSubmitting(false)
      setalertIsOk(false)
      setalertMessage(error.message || "Something went wrong. Please try again.")
    }
  }

  useEffect(() => {
    const img = new Image()
    //attach the handlers before setting src so cached images are not missed
    img.onload = () => setisLoaded(true)
    img.onerror = () => setisLoaded(true)
    img.src = tempimgurl
  }, [])

  useEffect(() => {
    if (alertIsOk === null) return
    const timer = setTimeout(() => {
      setalertIsOk(null);
      setalertMessage("");
    }, 4000);
    return () => clearTimeout(timer)
  }, [alertIsOk]);

  return (
    <>
      {/* alert for any change */}
      <Alert isdisplay={alertIsOk == null ? false : true} mode={`${alertIsOk === true ? "success" : "danger"}`} message={alertMessage} />

      {!isLoaded && <FormLoader />}

      <Navbar search={()=>{}} />

      <div id="Content" className=" overflow-hidden h-100 signupForm">
        <div className="heading fw-bold text-center mt-4 " style={{ color: "#fff6e4", fontSize: "2.5rem" }}>Create Account

        </div>

        {isLoaded && <div className="form position-relative overflow-auto mt-5">
          <form
            className=" p-3 mx-auto"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault()
              creatUser(e)
            }}
          >
            {/* user profile image  */}
            <div className="image overflow-hidden " >
              <div className="image mx-auto position-relative" style={{ width: "75px", height: "75px" }}>
                <img className="w-100 h-100" src={tempimgurl} style={{ borderRadius: "50%", objectFit: "cover", objectPosition: "center" }} />
                {/* input for choosing profile image  */}
                <label htmlFor="setProfileImage" className=" bg-black position-absolute bottom-0 end-0 px-1 rounded-circle" data-toggle="tooltip" data-placement="bottom" title="Set Profile Image"><i className="fa-solid fa-camera" style={{ color: "#c7c7c7" }}></i></label>
                <input id="setProfileImage" accept="image/*" type="file" className=" d-none" onChange={handleimage} />
              </div>
            </div>

            {/* user first name  */}
            <div className="formcontrol">
              <input
                required
                type="text"
                className=" fw-semibold"
                id="exampleInputFirstName"
                aria-describedby="emailHelp"
                minLength={3} />
              <label>
                <span style={{ transitionDelay: "0ms" }}>F</span>
                <span style={{ transitionDelay: "50ms" }}>i</span>
                <span style={{ transitionDelay: "100ms" }}>r</span>
                <span style={{ transitionDelay: "150ms" }}>s</span>
                <span style={{ transitionDelay: "200ms" }}>t</span>
                <span style={{ transitionDelay: "250ms" }}>{` `}</span>
                <span style={{ transitionDelay: "300ms" }}>N</span>
                <span style={{ transitionDelay: "350ms" }}>a</span>
                <span style={{ transitionDelay: "400ms" }}>m</span>
                <span style={{ transitionDelay: "450ms" }}>e</span>
              </label>
            </div>

            {/* user last name  */}
            <div className="formcontrol">
              <input
                required
                type="text"
                className=" fw-semibold"
                id="exampleInputLastName"
                aria-describedby="emailHelp"
                minLength={3} />
              <label>
                <span style={{ transitionDelay: "0ms" }}>L</span>
                <span style={{ transitionDelay: "50ms" }}>a</span>
                <span style={{ transitionDelay: "150ms" }}>s</span>
                <span style={{ transitionDelay: "200ms" }}>t</span>
                <span style={{ transitionDelay: "250ms" }}>{` `}</span>
                <span style={{ transitionDelay: "300ms" }}>N</span>
                <span style={{ transitionDelay: "350ms" }}>a</span>
                <span style={{ transitionDelay: "400ms" }}>m</span>
                <span style={{ transitionDelay: "450ms" }}>e</span>
              </label>
            </div>

            {/* user email  */}
            <div className="formcontrol">
              <input
                required
                type="email"
                className=" fw-semibold"
                id="exampleInputEmail" />
              <label>
                <span style={{ transitionDelay: "0ms" }}>E</span>
                <span style={{ transitionDelay: "50ms" }}>n</span>
                <span style={{ transitionDelay: "100ms" }}>t</span>
                <span style={{ transitionDelay: "150ms" }}>e</span>
                <span style={{ transitionDelay: "200ms" }}>r</span>
                <span style={{ transitionDelay: "250ms" }}>{` `}</span>
                <span style={{ transitionDelay: "300ms" }}>E</span>
                <span style={{ transitionDelay: "350ms" }}>m</span>
                <span style={{ transitionDelay: "400ms" }}>a</span>
                <span style={{ transitionDelay: "450ms" }}>i</span>
                <span style={{ transitionDelay: "500ms" }}>l</span>
              </label>
            </div>

            {/* user password  */}
            <div className="formcontrol">
              <input
                required
                type="password"
                className=" fw-semibold"
                id="exampleInputPassword"
                minLength={5} />
              <label>
                <span style={{ transitionDelay: "0ms" }}>P</span>
                <span style={{ transitionDelay: "50ms" }}>a</span>
                <span style={{ transitionDelay: "100ms" }}>s</span>
                <span style={{ transitionDelay: "150ms" }}>s</span>
                <span style={{ transitionDelay: "200ms" }}>w</span>
                <span style={{ transitionDelay: "300ms" }}>o</span>
                <span style={{ transitionDelay: "350ms" }}>r</span>
                <span style={{ transitionDelay: "400ms" }}>d</span>
              </label>
            </div>

            {/* user password for check */}
            <div className="formcontrol">
              <input
                required
                type="password"
                className=" fw-semibold"
                id="exampleInputPasswordConfirm" />
              <label>
                <span style={{ transitionDelay: "0ms" }}>c</span>
                <span style={{ transitionDelay: "50ms" }}>o</span>
                <span style={{ transitionDelay: "100ms" }}>m</span>
                <span style={{ transitionDelay: "150ms" }}>f</span>
                <span style={{ transitionDelay: "200ms" }}>i</span>
                <span style={{ transitionDelay: "300ms" }}>r</span>
                <span style={{ transitionDelay: "300ms" }}>m</span>
                <span style={{ transitionDelay: "300ms" }}>{` `}</span>
                <span style={{ transitionDelay: "350ms" }}>P</span>
                <span style={{ transitionDelay: "50ms" }}>a</span>
                <span style={{ transitionDelay: "400ms" }}>s</span>
                <span style={{ transitionDelay: "450ms" }}>s</span>
                <span style={{ transitionDelay: "500ms" }}>w</span>
                <span style={{ transitionDelay: "500ms" }}>o</span>
                <span style={{ transitionDelay: "550ms" }}>r</span>
                <span style={{ transitionDelay: "600ms" }}>d</span>
              </label>
            </div>

            {/* about yourself  */}
            <div className="formcontrol">
              <input
                required
                type="text"
                className=" fw-semibold"
                id="exampleAboutUser"
                minLength={5} />
              <label>
                <span style={{ transitionDelay: "0ms" }}>A</span>
                <span style={{ transitionDelay: "50ms" }}>b</span>
                <span style={{ transitionDelay: "100ms" }}>o</span>
                <span style={{ transitionDelay: "150ms" }}>u</span>
                <span style={{ transitionDelay: "200ms" }}>t</span>
                <span style={{ transitionDelay: "300ms" }}>{` `}</span>
                <span style={{ transitionDelay: "350ms" }}>y</span>
                <span style={{ transitionDelay: "400ms" }}>o</span>
                <span style={{ transitionDelay: "400ms" }}>u</span>
                <span style={{ transitionDelay: "450ms" }}>r</span>
                <span style={{ transitionDelay: "480ms" }}>s</span>
                <span style={{ transitionDelay: "500ms" }}>e</span>
                <span style={{ transitionDelay: "550ms" }}>l</span>
                <span style={{ transitionDelay: "600ms" }}>f</span>
              </label>
            </div>

            {/* check robot or not  */}
            <label className="container p-0 d-flex align-items-center mb-3">
              <input
                required
                type="checkbox"
                className="form-check-input"
                id="exampleCheck1" />
              <svg viewBox="0 0 64 64" height="1.5rem" width="1.5rem">
                <path d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16" pathLength="575.0541381835938" className="path"></path>
              </svg>
              <label className="form-check-label text-white mx-3 fs-5 fw-semibold" htmlFor="exampleCheck1">
                Verification
              </label>
            </label>

            <button type="submit" className="btn btn-primary mt-3 animated-button mx-auto" id="submit" disabled={isSubmitting}>
              <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
              <span className="text">
                {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Creating User...</> : "Sign-up"}
              </span>
              <span className="circle"></span>
              <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
                ></path>
              </svg>
            </button>


            <p className=" fw-light text-white text-center my-3" style={{ letterSpacing: "1px" }}>
              already have an account ?
              <Link
                to="/user/logIn"
                className=" fw-medium text-primary link-underline mx-2"
              >
                log-in
              </Link>
            </p>

          </form>
        </div>}

      </div>
    </>
  );
};

export default SignupForm;
