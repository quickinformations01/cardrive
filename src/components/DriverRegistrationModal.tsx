import React, { useState, useRef } from 'react';
import { X, CheckCircle2, Upload, Car, ChevronRight, ChevronLeft, ShieldAlert, FileText, Check, Trash2, ExternalLink, Copy, MessageSquare } from 'lucide-react';
import { DriverRegistrationData, VehicleType, Driver } from '../types';

interface DriverRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDriver: (driverData: Driver) => void;
}

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitDriver
}) => {
  const [step, setStep] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadField, setActiveUploadField] = useState<keyof DriverRegistrationData | null>(null);

  const [formData, setFormData] = useState<DriverRegistrationData>({
    fullName: '',
    fatherName: '',
    cnic: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    whatsappCode: '',
    isWhatsappVerified: false,
    vehicleType: 'mini',
    company: '',
    model: '',
    year: '2022',
    color: 'White',
    regNumber: '',
    city: 'Lahore',
    cnicFrontUrl: '',
    cnicBackUrl: '',
    drivingLicenseUrl: '',
    registrationBookUrl: '',
    insuranceUrl: '',
    driverPhotoUrl: '',
    vehicleFrontUrl: '',
    vehicleBackUrl: '',
    vehicleLeftUrl: '',
    vehicleRightUrl: '',
    vehicleInteriorUrl: '',
    payoutMethod: 'JazzCash',
    payoutAccountName: '',
    payoutAccountNumber: '',
    acceptedTerms: false
  });

  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  const [otpCode, setOtpCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Real document uploader triggering native file picker
  const triggerFileUpload = (field: keyof DriverRegistrationData) => {
    setActiveUploadField(field);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadField) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please upload an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && activeUploadField) {
          setFormData((prev) => ({
            ...prev,
            [activeUploadField]: event.target?.result as string
          }));
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (field: keyof DriverRegistrationData, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSendWhatsappOtp = () => {
    const cleanNum = formData.mobile.replace(/\s+/g, '');
    if (cleanNum.length < 10) {
      setError('Please enter a valid mobile number (e.g., 03001234567).');
      return;
    }
    setError('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
  };

  const handleOpenWhatsApp = () => {
    let cleanNum = formData.mobile.replace(/[^0-9]/g, '');
    if (cleanNum.startsWith('03')) {
      cleanNum = '92' + cleanNum.substring(1);
    }
    const text = encodeURIComponent(`ApniCar Verification Code for ${formData.fullName || 'Driver'}: ${generatedOtp}`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanNum}&text=${text}`, '_blank');
  };

  const handleNext = () => {
    setError('');
    // Validation per step
    if (step === 1) {
      if (!formData.fullName || !formData.fatherName || !formData.cnic) {
        setError('Please complete all personal details including Full Name, Father Name, and CNIC.');
        return;
      }
    } else if (step === 2) {
      if (!formData.isWhatsappVerified) {
        setError('Please verify your WhatsApp mobile number before proceeding.');
        return;
      }
    } else if (step === 4) {
      if (!formData.company || !formData.model || !formData.regNumber) {
        setError('Please enter your vehicle company, model, and registration number.');
        return;
      }
    } else if (step === 5) {
      if (!formData.cnicFrontUrl || !formData.drivingLicenseUrl || !formData.driverPhotoUrl) {
        setError('Please upload at least CNIC Front, Driving License, and Driver Photo.');
        return;
      }
    } else if (step === 6) {
      if (!formData.payoutAccountName || !formData.payoutAccountNumber) {
        setError('Please enter your JazzCash/EasyPaisa or Bank account details.');
        return;
      }
    }
    setStep((prev) => Math.min(7, prev + 1));
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptedTerms) {
      setError('You must accept ApniCar Driver Terms & Conditions.');
      return;
    }

    const newDriver: Driver = {
      id: `driver_${Date.now()}`,
      fullName: formData.fullName,
      fatherName: formData.fatherName,
      mobile: formData.mobile,
      email: `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@apnicar.pk`,
      cnic: formData.cnic,
      dob: formData.dob,
      gender: formData.gender,
      licenceNumber: `LIC-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicle: {
        id: `v_${Date.now()}`,
        driverId: `driver_${Date.now()}`,
        type: formData.vehicleType,
        brand: formData.company,
        model: formData.model,
        color: formData.color,
        regNumber: formData.regNumber,
        year: formData.year
      },
      photoUrl: formData.driverPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      cnicFrontUrl: formData.cnicFrontUrl,
      cnicBackUrl: formData.cnicBackUrl,
      licenceImage: formData.drivingLicenseUrl,
      registrationBookUrl: formData.registrationBookUrl,
      insuranceUrl: formData.insuranceUrl,
      vehicleFrontUrl: formData.vehicleFrontUrl,
      vehicleBackUrl: formData.vehicleBackUrl,
      vehicleLeftUrl: formData.vehicleLeftUrl,
      vehicleRightUrl: formData.vehicleRightUrl,
      vehicleInteriorUrl: formData.vehicleInteriorUrl,
      payoutMethod: formData.payoutMethod,
      payoutAccountName: formData.payoutAccountName,
      payoutAccountNumber: formData.payoutAccountNumber,
      status: 'pending', // Pending Admin Approval
      isOnline: false,
      lat: 31.5204,
      lng: 74.3587,
      city: formData.city || 'Lahore',
      rating: 5.0,
      totalTrips: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString()
    };

    onSubmitDriver(newDriver);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Step {step} of 7</span>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🚖</span> Register as Driver
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-7 gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Hidden File Input for Document & Photo Uploads */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium text-center">
            {error}
          </div>
        )}

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Step 1: Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Muhammad Usman"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Father Name *</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="e.g. Abdul Rasheed"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">CNIC Number *</label>
                <input
                  type="text"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  placeholder="35202-1234567-1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Mobile & WhatsApp Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Step 2: WhatsApp Number Verification</h3>
            
            {!formData.isWhatsappVerified ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">WhatsApp Mobile Number *</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="03001234567"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendWhatsappOtp}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Generate WhatsApp Code</span>
                  </button>
                ) : (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">WhatsApp Code</span>
                        <span className="text-xl font-black text-emerald-400 font-mono tracking-widest">{generatedOtp}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenWhatsApp}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Send to WhatsApp</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Enter 6-Digit WhatsApp Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder={generatedOtp}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 text-center text-lg font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (otpCode.trim() === generatedOtp || otpCode.trim() === '123456') {
                          setFormData({ ...formData, isWhatsappVerified: true });
                          setError('');
                        } else {
                          setError(`Invalid Code. Please enter ${generatedOtp} (or 123456)`);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Confirm Number</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Mobile Verified via WhatsApp</h4>
                <p className="text-xs text-emerald-300/80 font-mono">{formData.mobile}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Vehicle Type */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Step 3: Select Vehicle Type</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { type: 'bike', label: 'Bike / Motorcycle', icon: '🏍️' },
                { type: 'rickshaw', label: 'Auto Rickshaw', icon: '🛺' },
                { type: 'mini', label: 'Car / Hatchback', icon: '🚗' },
                { type: 'sedan', label: 'Comfort / Sedan', icon: '🚘' },
                { type: 'suv', label: 'SUV / Van', icon: '🚐' }
              ].map((v) => (
                <button
                  key={v.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, vehicleType: v.type as VehicleType })}
                  className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                    formData.vehicleType === v.type
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-3xl">{v.icon}</span>
                  <span className="text-xs font-bold">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Vehicle Details */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Step 4: Vehicle Specs</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Brand / Company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Suzuki / Honda / Toyota"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Model *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. Alto VXR / CG 125"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2022"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="White / Silver / Black"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Registration Number *</label>
                <input
                  type="text"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  placeholder="LEA-24-9102"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Lahore / Karachi / Islamabad"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Document Uploads */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Step 5: Document Scan Copies</h3>
              <span className="text-[11px] text-emerald-400 font-medium">Click any box to upload scan copy / photo</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { field: 'cnicFrontUrl', label: 'CNIC Front Copy' },
                { field: 'cnicBackUrl', label: 'CNIC Back Copy' },
                { field: 'drivingLicenseUrl', label: 'Driving License' },
                { field: 'registrationBookUrl', label: 'Registration Book' },
                { field: 'insuranceUrl', label: 'Insurance (Optional)' },
                { field: 'driverPhotoUrl', label: 'Driver Selfie / Photo' },
                { field: 'vehicleFrontUrl', label: 'Vehicle Front View' },
                { field: 'vehicleBackUrl', label: 'Vehicle Rear View' },
                { field: 'vehicleLeftUrl', label: 'Vehicle Left Side' },
                { field: 'vehicleRightUrl', label: 'Vehicle Right Side' },
                { field: 'vehicleInteriorUrl', label: 'Vehicle Interior' }
              ].map((doc) => {
                const key = doc.field as keyof DriverRegistrationData;
                const fileVal = formData[key] as string;
                const isUploaded = !!fileVal;

                return (
                  <div
                    key={doc.field}
                    onClick={() => triggerFileUpload(key)}
                    className={`p-2.5 rounded-2xl border text-center cursor-pointer transition flex flex-col items-center justify-between min-h-[110px] relative group overflow-hidden ${
                      isUploaded
                        ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:border-emerald-500/50 hover:bg-slate-800'
                    }`}
                  >
                    {isUploaded ? (
                      <div className="w-full space-y-1.5 flex flex-col items-center">
                        <div className="relative w-full h-16 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950">
                          <img
                            src={fileVal}
                            alt={doc.label}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleRemoveFile(key, e)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-md transition"
                            title="Remove file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Uploaded
                        </span>
                      </div>
                    ) : (
                      <div className="my-auto flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-200 font-medium">Click to Upload</span>
                      </div>
                    )}
                    <span className="text-[11px] font-bold line-clamp-1 mt-1">{doc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Bank Account / Mobile Wallet */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Step 6: Payout & Bank Account</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Payout Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['JazzCash', 'EasyPaisa', 'Bank Account'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, payoutMethod: m })}
                      className={`p-2.5 rounded-xl border font-bold text-xs transition ${
                        formData.payoutMethod === m
                          ? 'bg-emerald-500/20 border-emerald-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Account Title / Name *</label>
                <input
                  type="text"
                  value={formData.payoutAccountName}
                  onChange={(e) => setFormData({ ...formData, payoutAccountName: e.target.value })}
                  placeholder="e.g. Muhammad Usman"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Account / IBAN / Mobile Number *</label>
                <input
                  type="text"
                  value={formData.payoutAccountNumber}
                  onChange={(e) => setFormData({ ...formData, payoutAccountNumber: e.target.value })}
                  placeholder="03001234567 or PK00JAZZ123..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Terms & Final Submission */}
        {step === 7 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Step 7: Final Terms & Agreement</h3>
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="font-bold text-emerald-400">ApniCar 0% Commission Guarantee:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>You keep 100% of all ride cash fares collected from passengers.</li>
                <li>Your application will be submitted to ApniCar Admin for Document Verification.</li>
                <li>Approval takes ~1-2 hours upon document verification.</li>
              </ul>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-xs text-slate-200 font-medium">I agree to ApniCar Driver Terms & Partner Rules</span>
            </label>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 font-black text-slate-950 text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition"
            >
              Submit Application for Admin Review
            </button>
          </form>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {step < 7 && (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
