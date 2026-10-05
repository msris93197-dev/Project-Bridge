import { API_URL } from "../../config";
import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import axios from 'axios';

export default function Graph5() {
  const [slotCountsByDepartment, setSlotCountsByDepartment] = useState([]);

  useEffect(() => {
    fetchSlotCountsByDepartment();
  }, []);

  const fetchSlotCountsByDepartment = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/slot-counts-by-department`);
      setSlotCountsByDepartment(response.data);
    } catch (error) {
      console.error('Error fetching slot counts by department:', error);
    }
  };

  // Extract department names and slot counts from slotCountsByDepartment
  const departments = slotCountsByDepartment.map(entry => entry.department);
  const totalSlots = slotCountsByDepartment.map(entry => entry.totalSlots);
  const filledSlots = slotCountsByDepartment.map(entry => entry.filledSlots);

  return (
    <BarChart
      width={800}
      height={400}
      xAxis={[{ scaleType: 'band', data: departments }]}
      series={[
        { data: totalSlots, label: 'Total Slots' },
        { data: filledSlots, label: 'Filled Slots' }
      ]}
    />
  );
}
