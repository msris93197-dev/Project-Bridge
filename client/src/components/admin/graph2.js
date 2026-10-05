import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';

export default function Graph2() {
  const [avgRequestsData, setAvgRequestsData] = useState([]);

  useEffect(() => {
    fetchAvgRequestsPerDepartment();
  }, []);

  const fetchAvgRequestsPerDepartment = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/avg-requests-per-department');
      setAvgRequestsData(response.data);
    } catch (error) {
      console.error('Error fetching average requests per department:', error);
    }
  };

  // Extract department names and averages from avgRequestsData
  const departments = avgRequestsData.map(entry => entry.department);
  const avgRequests = avgRequestsData.map(entry => entry.avgRequests);
  const avgAccepted = avgRequestsData.map(entry => entry.avgAccepted);
  const avgRejected = avgRequestsData.map(entry => entry.avgRejected);
  const avgPending = avgRequestsData.map(entry => entry.avgPending);

  return (
    <LineChart
      width={600}
      height={400}
      series={[
        { data: avgRequests, label: 'Average Requests per Project' },
        { data: avgAccepted, label: 'Average Requests Accepted' },
        { data: avgRejected, label: 'Average Requests Rejected' },
        { data: avgPending, label: 'Average Requests Pending' },
      ]}
      xAxis={[{ scaleType: 'point', data: departments }]}
    />
  );
}
