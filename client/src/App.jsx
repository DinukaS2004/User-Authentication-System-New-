import React from 'react'
import { Routes,Route  } from 'react-router-dom';
import Login from '../pages/Login';
import { EmailVerify } from '../pages/EmailVerify';
import { Home } from '../pages/home';
import { ResetPassword } from '../pages/ResetPassword';

export const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
      </Routes>
    </div>
  )
}

export default App;