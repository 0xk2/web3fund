import { CircularProgress, Snackbar, Alert, Backdrop } from "@mui/material";
import { createContext, useContext, useState } from "react";

const UIHelperContext = createContext();

export function useUIHelper(){
  return useContext(UIHelperContext)
}

export function UIHelperProvider ({children}){
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [backdropState, setBackdropState] = useState(false)

  const value = {
    setErrorMessage,
    setInfoMessage,
    setSuccessMessage,
    setBackdropState
  }

  return (
    <UIHelperContext.Provider value={value}>
      {children}
      <Snackbar open={infoMessage !== ''} autoHideDuration={6000} onClose={() => setInfoMessage('')} anchorOrigin={{ vertical:'top', horizontal:'center'}}>
        <Alert onClose={()=>setInfoMessage('')} severity="info">{infoMessage}</Alert>
      </Snackbar>
      <Snackbar open={errorMessage !== ''} autoHideDuration={6000} onClose={() => setErrorMessage('')} anchorOrigin={{ vertical:'top', horizontal:'center'}}>
        <Alert onClose={()=>setErrorMessage('')} severity="error">{errorMessage}</Alert>
      </Snackbar>
      <Snackbar open={successMessage !== ''} autoHideDuration={6000} onClose={() => setSuccessMessage('')} anchorOrigin={{ vertical:'top', horizontal:'center'}}>
        <Alert onClose={()=>setSuccessMessage('')} severity="success">{successMessage}</Alert>
      </Snackbar>
      <Backdrop key={backdropState} className="backdrop" open={backdropState} onClick={() => {
        setBackdropState(false)
      }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </UIHelperContext.Provider>
  )
}