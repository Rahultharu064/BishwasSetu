import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {store} from "../src/Redux/store.ts"
import { Toaster } from "react-hot-toast";
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <App />
    <Toaster position='top-right' reverseOrder={false} />
    </Provider>
  </StrictMode>,
)
