import React, { useState, useEffect } from 'react';
import { Gauge } from '@mui/x-charts/Gauge';
export default function Graph6() {
  const [counts, setCounts] = useState({
    totalUsers: 'Loading...',
    teachersCount: 'Loading...',
    studentsCount: 'Loading...'
  });


  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://localhost:8000/admin/getusercount');
        const data = await response.json();
        console.log(data);
        setCounts(data);
      } catch (error) {
        console.error('Error fetching user counts:', error.message);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <div  className="box total-users" >
        <h2>Total Users</h2>
        <Gauge width={100} height={100} value={counts.totalUsers} />
        {/* <p>{counts.totalUsers}</p> */}
      </div>
      <div className="box professors">
        <h2>Professors</h2>
        <Gauge width={100} height={100} value={counts.teachersCount} startAngle={-90} endAngle={90} />
        {/* <p>{counts.teachersCount}</p> */}
      </div>
      <div  className="box students">
        <h2>Students</h2>
        <Gauge width={100} height={100} value={counts.studentsCount} startAngle={-90} endAngle={90} />
        {/* <p>{counts.studentsCount}</p> */}
      </div>
    </div>
  );
}