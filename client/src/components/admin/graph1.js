import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';

export default function Graph1() {
  const [departmentData, setDepartmentData] = useState([]);

  useEffect(() => {
    fetchProjectsPerDepartment();
  }, []);

  const fetchProjectsPerDepartment = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/projects-per-department');
      setDepartmentData(response.data);
    } catch (error) {
      console.error('Error fetching projects per department:', error);
    }
  };

  // Extract department names and project counts from departmentData
  const departments = departmentData.map(entry => entry.department);
  const projectCounts = departmentData.map(entry => entry.count);

  return (
    <LineChart
      width={600}
      height={400}
      series={[{ data: projectCounts, label: 'Number of Projects' }]}
      xAxis={[{ scaleType: 'point', data: departments }]}
    />
  );
}
