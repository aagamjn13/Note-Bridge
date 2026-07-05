import React, { useContext, useState } from "react";
import NoteContext from "../context/notes/noteContext";
import { FileIcon, defaultStyles } from 'react-file-icon';
import { showFiles } from "../functions/showFiles";
import '../css/notecard.css'

const noteCard = (props) => {

  const value = useContext(NoteContext)
  const cardId = props.cardId
  
  const [summaryData, setSummaryData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  //function to get file icon image according to their extentions
  const FileIconComponent = ({ extention }) => {
    return (<FileIcon extension={extention} {...defaultStyles[extention]} />)
  };

  //function to set seleted item id in a array
  const selectNotes = (e) => {
    if (e.target.checked === true) {
      props.setnotesId([...(props.notesId), cardId])
    } else {
      props.setnotesId((props.notesId).filter(id => id !== cardId))
    }
  }
  return (
    <div className=" m-md-3 m-2 cardSize noteDiv position-relative">

      <div className={`overlayer position-absolute w-100 h-100 top-0 start-0 z-1 rounded-2 ${value.isSelect === false ? "d-none" : "d-block"}`} style={{ backgroundColor: "rgb(85 85 85 / 40%)" }}>
        <div className=" p-2">
          <input
            className="form-check-input checkboxNoLabel"
            type="checkbox"
            onChange={selectNotes}
          />
        </div>
      </div>
      
      <div className="card h-auto" style={{ cursor: "pointer" }} onClick={(e) => {
        e.preventDefault()
        showFiles(props.url, props.desc)
      }}>

        <div className="card-img-top mx-auto pt-2 cradImg " style={{ width: "65%" }}>
          <FileIconComponent extention={props.extention} />
        </div>

        <div className="card-body p-0 mt-2 text-center pb-2">
          <p className=" w-100 cardName fw-semibold card-title text-center mb-0 fs-6 overflow-auto p-2 text-white">{props.name}</p>
          {props.desc && (
            <button 
              className="btn btn-sm btn-outline-info mt-1"
              disabled={loadingAI}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (summaryData) {
                  setSummaryData(null);
                  return;
                }
                setLoadingAI(true);
                try {
                  const res = await fetch(`${value.host}/api/ai/summarize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: props.desc })
                  });
                  const data = await res.json();
                  if(data.error) {
                    setSummaryData({ error: data.message });
                  } else {
                    setSummaryData({ summary: data.summary, tags: data.tags });
                  }
                } catch(err) {
                  console.error(err);
                  setSummaryData({ error: "Failed to fetch summary." });
                } finally {
                  setLoadingAI(false);
                }
              }}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> {loadingAI ? "Loading..." : (summaryData ? "Hide Summary" : "AI Summarize")}
            </button>
          )}
          
          {summaryData && (
            <div className="mt-2 text-start p-2 rounded w-100" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold" style={{ color: 'var(--accent-color)' }}><i className="fa-solid fa-wand-magic-sparkles"></i> AI Summary</span>
              </div>
              {summaryData.error ? (
                <div className="text-danger">{summaryData.error}</div>
              ) : (
                <>
                  <p className="mb-2" style={{ color: 'var(--text-primary)' }}>{summaryData.summary}</p>
                  <div>
                    {summaryData.tags.map(t => <span key={t} className="badge me-1" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{t}</span>)}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default noteCard;
