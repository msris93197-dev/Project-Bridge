import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import axios from 'axios';

export default function Graph4() {
  const [projectTypeCountsByDepartment, setProjectTypeCountsByDepartment] = useState([]);

  useEffect(() => {
    fetchProjectTypeCountsByDepartment();
  }, []);

  const fetchProjectTypeCountsByDepartment = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/project-type-counts-by-department');
      setProjectTypeCountsByDepartment(response.data);
    } catch (error) {
      console.error('Error fetching project type counts by department:', error);
    }
  };

  // Extract department names and counts for each project type
  const departments = projectTypeCountsByDepartment.map(entry => entry[0]);
  const countsByDepartment = projectTypeCountsByDepartment.map(entry => Object.values(entry[1]));

  return (
    <BarChart
      width={800}
      height={400}
      xAxis={[{ scaleType: 'band', data: departments }]}
      series={[
        { data: countsByDepartment.map(counts => counts[0]), label: 'LOP' },
        { data: countsByDepartment.map(counts => counts[1]), label: 'SOP' },
        { data: countsByDepartment.map(counts => counts[2]), label: 'DOP' }
      ]}
    />
  );
}
