"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, SUB_CATEGORIES, PRIORITIES } from "@/lib/constants";
import { complaintService } from "@/lib/services/complaint.service";
import { geoService } from "@/lib/services/geo.service";
import dynamic from "next/dynamic";
import { MapPin, Upload, X, Loader2, CheckCircle2, Camera, ArrowLeft } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const CivicMapbox = dynamic(() => import("@/components/ui/CivicMapbox"), { ssr: false });

const reportSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: z.string().min(1, "Please select a category"),
    subCategory: z.string().min(1, "Please select a sub-category"),
    priority: z.enum(["low", "medium", "high", "critical"]),
    citizenName: z.string().min(2, "Name is required"),
    citizenMobile: z.string().regex(/^[0-9]{10}$/, "Enter valid 10-digit mobile number"),
    locationAddress: z.string().min(5, "Address is required"),
    latitude: z.number(),
    longitude: z.number(),
    ward: z.string(),
});

type ReportFormData = z.infer<typeof reportSchema>;

export default function ReportPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<ReportFormData>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            latitude: 12.9716,
            longitude: 77.5946,
            ward: "Ward 12",
            priority: "medium",
        }
    });

    const category = watch("category");
    const latitude = watch("latitude");
    const longitude = watch("longitude");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        maxFiles: 5,
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleLocationSelect = async (lat: number, lon: number) => {
        setLocationLoading(true);
        setValue("latitude", lat);
        setValue("longitude", lon);
        
        try {
            const { address, ward } = await geoService.reverseGeocode(lat, lon);
            setValue("locationAddress", address);
            setValue("ward", ward);
            toast.success("Location updated");
        } catch (error) {
            toast.error("Could not fetch address");
        } finally {
            setLocationLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                handleLocationSelect(position.coords.latitude, position.coords.longitude);
            },
            () => {
                toast.error("Could not get your location");
                setLocationLoading(false);
            }
        );
    };

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ["title", "description", "category", "subCategory"];
        if (step === 2) fieldsToValidate = ["locationAddress", "latitude", "longitude"];
        if (step === 3) {
            // Photos are optional, just move to next step
            stopCamera(); // Stop camera if moving to next step
            setStep(step + 1);
            return;
        }
        if (step === 4) fieldsToValidate = ["citizenName", "citizenMobile"];

        const isValid = await trigger(fieldsToValidate as any);
        if (isValid) setStep(step + 1);
    };

    // Camera functions
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            setStream(mediaStream);
            setShowCamera(true);
            
            // Wait for next tick to ensure video element is rendered
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch(err => {
                        console.error("Error playing video:", err);
                        toast.error("Could not start video playback");
                    });
                }
            }, 100);
            
            toast.success("Camera started");
        } catch (error) {
            toast.error("Could not access camera. Please check permissions.");
            console.error("Camera error:", error);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        setFiles(prev => [...prev, file].slice(0, 5));
                        toast.success("Photo captured!");
                        stopCamera();
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    const onSubmit = async (data: ReportFormData) => {
        setSubmitting(true);
        try {
            const result = await complaintService.submitComplaint({
                ...data,
                location: {
                    address: data.locationAddress,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    ward: data.ward,
                },
                attachments: files,
            });

            const complaintNumber = result?.complaintNumber || `CMP-${Date.now()}`;
            
            // Show success notification with complaint number
            toast.success(
                `Complaint submitted successfully! Your complaint ID is ${complaintNumber}. You will receive updates on your mobile.`,
                { duration: 5000 }
            );
            
            setTimeout(() => {
                router.push(`/citizen/track?id=${complaintNumber}`);
            }, 2000);
        } catch (error: any) {
            // Show the actual error for debugging
            console.error('API Error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to submit complaint';
            toast.error(`Error: ${errorMessage}`);
            
            // If API fails, create mock complaint number as fallback
            const mockComplaintNumber = `CMP-2024-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`;
            toast.error(`API failed. Using mock ID: ${mockComplaintNumber}`);
            setTimeout(() => {
                router.push(`/citizen/track?id=${mockComplaintNumber}`);
            }, 2000);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {t('report.backToHome')}
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{t('report.title')}</h1>
                    <p className="text-gray-600">{t('report.subtitle')}</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                s < step ? "bg-civic-green text-white" :
                                s === step ? "bg-civic-blue text-white" :
                                "bg-gray-200 text-gray-400"
                            }`}>
                                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                            </div>
                            {s < 5 && <div className={`w-16 h-1 ${s < step ? "bg-civic-green" : "bg-gray-200"}`} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="civic-card p-8">
                        {/* Step 1: Issue Details */}
                        {step === 1 && (
                            <div className="space-y-5 animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('report.issueDetails')}</h2>
                                
                                <div>
                                    <label className="label-field">{t('report.issueTitle')} *</label>
                                    <input
                                        {...register("title")}
                                        className="input-field"
                                        placeholder={t('report.issueTitlePlaceholder')}
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="label-field">{t('report.detailedDescription')} *</label>
                                    <textarea
                                        {...register("description")}
                                        className="input-field min-h-[120px]"
                                        placeholder={t('report.detailedDescriptionPlaceholder')}
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-field">{t('report.category')} *</label>
                                        <select {...register("category")} className="input-field">
                                            <option value="">{t('report.selectCategory')}</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{t(`categories.${cat.value}`)}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                                    </div>

                                    <div>
                                        <label className="label-field">{t('report.subCategory')} *</label>
                                        <select {...register("subCategory")} className="input-field" disabled={!category}>
                                            <option value="">{t('report.selectSubCategory')}</option>
                                            {category && SUB_CATEGORIES[category]?.map(sub => (
                                                <option key={sub} value={sub}>{t(`subCategories.${sub}`)}</option>
                                            ))}
                                        </select>
                                        {errors.subCategory && <p className="text-red-500 text-xs mt-1">{errors.subCategory.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="label-field">{t('report.priority')} *</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {PRIORITIES.map(p => (
                                            <label key={p} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    {...register("priority")}
                                                    value={p}
                                                    className="sr-only peer"
                                                />
                                                <div className="p-3 border-2 rounded-xl text-center font-bold text-sm capitalize peer-checked:border-civic-blue peer-checked:bg-blue-50 hover:border-gray-300 transition-all">
                                                    {t(`priorities.${p}`)}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {step === 2 && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">{t('report.location')}</h2>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={getCurrentLocation}
                                        loading={locationLoading}
                                        leftIcon={<MapPin className="w-4 h-4" />}
                                    >
                                        {t('report.useCurrentLocation')}
                                    </Button>
                                </div>

                                <div className="h-[400px] rounded-2xl overflow-hidden">
                                    <CivicMapbox
                                        center={[longitude, latitude]}
                                        zoom={15}
                                        onLocationSelect={handleLocationSelect}
                                        interactive={true}
                                    />
                                </div>

                                <div>
                                    <label className="label-field">{t('report.locationAddress')} *</label>
                                    <textarea
                                        {...register("locationAddress")}
                                        className="input-field min-h-[80px]"
                                        placeholder={t('report.clickMapToSelect')}
                                    />
                                    {errors.locationAddress && <p className="text-red-500 text-xs mt-1">{errors.locationAddress.message}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="label-field">Ward</label>
                                        <input {...register("ward")} className="input-field bg-gray-50" readOnly />
                                    </div>
                                    <div>
                                        <label className="label-field">Latitude</label>
                                        <input value={latitude.toFixed(6)} className="input-field bg-gray-50 text-xs" readOnly />
                                    </div>
                                    <div>
                                        <label className="label-field">Longitude</label>
                                        <input value={longitude.toFixed(6)} className="input-field bg-gray-50 text-xs" readOnly />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Photos */}
                        {step === 3 && (
                            <div className="space-y-5 animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('report.uploadPhotos')}</h2>
                                
                                {!showCamera ? (
                                    <>
                                        <div className="flex gap-3 mb-4">
                                            <button
                                                type="button"
                                                onClick={startCamera}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-civic-blue text-white rounded-xl font-semibold hover:bg-navy-700 transition-colors"
                                            >
                                                <Camera className="w-5 h-5" />
                                                {t('report.takePhoto')}
                                            </button>
                                            <div className="flex-1 text-center text-gray-400 flex items-center justify-center">
                                                or
                                            </div>
                                        </div>

                                        <div
                                            {...getRootProps()}
                                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                                                isDragActive ? "border-civic-blue bg-blue-50" : "border-gray-300 hover:border-gray-400"
                                            }`}
                                        >
                                            <input {...getInputProps()} />
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 font-medium mb-1">
                                                {isDragActive ? "Drop files here" : t('report.dragDropPhotos')}
                                            </p>
                                            <p className="text-gray-400 text-sm">{t('report.orClickToBrowse')}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative bg-black rounded-2xl overflow-hidden">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-[400px] object-cover"
                                            />
                                            <canvas ref={canvasRef} className="hidden" />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="flex-1"
                                                leftIcon={<Camera className="w-4 h-4" />}
                                            >
                                                {t('report.capturePhoto')}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={stopCamera}
                                                variant="ghost"
                                                className="flex-1"
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {files.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4">
                                        {files.map((file, i) => (
                                            <div key={i} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Upload ${i + 1}`}
                                                    className="w-full h-32 object-cover rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Contact Info */}
                        {step === 4 && (
                            <div className="space-y-5 animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('report.yourDetails')}</h2>
                                
                                <div>
                                    <label className="label-field">{t('report.yourName')} *</label>
                                    <input
                                        {...register("citizenName")}
                                        className="input-field"
                                        placeholder={t('report.yourName')}
                                    />
                                    {errors.citizenName && <p className="text-red-500 text-xs mt-1">{errors.citizenName.message}</p>}
                                </div>

                                <div>
                                    <label className="label-field">{t('report.mobileNumber')} *</label>
                                    <input
                                        {...register("citizenMobile")}
                                        className="input-field"
                                        placeholder={t('report.mobileNumber')}
                                        maxLength={10}
                                    />
                                    {errors.citizenMobile && <p className="text-red-500 text-xs mt-1">{errors.citizenMobile.message}</p>}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-sm text-blue-900">
                                        <strong>Note:</strong> {t('report.contactNote')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Terms and Conditions */}
                        {step === 5 && (
                            <div className="space-y-5 animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('report.termsAndConditions')}</h2>
                                
                                <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 max-h-[400px] overflow-y-auto">
                                    <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                                        <h3 className="text-base font-bold text-gray-900">{t('report.termsTitle')}</h3>
                                        
                                        <p className="text-sm leading-relaxed">
                                            {t('report.termsIntro')}
                                        </p>

                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term1Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term1Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term2Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term2Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term3Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term3Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term4Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term4Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term5Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term5Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term6Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term6Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term7Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term7Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term8Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term8Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term9Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term9Text')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1">{t('report.term10Title')}</h4>
                                                <p className="text-sm">
                                                    {t('report.term10Text')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 mt-6">
                                            <p className="text-xs text-gray-500">
                                                {t('report.termsFooter')}<br />
                                                {t('report.termsContact')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="mt-1 w-5 h-5 rounded border-2 border-amber-400 text-civic-blue focus:ring-2 focus:ring-civic-blue cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-900 leading-relaxed">
                                            {t('report.agreeCheckbox')}
                                        </span>
                                    </label>
                                </div>

                                {!termsAccepted && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                        <p className="text-xs text-blue-800">
                                            {t('report.pleaseAcceptTerms')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep(step - 1)}
                                >
                                    {t('report.back')}
                                </Button>
                            )}
                            
                            <div className="ml-auto">
                                {step < 5 ? (
                                    <Button type="button" onClick={nextStep}>
                                        {t('report.continue')}
                                    </Button>
                                ) : (
                                    <Button 
                                        type="submit" 
                                        loading={submitting}
                                        disabled={!termsAccepted}
                                        className={!termsAccepted ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        {t('report.submitReport')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
