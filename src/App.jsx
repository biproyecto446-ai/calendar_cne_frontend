import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import CompanyCalendar from "./components/CompanyCalendar"

function App() {
  return (
    <>
      <CompanyCalendar />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App
