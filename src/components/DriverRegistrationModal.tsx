import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ShieldCheck, Car, User, FileText } from 'lucide-react';
import { VehicleType } from '../types';

interface DriverRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDriver: (data: any) => void;
}

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitDriver
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [city, setCity] = useState('Lahore');

  const [vehicleType, setVehicleType] = useState<VehicleType>('mini');
  const [vehicleBrand, setVehicleBrand] = useState('Suzuki');
  const [vehicleModel, setVehicleModel] = useState('Alto VXR');
  const [vehicleColor, setVehicleColor] = useState('White');
  const [regNumber, setRegNumber] = useState('LEA-24-9900');

  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [cnicImage, setCnicImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80');
  const [licenceImage, setLicenceImage] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80');
  const [vehicleImage, setVehicleImage] = useState('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDriver({
      fullName,
      mobile,
      email,
      cnic,
      licenceNumber,
      city,
      vehicleType,
      vehicleBrand,
      vehicleModel,
      vehicleColor,
      regNumber,
      photoUrl,
      cnicImage,
      licenceImage,
      vehicleImage
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white">Join Apni Car Driver Network</h2>
          <p className="text-xs text-slate-400">Keep 100% of all passenger cash fares. 0% Commission!</p>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-bold text-slate-400">
          <button onClick={() => setStep(1)} className={`flex items-center gap-1 ${step === 1 ? 'text-emerald-400' : ''}`}>
            <User className="w-4 h-4" /> 1. Personal
          </button>
          <button onClick={() => setStep(2)} className={`flex items-center gap-1 ${step === 2 ? 'text-emerald-400' : ''}`}>
            <Car className="w-4 h-4" /> 2. Vehicle
          </button>
          <button onClick={() => setStep(3)} className={`flex items-center gap-1 ${step === 3 ? 'text-emerald-400' : ''}`}>
            <FileText className="w-4 h-4" /> 3. Documents
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Kashif"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="03001234567"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">CNIC Number *</label>
                <input
                  type="text"
                  required
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="35202-1234567-1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Driving Licence Number *</label>
                <input
                  type="text"
                  required
                  value={licenceNumber}
                  onChange={(e) => setLicenceNumber(e.target.value)}
                  placeholder="LHR-2024-8891"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider"
              >
                Next: Vehicle Details →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Vehicle Type *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                >
                  <option value="bike">Apni Bike 🏍️</option>
                  <option value="rickshaw">Apni Auto Rickshaw 🛺</option>
                  <option value="mini">Apni Mini (Alto/Cultus) 🚗</option>
                  <option value="sedan">Apni Comfort Sedan 🚘</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Brand</label>
                  <input
                    type="text"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="Suzuki / Honda / Toyota"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Model & Color</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Alto VXR White"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Registration Plate Number *</label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="LEA-24-9102"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase"
                >
                  Next: Upload Docs →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-400">
                Upload photos for admin verification. (Preset attachments ready for instant demo).
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                  <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span>Driver Photo Attached ✓</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                  <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span>CNIC Photo Attached ✓</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                  <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span>Driving Licence Attached ✓</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                  <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span>Vehicle Photo Attached ✓</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
              >
                Submit Registration For Admin Approval
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
