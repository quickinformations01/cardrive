import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Car, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertOctagon, 
  FileText, 
  Eye, 
  Search,
  Filter,
  DollarSign,
  Building,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Driver, Subscription, AdminStats, DriverStatus } from '../types';

interface AdminDashboardProps {
  stats: AdminStats;
  drivers: Driver[];
  subscriptions: Subscription[];
  onUpdateDriverStatus: (driverId: string, status: DriverStatus, note?: string) => void;
}

const REVENUE_BY_PLAN_DATA = [
  { name: 'Daily (30 PKR)', revenue: 1800, count: 60 },
  { name: 'Weekly (200 PKR)', revenue: 8400, count: 42 },
  { name: 'Monthly (500 PKR)', revenue: 22500, count: 45 }
];

const VEHICLE_DISTRIBUTION_DATA = [
  { name: 'Bike', value: 40, color: '#10b981' },
  { name: 'Rickshaw', value: 25, color: '#f59e0b' },
  { name: 'Mini Car', value: 25, color: '#3b82f6' },
  { name: 'Comfort Sedan', value: 10, color: '#8b5cf6' }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  drivers,
  subscriptions,
  onUpdateDriverStatus
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverDocModal, setSelectedDriverDocModal] = useState<Driver | null>(null);

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.mobile.includes(searchTerm) ||
                          d.cnic.includes(searchTerm) ||
                          d.vehicle.regNumber.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && d.status === filterStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Drivers</p>
          <p className="text-xl font-black text-white mt-1">{stats.totalDrivers}</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 shadow-xl">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online Now</p>
          <p className="text-xl font-black text-emerald-400 mt-1">{stats.activeOnlineDrivers}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Riders</p>
          <p className="text-xl font-black text-white mt-1">{stats.totalRiders}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Trips</p>
          <p className="text-xl font-black text-white mt-1">{stats.totalTrips}</p>
        </div>

        <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-3.5 shadow-xl">
          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Sub Revenue</p>
          <p className="text-xl font-black text-teal-300 mt-1">PKR {stats.totalSubscriptionRevenuePKR}</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-3.5 shadow-xl">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Docs</p>
          <p className="text-xl font-black text-amber-400 mt-1">{stats.pendingApprovals}</p>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-3.5 shadow-xl">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Expired Subs</p>
          <p className="text-xl font-black text-rose-400 mt-1">{stats.expiredSubscriptions}</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Subscription Plan Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Subscription Sales Breakdown (PKR)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_BY_PLAN_DATA}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Fleet Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-indigo-400" /> Active Fleet Category Share
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VEHICLE_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {VEHICLE_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Driver Verification & Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Driver Document Verification & Approval Queue
            </h3>
            <p className="text-xs text-slate-400">Review CNIC, Driving License, and Vehicle registration details</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search driver / CNIC / reg #"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Tabs */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved Drivers</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Drivers List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">Driver Info</th>
                <th className="py-3 px-3">CNIC & Licence</th>
                <th className="py-3 px-3">Vehicle Details</th>
                <th className="py-3 px-3">Subscription</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-800/50 transition">
                  {/* Driver Name & Photo */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={driver.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt="Photo" 
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-white">{driver.fullName}</p>
                        <p className="text-[10px] text-slate-400">{driver.mobile}</p>
                      </div>
                    </div>
                  </td>

                  {/* CNIC & Licence */}
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <p className="text-slate-200">CNIC: {driver.cnic}</p>
                    <p className="text-slate-400">Lic: {driver.licenceNumber}</p>
                  </td>

                  {/* Vehicle */}
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-200">{driver.vehicle.brand} {driver.vehicle.model}</p>
                    <p className="text-[10px] text-emerald-400 font-mono uppercase">{driver.vehicle.regNumber} ({driver.vehicle.type})</p>
                  </td>

                  {/* Subscription status */}
                  <td className="py-3 px-3">
                    {driver.currentSubscription?.status === 'active' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold text-[10px]">
                        Active ({driver.currentSubscription.planType.toUpperCase()})
                      </span>
                    ) : (
                      <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-bold text-[10px]">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Driver Approval Status */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                      driver.status === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : driver.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {driver.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDriverDocModal(driver)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                        title="View Uploaded Documents"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {driver.status !== 'approved' && (
                        <button
                          onClick={() => onUpdateDriverStatus(driver.id, 'approved', 'Documents verified & approved by Admin.')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold text-[11px]"
                        >
                          Approve
                        </button>
                      )}

                      {driver.status === 'approved' && (
                        <button
                          onClick={() => onUpdateDriverStatus(driver.id, 'suspended', 'Account suspended by Admin.')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold text-[11px]"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-400" /> Driver Subscription Payment Sales Audit
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Driver Name</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment Gateway</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">{sub.transactionId}</td>
                  <td className="py-3 px-3 font-bold text-white">{sub.driverName || 'Driver'}</td>
                  <td className="py-3 px-3 uppercase text-slate-300">{sub.planType} Pass</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">PKR {sub.amountPKR}</td>
                  <td className="py-3 px-3 font-medium text-slate-300">{sub.paymentGateway}</td>
                  <td className="py-3 px-3 text-slate-400">{new Date(sub.expiryDate).toLocaleDateString()}</td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                      {sub.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Inspection Modal */}
      {selectedDriverDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                Uploaded Verification Documents – {selectedDriverDocModal.fullName}
              </h3>
              <button
                onClick={() => setSelectedDriverDocModal(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-300 mb-1">CNIC Document Photo</p>
                <div className="h-40 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                  <img src={selectedDriverDocModal.cnicImage} alt="CNIC" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-300 mb-1">Driving Licence Photo</p>
                <div className="h-40 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                  <img src={selectedDriverDocModal.licenceImage} alt="Licence" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-bold text-slate-300 mb-1">Vehicle Image ({selectedDriverDocModal.vehicle.regNumber})</p>
                <div className="h-48 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                  <img src={selectedDriverDocModal.vehicleImage} alt="Vehicle" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onUpdateDriverStatus(selectedDriverDocModal.id, 'approved', 'Documents verified!');
                  setSelectedDriverDocModal(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase"
              >
                Approve Driver
              </button>
              <button
                onClick={() => {
                  onUpdateDriverStatus(selectedDriverDocModal.id, 'rejected', 'Documents incomplete or invalid.');
                  setSelectedDriverDocModal(null);
                }}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase"
              >
                Reject Documents
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
