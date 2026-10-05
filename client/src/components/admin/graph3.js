import React, { useEffect, useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import axios from 'axios';

export default function Graph3() {
  const [projectTypeCounts, setProjectTypeCounts] = useState({});

  useEffect(() => {
    fetchProjectTypeCounts();
  }, []);

  const fetchProjectTypeCounts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/project-type-counts');
      setProjectTypeCounts(response.data);
    } catch (error) {
      console.error('Error fetching project type counts:', error);
    }
  };

  // Transform projectTypeCounts into series data format for PieChart
  const seriesData = Object.entries(projectTypeCounts).map(([label, value], index) => ({
    id: index,
    value,
    label,
  }));

  return (
    <PieChart
      series={[{ data: seriesData }]}
      width={400}
      height={300}
    />
  );
}
