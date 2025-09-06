import { Route, Routes } from 'react-router';
import './App.css';
import Admin from './admin';
import Attd from './attdence';
import Teamdash from './Teamdash';
import Review from './Review';
import TeamMarks from './TeamMarks';
import AttdDetail from './AttdDetail';
import Instructions from "./Instructions";
import AdminControls from './AdminControls'
import Landing from './Landing';

function App() {
    return (
        <Routes >
        <Route path='/' element={<Landing/>}/>
        <Route path='/admin-login' element={<Admin/>}/>
        <Route path='/attd' element={<Attd/>}/>
        <Route path='/teamlogin' element={<Teamdash/>}/>
        <Route path='/review' element={<Review/>}/>
        <Route path='/TeamMarks' element={<TeamMarks/>}/>
        <Route path='/attdetail' element={<AttdDetail/>}/>
        <Route path='/instructions' element={<Instructions/>}/>
        <Route path='/admin-controls' element={<AdminControls />} />
      </Routes>           
    );
}

export default App