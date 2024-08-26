import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Admin from './pages/Admin';
import RequireAuth from './pages/RequireAuth';
import Layout from './pages/Layout';
import Unauthorized from './pages/UnAuthorized';
import { Routes, Route } from 'react-router-dom';

const ROLES = {
  'User': 2001,
  'Editor': 1984,
  'Admin': 5150
}

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* we want to protect these routes */}
        <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
          <Route path="/" element={<Home />} />
        </Route>



        <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
          <Route path="admin" element={<Admin />} />
        </Route>


        {/* catch all */}
      </Route>
    </Routes>
  );
}

export default App;