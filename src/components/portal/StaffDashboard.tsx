import React, { useState } from 'react';
import {
  Building2,
  Wrench,
  FileCheck,
  Truck,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StaffDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [maintenanceItems, setMaintenanceItems] = useState([
    { id: 'REQ-101', facility: 'Science Laboratory B', issue: 'Gas pipeline pressure valve inspection', priority: 'High', status: 'In Progress' },
    { id: 'REQ-102', facility: 'Computer Lab 1', issue: 'LAN switch port 16 replacement', priority: 'Medium', status: 'Completed' },
    { id: 'REQ-103', facility: 'Main Dining Hall', issue: 'Solar water heater thermostat recalibration', priority: 'Low', status: 'Pending' },
    { id: 'REQ-104', facility: 'School Bus (USS-01)', issue: 'Routine 10,000km service & brake check', priority: 'High', status: 'Scheduled' },
  ]);

  const [facilities] = useState([
    { name: 'Classroom Block Alpha', status: 'Operational', rooms: '8 Rooms', capacity: '360 Students' },
    { name: 'Science Laboratories', status: 'Operational', rooms: 'Physics, Chem, Bio Labs', capacity: '120 Students' },
    { name: 'Computer & ICT Center', status: 'Operational', rooms: '45 Workstations', capacity: 'High-Speed Fiber' },
    { name: 'School Library & Media Hub', status: 'Operational', rooms: '10,000+ Textbooks', capacity: '150 Seating' },
    { name: 'Kibo & Mawenzi Boarding Halls', status: 'Full Capacity', rooms: 'Dormitories', capacity: '400 Boarders' },
  ]);

  return (
    <div className="space-y-6">
      {/* Staff Welcome Bar */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-blue-950 border border-purple-800/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Staff & Operations Portal
              </span>
              <span className="text-xs text-slate-400">Institutional Administration</span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold">
              Welcome, {userProfile?.fullName || 'School Operations Staff'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Manage school facilities, maintenance requisitions, asset logistics, and institutional circulars.
            </p>
          </div>
        </div>
      </div>

      {/* Facilities Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.map((fac, idx) => (
          <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">{fac.name}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {fac.status}
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
              <span>{fac.rooms}</span>
              <span className="font-semibold text-slate-300">{fac.capacity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance Requisitions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Facility & Asset Maintenance Log</h2>
            <p className="text-xs text-slate-400">Real-time status of campus repairs and logistics.</p>
          </div>
          <button
            onClick={() => alert('New maintenance requisition submitted to Campus Operations.')}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Requisition</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Campus Facility</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {maintenanceItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{item.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{item.facility}</td>
                  <td className="py-2.5 px-3 text-slate-300">{item.issue}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.priority === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
