import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle, User, Briefcase, FileText, ShieldCheck,
    ChevronRight, ChevronLeft, Upload, X, Clock, Zap, Check, AlertCircle, Info, Loader2,
    MapPin, Award, ImageIcon, FileCheck, Camera
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../Redux/store";
import { fetchMe } from "../../../Redux/slices/authSlice";
import { becomeProvider, completeProfile } from "../../../services/providerService";
import { getAllCategories } from "../../../services/categoryService";
import type { Category } from "../../../types/categoryTypes";
import toast from "react-hot-toast";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Textarea from "../../ui/Textarea";
import Button from "../../ui/Button";
import Select from "../../ui/Select";

const STEPS = [
    { id: 1, title: "Personal Details", icon: User },
    { id: 2, title: "Professional info", icon: Briefcase },
    { id: 3, title: "Identity & Photo", icon: FileText },
    { id: 4, title: "Submission", icon: ShieldCheck },
];

const GENDER_OPTIONS = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
    { label: "Prefer not to say", value: "Prefer not to say" },
];

const EXPERIENCE_OPTIONS = [
    { label: "Less than 1 year", value: "0" },
    { label: "1–2 years", value: "1" },
    { label: "2–5 years", value: "2" },
    { label: "5+ years", value: "5" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RESPONSE_TIMES = [
    { label: "Within 30 minutes", value: "30m" },
    { label: "Within 1 hour", value: "1h" },
    { label: "Within 2 hours", value: "2h" },
];

export default function BecomeProvider() {
    const dispatch = useDispatch<AppDispatch>();
    const { profile, loading: profileLoading } = useSelector((state: RootState) => state.auth);

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        // Step 1
        gender: "",
        address: "",
        district: "",
        municipality: "",

        // Step 2
        categoryId: "",
        skills: "",
        bio: "",
        legalName: "",
        experienceYears: "0",
        prevCompany: "",
        prevRole: "",
        workDuration: "",

        // Portfolio & Availability
        serviceDistrict: "",
        serviceMunicipality: "",
        availabilityDays: [] as string[],
        availabilityTime: "09:00 - 17:00",

        // Emergency
        isEmergencyAvailable: false,
        emergencyResponseTime: "1h",
        emergencyExtraCharge: 0,

        // Pricing
        price: 0,
        duration: "Per Hour",
    });

    const [portfolio, setPortfolio] = useState<File[]>([]);
    const [tradeLicense, setTradeLicense] = useState<File | null>(null);
    const [govtIdFront, setGovtIdFront] = useState<File | null>(null);
    const [govtIdBack, setGovtIdBack] = useState<File | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        dispatch(fetchMe());
        getAllCategories().then(setCategories).catch(console.error);
    }, [dispatch]);

   useEffect(() => {
    if (profile) {
        const p = profile.provider || {};
        
        // Always set user data
        const baseData = {
            address: profile.address || "",
            district: profile.district || "",
            municipality: profile.municipality || "",
            gender: profile.gender || "",
            // Use user's name as default legal name for new providers
            legalName: p.legalName || profile.name || "",
        };

        // Only add provider-specific data if provider exists
        const providerData = p.id ? {
            experienceYears: p.experienceYears?.toString() || "0",
            bio: p.bio || "",
            skills: p.skills || "",
            prevCompany: p.prevCompany || "",
            prevRole: p.prevRole || "",
            workDuration: p.workDuration || "",
            serviceDistrict: p.serviceDistrict || profile.district || "",
            serviceMunicipality: p.serviceMunicipality || profile.municipality || "",
            availabilityDays: p.availabilityDays ? p.availabilityDays.split(",") : [],
            availabilityTime: p.availabilityTime || "09:00 - 17:00",
            isEmergencyAvailable: !!p.isEmergencyAvailable,
            emergencyResponseTime: p.emergencyResponseTime || "1h",
            emergencyExtraCharge: p.emergencyExtraCharge || 0,
            price: p.price || 0,
            duration: p.duration || "Per Hour",
            categoryId: p.categoryId || "",
        } : {};

        setFormData(prev => ({
            ...prev,
            ...baseData,
            ...providerData
        }));

        // Set submission state based on status
        if (p.verificationStatus && p.verificationStatus !== "INCOMPLETE") {
            setIsSubmitted(true);
            setCurrentStep(4);
        }
    }
}, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleToggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            availabilityDays: prev.availabilityDays.includes(day)
                ? prev.availabilityDays.filter(d => d !== day)
                : [...prev.availabilityDays, day]
        }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: any, multiple = false) => {
        if (e.target.files) {
            if (multiple) {
                setter((prev: any) => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
            } else {
                setter(e.target.files[0]);
            }
        }
    };

    const handleSubmit = async () => {
    setLoading(true);
    try {
        // Check for required files
        if (!govtIdFront || !govtIdBack) {
            toast.error("Please upload both sides of your government ID");
            setLoading(false);
            return;
        }

        const formDataToSubmit = new FormData();

        // Append all text fields from formData (only defined values)
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'availabilityDays') {
                    formDataToSubmit.append(key, (value as string[]).join(','));
                } else if (key === 'price' || key === 'emergencyExtraCharge') {
                    // Handle numeric fields
                    formDataToSubmit.append(key, value.toString());
                } else if (key === 'isEmergencyAvailable') {
                    // Handle boolean field
                    formDataToSubmit.append(key, value.toString());
                } else {
                    formDataToSubmit.append(key, value.toString());
                }
            }
        });

        // Add standard fields
        formDataToSubmit.append('verificationStatus', 'UNDER_REVIEW');
        
        // Append categoryId if selected
        if (formData.categoryId) {
            formDataToSubmit.append('categoryId', formData.categoryId);
        }

        // Append files if they exist
        if (profilePhoto) formDataToSubmit.append("photo", profilePhoto);
        if (govtIdFront) formDataToSubmit.append("govtIdFront", govtIdFront);
        if (govtIdBack) formDataToSubmit.append("govtIdBack", govtIdBack);
        if (tradeLicense) formDataToSubmit.append("tradeLicense", tradeLicense);

        // Append portfolio images
      portfolio.forEach((file) => {
    formDataToSubmit.append("portfolioImages", file); // Make sure this matches the backend
});

        // FIX: Check if provider profile exists (not just role)
        // Check both ways - if profile exists and has provider data
        const hasExistingProvider = profile?.provider?.id !== undefined;
        
        console.log("Submitting form with:", {
            hasExistingProvider,
            userRole: profile?.role,
            providerId: profile?.provider?.id
        });

        await (hasExistingProvider ? completeProfile(formDataToSubmit) : becomeProvider(formDataToSubmit));

        toast.success("Onboarding submitted successfully!");
        setIsSubmitted(true);
        setCurrentStep(4);
        dispatch(fetchMe());
    } catch (error: any) {
        console.error("Submission error:", error);
        toast.error(error.response?.data?.message || "Something went wrong during submission");
    } finally {
        setLoading(false);
    }
};

    if (profileLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Stepper Header */}
            {!isSubmitted && (
                <div className="flex justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center bg-white px-2">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? "border-blue-600 bg-blue-50 text-blue-600 shadow-md scale-110" :
                                        isCompleted ? "border-green-500 bg-green-500 text-white" :
                                            "border-gray-300 bg-white text-gray-400"
                                        }`}
                                >
                                    {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Main Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentStep === 1 && (
                        <Card className="p-8 shadow-xl border-0 ring-1 ring-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={24} /></div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                                    <p className="text-gray-500 text-sm">Review and update your basic profile details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Full Name</label>
                                        <Input value={profile?.name || ""} disabled className="bg-gray-50 border-gray-200" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Email Address</label>
                                        <Input value={profile?.email || ""} disabled className="bg-gray-50 border-gray-200" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Phone Number</label>
                                        <Input value={profile?.phone || ""} disabled className="bg-gray-50 border-gray-200" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Gender</label>
                                        <Select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            options={GENDER_OPTIONS}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Address</label>
                                        <Input name="address" value={formData.address} onChange={handleChange} placeholder="Local Address" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-1 block">District</label>
                                            <Input name="district" value={formData.district} onChange={handleChange} placeholder="District" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-1 block">Municipality</label>
                                            <Input name="municipality" value={formData.municipality} onChange={handleChange} placeholder="Municipality" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                                <AlertCircle className="text-yellow-600 mr-3" size={20} />
                                <p className="text-sm text-yellow-700 font-medium">Complete your personal information to continue provider onboarding</p>
                            </div>

                            <div className="mt-10 flex justify-end">
                                <Button onClick={nextStep} className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200">
                                    Continue <ChevronRight size={18} className="ml-2" />
                                </Button>
                            </div>
                        </Card>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <Card className="p-8 shadow-xl border-0 ring-1 ring-gray-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Briefcase size={24} /></div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Professional Details</h2>
                                        <p className="text-gray-500 text-sm">Tell us about your expertise and services</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Service & Skills */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-8">
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Legal / Business Name</label>
                                            <Input name="legalName" value={formData.legalName} onChange={handleChange} placeholder="e.g. Rahul's Plumbing Services" required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Service Category</label>
                                            <Select
                                                name="categoryId"
                                                value={formData.categoryId}
                                                onChange={handleChange}
                                                options={categories.map(c => ({ label: c.name, value: c.id }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Skills (Comma separated)</label>
                                            <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Plumbing, Leak Repair, Pipe Installation" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block flex justify-between">
                                                Service Description
                                                <span className={`text-xs ${formData.bio.length < 150 ? "text-red-500" : "text-green-500"}`}>
                                                    {formData.bio.length}/150
                                                </span>
                                            </label>
                                            <Textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                rows={4}
                                                placeholder="Write a detailed description of your services and expertise..."
                                            />
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    <div className="space-y-6 border-b border-gray-100 pb-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award className="text-blue-500" size={20} />
                                            <h3 className="font-bold text-gray-700">Work Experience</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600 mb-2 block">Years of Experience</label>
                                                <Select
                                                    name="experienceYears"
                                                    value={formData.experienceYears}
                                                    onChange={handleChange}
                                                    options={EXPERIENCE_OPTIONS}
                                                />
                                            </div>
                                            {(formData.experienceYears === "2" || formData.experienceYears === "5") && (
                                                <>
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Previous Workplace</label>
                                                        <Input name="prevCompany" value={formData.prevCompany} onChange={handleChange} placeholder="Company Name" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Role / Position</label>
                                                        <Input name="prevRole" value={formData.prevRole} onChange={handleChange} placeholder="Senior Technician" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Work Duration</label>
                                                        <Input name="workDuration" value={formData.workDuration} onChange={handleChange} placeholder="2020 - 2023" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Portfolio */}
                                    <div className="space-y-4 border-b border-gray-100 pb-8">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ImageIcon className="text-blue-500" size={20} />
                                            <h3 className="font-bold text-gray-700">Work Portfolio (3-5 Photos)</h3>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                            {portfolio.map((file, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-200 group">
                                                    <img src={URL.createObjectURL(file)} alt="portfolio" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setPortfolio(portfolio.filter((_, i) => i !== idx))}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Delete photo"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {portfolio.length < 5 && (
                                                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-400">
                                                    <PlusIcon size={24} />
                                                    <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Upload</span>
                                                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileUpload(e, setPortfolio, true)} />
                                                </label>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">Upload photos that clearly show your previous work (max 5)</p>
                                    </div>

                                    {/* Service Area */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="text-blue-500" size={20} />
                                            <h3 className="font-bold text-gray-700">Service Area & Availability</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-600 mb-2 block">District</label>
                                                    <Input name="serviceDistrict" value={formData.serviceDistrict} onChange={handleChange} placeholder="District" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Municipality</label>
                                                    <Input name="serviceMunicipality" value={formData.serviceMunicipality} onChange={handleChange} placeholder="Municipality" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600 mb-2 block">Availability Days</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {DAYS.map(day => (
                                                        <button
                                                            key={day}
                                                            onClick={() => handleToggleDay(day)}
                                                            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${formData.availabilityDays.includes(day)
                                                                ? "bg-blue-600 text-white shadow-md"
                                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                                }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-8">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Base Price (NPR)</label>
                                            <Input type="number" name="price" value={formData.price.toString()} onChange={handleChange} placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600 mb-2 block">Duration Policy</label>
                                            <Input name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. Per Hour" />
                                        </div>
                                    </div>

                                    {/* Emergency Service Section */}
                                    <div className={`p-6 rounded-2xl border-2 transition-all ${formData.isEmergencyAvailable ? "bg-red-50 border-red-100 shadow-inner" : "bg-gray-50 border-gray-100"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${formData.isEmergencyAvailable ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${formData.isEmergencyAvailable ? "text-red-700" : "text-gray-600"}`}>Emergency Service Availability</h3>
                                                    <p className="text-xs text-gray-500">Available for urgent service requests</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer" title="Toggle emergency availability">
                                                <input
                                                    type="checkbox"
                                                    name="isEmergencyAvailable"
                                                    checked={formData.isEmergencyAvailable}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isEmergencyAvailable: e.target.checked }))}
                                                    className="sr-only peer"
                                                    aria-label="Emergency service availability"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                            </label>
                                        </div>

                                        {formData.isEmergencyAvailable && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="mt-6 pt-6 border-t border-red-100 grid grid-cols-1 md:grid-cols-2 gap-6"
                                            >
                                                <div>
                                                    <label className="text-sm font-semibold text-red-700 mb-2 block">Response Time</label>
                                                    <Select
                                                        name="emergencyResponseTime"
                                                        value={formData.emergencyResponseTime}
                                                        onChange={handleChange}
                                                        options={RESPONSE_TIMES}
                                                        className="border-red-200 focus:ring-red-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-red-700 mb-2 block">Emergency Extra Charge (NPR)</label>
                                                    <Input
                                                        type="number"
                                                        name="emergencyExtraCharge"
                                                        value={formData.emergencyExtraCharge.toString()}
                                                        onChange={handleChange}
                                                        className="border-red-200 focus:ring-red-500"
                                                        placeholder="Extra amount"
                                                    />
                                                    <p className="text-[10px] text-red-400 mt-1">Extra amount charged for emergency service requests</p>
                                                </div>
                                                <div className="md:col-span-2 p-3 bg-red-100/50 rounded-lg flex items-start gap-2">
                                                    <Info className="text-red-500 mt-0.5" size={14} />
                                                    <p className="text-xs text-red-700">Emergency services are shown separately and charged at a higher rate.</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <div className="flex justify-between items-center p-4">
                                <Button onClick={prevStep} variant="outline" className="px-8 py-3 rounded-xl border-gray-300">
                                    <ChevronLeft size={18} className="mr-2" /> Back
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    disabled={formData.bio.length < 150}
                                    className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50"
                                >
                                    Save & Continue <ChevronRight size={18} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <Card className="p-8 shadow-xl border-0 ring-1 ring-gray-100">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText size={24} /></div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Identity Documents</h2>
                                    <p className="text-gray-500 text-sm">Upload official documents for verification</p>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {/* Govt ID */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                            <ShieldCheck className="text-blue-500" size={20} /> Government ID Upload
                                        </h3>
                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded">Required</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500">Front Side</p>
                                            <label className={`relative h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${govtIdFront ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-400"}`}>
                                                {govtIdFront ? (
                                                    <>
                                                        <FileCheck className="text-green-500 mb-2" size={32} />
                                                        <span className="text-xs font-bold text-green-700">{govtIdFront.name}</span>
                                                        <button onClick={(e) => { e.preventDefault(); setGovtIdFront(null); }} className="absolute top-2 right-2 p-1 bg-white shadow-sm rounded-full text-red-500"><X size={14} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="text-gray-400 mb-2" size={32} />
                                                        <span className="text-xs font-bold text-gray-500">Click to upload Front</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setGovtIdFront)} />
                                            </label>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500">Back Side</p>
                                            <label className={`relative h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${govtIdBack ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-400"}`}>
                                                {govtIdBack ? (
                                                    <>
                                                        <FileCheck className="text-green-500 mb-2" size={32} />
                                                        <span className="text-xs font-bold text-green-700">{govtIdBack.name}</span>
                                                        <button onClick={(e) => { e.preventDefault(); setGovtIdBack(null); }} className="absolute top-2 right-2 p-1 bg-white shadow-sm rounded-full text-red-500"><X size={14} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="text-gray-400 mb-2" size={32} />
                                                        <span className="text-xs font-bold text-gray-500">Click to upload Back</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setGovtIdBack)} />
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400">Accepted documents: Citizenship, National ID, Passport. Max 5MB per file.</p>
                                </div>

                                {/* Profile Photo */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                            <Camera className="text-blue-500" size={20} /> Profile Picture Upload
                                        </h3>
                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-orange-50 text-orange-600 rounded">Optional</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="relative w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden shadow-lg bg-gray-50 shrink-0">
                                            {profilePhoto ? (
                                                <img src={URL.createObjectURL(profilePhoto)} alt="preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                    <User size={48} />
                                                    <span className="text-[8px] uppercase font-bold mt-1 text-gray-400">No Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-600 font-medium">Upload a clear profile photo that customers can recognize.</p>
                                            <label className="inline-flex items-center px-6 py-2 bg-white ring-1 ring-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm font-bold text-gray-700 shadow-sm transition-all active:scale-95">
                                                <Upload size={16} className="mr-2" /> {profilePhoto ? "Change Photo" : "Choose Photo"}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setProfilePhoto)} />
                                            </label>
                                            {profilePhoto && <button onClick={() => setProfilePhoto(null)} className="ml-4 text-xs font-bold text-red-500 hover:underline">Remove</button>}
                                        </div>
                                    </div>
                                </div>

                                {/* Optional Trade License */}
                                <div className="pt-6 border-t border-gray-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                            <Award className="text-orange-500" size={20} /> Trade License / Certifications
                                        </h3>
                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-orange-50 text-orange-600 rounded">Optional</span>
                                    </div>
                                    <label className={`h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${tradeLicense ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50 hover:bg-white hover:border-orange-300"}`}>
                                        {tradeLicense ? (
                                            <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                                                <FileCheck size={20} /> {tradeLicense.name}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <Upload size={20} className="mb-1" />
                                                <span className="text-xs font-bold">Upload certificate (PDF, JPG)</span>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, setTradeLicense)} />
                                    </label>
                                    <p className="text-[10px] text-gray-400 text-center">Optional, but helps speed up approval process.</p>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-between items-center">
                                <Button onClick={prevStep} variant="outline" className="px-8 py-3 rounded-xl border-gray-300">
                                    <ChevronLeft size={18} className="mr-2" /> Back
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || !govtIdFront || !govtIdBack}
                                    className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-200 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <ShieldCheck className="mr-2" size={20} />}
                                    Submit for Approval
                                </Button>
                            </div>
                        </Card>
                    )}

                    {currentStep === 4 && (
                        <Card className="p-12 text-center shadow-2xl border-0 ring-1 ring-gray-100 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-inner"
                            >
                                {profile?.provider?.verificationStatus === "VERIFIED" ? <CheckCircle size={56} className="text-green-500" /> :
                                    profile?.provider?.verificationStatus === "REJECTED" ? <AlertCircle size={56} className="text-red-500" /> :
                                        <Clock size={56} className="animate-pulse" />}
                            </motion.div>

                            <h2 className="text-3xl font-black text-gray-800 mb-4">
                                {profile?.provider?.verificationStatus === "VERIFIED" ? "Welcome Aboard!" :
                                    profile?.provider?.verificationStatus === "REJECTED" ? "Review Required" :
                                        "Approval in Progress"}
                            </h2>

                            <p className="text-lg text-gray-600 max-w-lg mb-8">
                                {profile?.provider?.verificationStatus === "VERIFIED" ? "Your profile has been approved! You are ready to accept bookings and grow your business." :
                                    profile?.provider?.verificationStatus === "REJECTED" ? "Unfortunately, your profile needs some adjustments before we can approve it." :
                                        "Thank you for joining BishwasSetu as a Service Provider. Our team is reviewing your profile before enabling bookings."}
                            </p>

                            <div className={`w-full max-w-md p-6 rounded-2xl border transition-all mb-8 ${profile?.provider?.verificationStatus === "REJECTED" ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
                                }`}>
                                <div className="flex items-center gap-4 mb-4">
                                    {profile?.provider?.verificationStatus === "REJECTED" ? <AlertCircle className="text-red-600" /> : <Loader2 className="animate-spin text-blue-600" />}
                                    <h4 className={`font-bold ${profile?.provider?.verificationStatus === "REJECTED" ? "text-red-700" : "text-blue-700"}`}>
                                        {profile?.provider?.verificationStatus === "REJECTED" ? "Profile Rejected" : "Under Review – Bookings are disabled"}
                                    </h4>
                                </div>
                                <p className={`text-sm text-left ${profile?.provider?.verificationStatus === "REJECTED" ? "text-red-600" : "text-blue-600"}`}>
                                    {profile?.provider?.verificationStatus === "REJECTED" ? "Reason: Identity documents were blurry. Please re-upload clear photos." :
                                        "Approval usually takes 24–48 hours. You’ll be notified once approved via email and app notification."}
                                </p>
                            </div>

                            {/* Checklist */}
                            <div className="w-full max-w-md bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 text-left">Submission Summary</h4>
                                <ul className="space-y-4">
                                    {[
                                        { label: "Personal information completed", done: !!profile?.address },
                                        { label: "Professional details added", done: !!profile?.provider?.legalName },
                                        { label: "Portfolio uploaded", done: true },
                                        { label: "Emergency preferences saved", done: !!profile?.provider?.isEmergencyAvailable },
                                        { label: "Identity documents submitted", done: !!profile?.provider?.kycDocuments?.length },
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${item.done ? "bg-green-500 text-white" : "bg-gray-200"}`}>
                                                <Check size={12} />
                                            </div>
                                            {item.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-12 flex gap-4">
                                {profile?.provider?.verificationStatus === "REJECTED" ? (
                                    <Button onClick={() => setCurrentStep(1)} className="px-10 py-3 bg-red-600 text-white rounded-xl shadow-lg">
                                        Edit & Re-submit
                                    </Button>
                                ) : profile?.provider?.verificationStatus === "VERIFIED" ? (
                                    <Button onClick={() => window.location.href = "/provider/dashboard"} className="px-10 py-3 bg-green-600 text-white rounded-xl shadow-lg">
                                        Go to Provider Dashboard
                                    </Button>
                                ) : (
                                    <Button disabled className="px-10 py-3 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed">
                                        Status: Pending Review
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Global Footer info */}
            <footer className="mt-12 text-center pb-8">
                <div className="inline-flex items-center gap-2 text-gray-400 text-sm font-medium">
                    <ShieldCheck size={16} /> Locked & Secured Onboarding • BishwasSetu Trust Hub
                </div>
            </footer>
        </div>
    );
}

function PlusIcon({ size = 24 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
