import { Route, Routes } from 'react-router';
import './App.css';
import Admin from './admin';
import Attd from './attdence';
import Teamdash from './Teamdash';
import Review from './Review';
import TeamMarks from './TeamMarks';
import AttdenceDetail from './AttdenceDetail';
import Instructions from "./Instructions";
import AdminControls from './AdminControls'
import Landing from './Landing';
import GameLeaderboard from './GameLeaderboard';

function App() {
    return (
        <Routes >
        <Route path='/' element={<Instructions/>}/>
        <Route path='/home' element={<Landing/>}/>
        <Route path='/admin-login' element={<Admin/>}/>
        <Route path='/attdence' element={<Attd/>}/>
        <Route path='/teamlogin' element={<Teamdash/>}/>
        <Route path='/review' element={<Review/>}/>
        <Route path='/TeamMarks' element={<TeamMarks/>}/>
        <Route path='/attdencedetails' element={<AttdenceDetail/>}/>
        <Route path='/admin-controls' element={<AdminControls />} />
        <Route path='/game-leaderboard' element={<GameLeaderboard />} />
      </Routes>           
    );
}

export default App