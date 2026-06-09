"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/lib/api/userProfileApiSlice";
import { useUploadAvatarMutation } from "@/lib/api/authApiSlice";
import {
  Edit2, Camera, Check, Loader2,
  Phone, Mail, Globe, MapPin, Navigation,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";

const MIGRATION_STATUSES = [
  { value: "planning",   label: "Planning to migrate" },
  { value: "in_transit", label: "In transit" },
  { value: "arrived",    label: "Recently arrived" },
  { value: "settled",    label: "Settled" },
  { value: "returning",  label: "Returning home" },
];

const COUNTRY_CODES = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "CM", name: "Cameroun" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "ZW", name: "Zimbabwe" },
  { code: "UG", name: "Uganda" },
  { code: "IN", name: "India" },
  { code: "NP", name: "Nepal" },
  { code: "CN", name: "China" },
  { code: "GB", name: "UK" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "CY", name: "Cyprus" },
  { code: "US", name: "USA" },
  { code: "CA", name: "Canada" },
];

export function ProfileContent() {
  const user = useSelector(selectCurrentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: isFetching, refetch } = useGetUserProfileQuery(undefined);
  const [saveProfile,  { isLoading: isUpdating }]       = useUpdateUserProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  const [isEditing,     setIsEditing]     = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("/woman-profile.png");

  const [form, setForm] = useState({
    firstName:          "",
    lastName:           "",
    phoneNumber:        "",
    bio:                "",
    city:               "",
    stateProvince:      "",
    currentCountry:     "",
    destinationCountry: "",
    migrationStatus:    "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        firstName:          profile.first_name          || "",
        lastName:           profile.last_name           || "",
        phoneNumber:        profile.phone_number        || "",
        bio:                profile.bio                 || "",
        city:               profile.city                || "",
        stateProvince:      profile.state_province      || "",
        currentCountry:     profile.current_country     || "",
        destinationCountry: profile.destination_country || "",
        migrationStatus:    profile.migration_status    || "",
      });
      setAvatarPreview(profile.avatar || "/woman-profile.png");
    }
  }, [profile]);

  const field = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await uploadAvatar(formData).unwrap();
      toast.success("Profile photo updated!");
      refetch();
    } catch {
      toast.error("Failed to upload photo.");
    }
  };

  const handleSave = async () => {
    try {
      await saveProfile({
        first_name:          form.firstName,
        last_name:           form.lastName,
        phone_number:        form.phoneNumber,
        current_country:     form.currentCountry,
        destination_country: form.destinationCountry,
      }).unwrap();
      toast.success("Profile updated!");
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data?.message || "Failed to save profile.");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        firstName:          profile.first_name          || "",
        lastName:           profile.last_name           || "",
        phoneNumber:        profile.phone_number        || "",
        bio:                profile.bio                 || "",
        city:               profile.city                || "",
        stateProvince:      profile.state_province      || "",
        currentCountry:     profile.current_country     || "",
        destinationCountry: profile.destination_country || "",
        migrationStatus:    profile.migration_status    || "",
      });
    }
    setIsEditing(false);
  };

  if (isFetching) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-gray-500 font-bold">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <Card className="overflow-hidden border-none shadow-2xl shadow-teal-900/5 bg-white rounded-sm">
        <div className="h-32 bg-gradient-to-r from-teal-600 to-teal-800" />

        <CardContent className="px-6 pb-6 -mt-12">

          {/* Avatar + Name */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-[6px] border-white shadow-xl">
                  <AvatarImage src={avatarPreview} className="object-cover" />
                  <AvatarFallback className="bg-teal-50 text-teal-700 text-3xl font-black">
                    {form.firstName?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file" ref={fileInputRef}
                  className="hidden" accept="image/*"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center border-4 border-white shadow-lg hover:bg-teal-700 transition-all disabled:opacity-60"
                >
                  {isUploadingAvatar
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Camera className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex-1 text-center md:text-left pb-2">
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <Input
                      value={form.firstName} onChange={field("firstName")}
                      className="font-bold text-lg h-10" placeholder="First Name"
                    />
                    <Input
                      value={form.lastName} onChange={field("lastName")}
                      className="font-bold text-lg h-10" placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    {form.firstName} {form.lastName}
                  </h1>
                )}
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-1">
                  {profile?.membership_plan || "Free"} Member
                </p>
                {profile?.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 mt-1">
                    <Check className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {isEditing ? (
                <>
                  <Button
                    variant="outline" onClick={handleCancel}
                    className="flex-1 md:w-32 rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave} disabled={isUpdating}
                    className="flex-1 md:w-32 bg-teal-700 hover:bg-teal-800 text-white rounded-md shadow-md"
                  >
                    {isUpdating
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><Check className="h-4 w-4 mr-2" />Save</>}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-40 bg-gray-900 hover:bg-black text-white rounded-md shadow-md"
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">

            <InfoCard icon={<Phone className="h-5 w-5" />} label="Phone">
              {isEditing
                ? <input value={form.phoneNumber} onChange={field("phoneNumber")}
                    className="text-sm font-bold bg-transparent outline-none border-b border-teal-200 w-full"
                    placeholder="+234..." />
                : <span>{form.phoneNumber || "Not set"}</span>}
            </InfoCard>

            <InfoCard icon={<Mail className="h-5 w-5" />} label="Email">
              <span className="truncate">{user?.email}</span>
            </InfoCard>

            <InfoCard icon={<MapPin className="h-5 w-5" />} label="City">
              {isEditing
                ? <input value={form.city} onChange={field("city")}
                    className="text-sm font-bold bg-transparent outline-none border-b border-teal-200 w-full"
                    placeholder="Your city" />
                : <span>{form.city || "Not set"}</span>}
            </InfoCard>

            <InfoCard icon={<MapPin className="h-5 w-5" />} label="State / Province">
              {isEditing
                ? <input value={form.stateProvince} onChange={field("stateProvince")}
                    className="text-sm font-bold bg-transparent outline-none border-b border-teal-200 w-full"
                    placeholder="Your state or province" />
                : <span>{form.stateProvince || "Not set"}</span>}
            </InfoCard>

            <InfoCard icon={<Globe className="h-5 w-5" />} label="Current Country">
              {isEditing
                ? (
                  <select
                    value={form.currentCountry} onChange={field("currentCountry")}
                    className="text-sm font-bold bg-transparent outline-none border-b border-teal-200 w-full cursor-pointer"
                  >
                    <option value="">Select country</option>
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                )
                : <span>{COUNTRY_CODES.find(c => c.code === form.currentCountry)?.name || form.currentCountry || "Not set"}</span>}
            </InfoCard>

            <InfoCard icon={<Navigation className="h-5 w-5" />} label="Destination Country">
              {isEditing
                ? (
                  <select
                    value={form.destinationCountry} onChange={field("destinationCountry")}
                    className="text-sm font-bold bg-transparent outline-none border-b border-teal-200 w-full cursor-pointer"
                  >
                    <option value="">Select country</option>
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                )
                : <span>{COUNTRY_CODES.find(c => c.code === form.destinationCountry)?.name || form.destinationCountry || "Not set"}</span>}
            </InfoCard>

            <InfoCard icon={<Globe className="h-5 w-5" />} label="Migration Status">
              {isEditing
                ? (
                  <select
                    value={form.migrationStatus} onChange={field("migrationStatus")}
                    className="text-sm font-bold bg-transparent outline-none border-b border-teal-200 w-full cursor-pointer"
                  >
                    <option value="">Select status</option>
                    {MIGRATION_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                )
                : <span>{MIGRATION_STATUSES.find(s => s.value === form.migrationStatus)?.label || "Not set"}</span>}
            </InfoCard>

          </div>

          {/* Bio */}
          <div className="mt-8 pt-6 border-t border-gray-50">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-3">
              About Me
            </h3>
            {isEditing ? (
              <textarea
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all text-sm"
                rows={4}
                value={form.bio}
                onChange={field("bio")}
                placeholder="Tell the community about yourself..."
              />
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line italic">
                {form.bio ? `"${form.bio}"` : "No bio yet — click Edit Profile to add one."}
              </p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// Reusable info card
function InfoCard({
  icon, label, children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl">
      <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-600 shrink-0">
        {icon}
      </div>
      <div className="text-left w-full min-w-0">
        <p className="text-[10px] font-black uppercase text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-800 truncate">{children}</p>
      </div>
    </div>
  );
}