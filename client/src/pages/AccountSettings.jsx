import { useState, useEffect } from "react";
import { useUser, useClerk, useReverification } from "@clerk/clerk-react";
import { User, Shield, Save, AlertCircle, Key, Lock, Fingerprint, Laptop, LogOut, X, CheckCircle2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AccountSettings = () => {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const { reverify } = useReverification();
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [sessions, setSessions] = useState([]);

    // Password States
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Passkey State
    const [isCreatingPasskey, setIsCreatingPasskey] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
    });

    useEffect(() => {
        if (user) {
            user.getSessions().then(sessionList => {
                setSessions(sessionList);
            });
        }
    }, [user]);

    if (!isLoaded) return <div className="p-8 text-white">Loading profile...</div>;
    if (!user) return <div className="p-8 text-white">Please sign in to view your profile.</div>;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await user.update({
                firstName: formData.firstName,
                lastName: formData.lastName,
            });
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.errors?.[0]?.message || "Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCreatePasskey = async () => {
        if (isCreatingPasskey) return;
        setIsCreatingPasskey(true);
        const toastId = toast.loading("Follow browser prompts to create passkey...");
        try {
            await reverify(async () => {
                await user.createPasskey();
                toast.success("Passkey registered successfully!", { id: toastId });
            });
        } catch (err) {
            console.error(err);
            if (err.errors?.[0]?.code === "reverification_required") {
                toast.dismiss(toastId);
                return; // Clerk handled it
            }
            toast.error(err.errors?.[0]?.message || "Failed to create passkey. Make sure passkeys are enabled.", { id: toastId });
        } finally {
            setIsCreatingPasskey(false);
        }
    };

    const handleSignOutSession = async (sessionId) => {
        try {
            const session = sessions.find(s => s.id === sessionId);
            if (session) {
                await session.revoke();
                setSessions(sessions.filter(s => s.id !== sessionId));
                toast.success("Session ended successfully");
            }
        } catch (err) {
            toast.error("Failed to end session");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("New passwords do not match");
        }

        setIsChangingPassword(true);
        try {
            await reverify(async () => {
                await user.updatePassword({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                });
                toast.success("Password updated successfully!");
                setShowPasswordModal(false);
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            });
        } catch (err) {
            console.error(err);
            if (err.errors?.[0]?.code === "reverification_required") {
                return; // Clerk handled it
            }
            toast.error(err.errors?.[0]?.message || "Failed to update password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await reverify(async () => {
                await user.delete();
                toast.success("Account deleted. Redirecting...");
                setTimeout(() => (window.location.href = "/"), 2000);
            });
        } catch (err) {
            console.error(err);
            if (err.errors?.[0]?.code === "reverification_required") {
                return; // Clerk handled it
            }
            toast.error("Failed to delete account");
        }
    };

    const googleLogo = "https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png";

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 relative">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
                <p className="text-dark-400">Manage your profile information and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all font-medium ${activeTab === "profile"
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                            : "text-dark-300 hover:bg-dark-800 hover:text-white"
                            }`}
                    >
                        <User size={20} />
                        <span>Profile Details</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all font-medium ${activeTab === "security"
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                            : "text-dark-300 hover:bg-dark-800 hover:text-white"
                            }`}
                    >
                        <Shield size={20} />
                        <span>Security</span>
                    </button>

                    <div className="pt-8 mt-8 border-t border-dark-700/50">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-dark-400 hover:bg-dark-800 hover:text-white transition-all text-sm group"
                        >
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            <span>Return to Home</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Details Tab */}
                    {activeTab === "profile" && (
                        <>
                            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 sm:p-8 hover:border-dark-600 transition-colors">
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                                    <div className="relative group">
                                        <img
                                            src={user.imageUrl}
                                            alt={user.fullName}
                                            className="w-24 h-24 rounded-full border-4 border-dark-700 object-cover group-hover:opacity-80 transition-opacity"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-xl font-bold text-white">{user.fullName || "User"}</h2>
                                        <p className="text-dark-400">{user.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-dark-300 ml-1">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-dark-300 ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-dark-700 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
                                        >
                                            {isUpdating ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Connected Accounts Section */}
                            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 sm:p-8 hover:border-dark-600 transition-colors">
                                <h3 className="text-lg font-bold text-white mb-4">Connected Accounts</h3>
                                <div className="space-y-4">
                                    {user.externalAccounts.map((account) => (
                                        <div key={account.id} className="flex items-center justify-between p-4 bg-dark-900 rounded-xl border border-dark-600">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden p-2">
                                                    <img
                                                        src={account.provider === 'google' ? googleLogo : ''}
                                                        alt={account.provider}
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white capitalize">{account.provider}</p>
                                                    <p className="text-xs text-dark-400 truncate max-w-[150px] sm:max-w-none">
                                                        {account.emailAddress}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">Connected</span>
                                        </div>
                                    ))}
                                    {user.externalAccounts.length === 0 && (
                                        <p className="text-dark-400 text-sm italic text-center py-4">No external accounts connected.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            {/* Active Sessions */}
                            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 sm:p-8 hover:border-dark-600 transition-colors animate-dropdown">
                                <h3 className="text-xl font-bold text-white mb-6">Active Sessions</h3>
                                <div className="space-y-4">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-4 bg-dark-900 rounded-2xl border border-dark-600 group">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2.5 bg-dark-700 rounded-xl text-dark-300">
                                                    <Laptop size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-white">
                                                            {session.latestActivity?.deviceType || "Unknown Device"} &bull; {session.latestActivity?.browserName || "Browser"}
                                                        </p>
                                                        {session.id === user.lastSyncAt && (
                                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Current</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-dark-400 mt-0.5">
                                                        {session.latestActivity?.ipAddress} &bull; {session.latestActivity?.city}, {session.latestActivity?.country}
                                                    </p>
                                                </div>
                                            </div>
                                            {session.id !== user.lastSyncAt && (
                                                <button
                                                    onClick={() => handleSignOutSession(session.id)}
                                                    className="text-dark-400 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <LogOut size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 sm:p-8 hover:border-dark-600 transition-colors animate-dropdown">
                                <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={handleCreatePasskey}
                                        className={`p-4 bg-dark-900 rounded-2xl border border-dark-600 hover:border-primary-500/50 transition-all cursor-pointer group ${isCreatingPasskey ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 mb-4 w-fit group-hover:bg-blue-500/20 transition-all">
                                            {isCreatingPasskey ? (
                                                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                            ) : (
                                                <Key size={24} />
                                            )}
                                        </div>
                                        <h4 className="text-white font-semibold mb-1">Passkeys</h4>
                                        <p className="text-xs text-dark-400">Use biometric authentication for faster and more secure login.</p>
                                    </div>

                                    <div className="p-4 bg-dark-900 rounded-2xl border border-dark-600 hover:border-primary-500/50 transition-all cursor-pointer group opacity-60">
                                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 mb-4 w-fit group-hover:bg-purple-500/20 transition-all">
                                            <Fingerprint size={24} />
                                        </div>
                                        <h4 className="text-white font-semibold mb-1">Two-Factor</h4>
                                        <p className="text-xs text-dark-400 italic">Advanced MFA management coming soon...</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-dark-700">
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="flex items-center justify-between w-full p-4 bg-dark-900 rounded-2xl border border-dark-600 hover:bg-dark-700 transition-all"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-dark-700 rounded-lg text-dark-300">
                                                <Lock size={18} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-white">Change Password</p>
                                                <p className="text-xs text-dark-400">Update your account password</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-primary-400 font-medium">Manage</span>
                                    </button>
                                </div>
                            </div>

                            {/* Redesigned Danger Zone - Integrated into Security */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden animate-dropdown">
                                <div className="bg-red-500/10 px-6 py-4 flex items-center justify-between border-b border-red-500/20">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <AlertCircle size={20} />
                                        <h3 className="font-bold uppercase tracking-wider text-sm">Danger Area</h3>
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8">
                                    <h4 className="text-white font-semibold mb-2 text-lg">Delete Account</h4>
                                    <p className="text-sm text-dark-400 mb-6 max-w-md leading-relaxed">
                                        Once you delete your account, there is no going back. All your data, reported issues, and contributions will be permanently removed.
                                    </p>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center space-x-2"
                                    >
                                        <AlertCircle size={18} />
                                        <span>Delete My Account</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Modal (Functional Form) */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="bg-dark-800 border border-dark-700 w-full max-w-md rounded-2xl shadow-2xl animate-dropdown overflow-hidden">
                        <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Lock size={18} className="text-primary-500" />
                                <span>Update Password</span>
                            </h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-dark-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-dark-300 ml-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-all placeholder:text-dark-600"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-dark-300 ml-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-all placeholder:text-dark-600"
                                    placeholder="Min 8 characters"
                                    minLength={8}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-dark-300 ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-all placeholder:text-dark-600"
                                    placeholder="Repeat new password"
                                />
                            </div>

                            <div className="pt-4 flex flex-col space-y-3">
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {isChangingPassword ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={18} />
                                    )}
                                    <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="w-full bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-dark-900 border border-red-500/30 w-full max-w-md rounded-2xl shadow-2xl animate-dropdown overflow-hidden">
                        <div className="p-6 bg-red-600/10 border-b border-red-500/20 flex justify-between items-center text-red-500">
                            <div className="flex items-center space-x-2">
                                <AlertCircle size={20} />
                                <h3 className="text-lg font-bold">Permanently Delete Account?</h3>
                            </div>
                            <button onClick={() => setShowDeleteModal(false)} className="text-dark-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8">
                            <p className="text-dark-300 mb-8 leading-relaxed">
                                This action <span className="text-white font-bold underline decoration-red-500">cannot be undone</span>. All your reports, profile data, and settings will be erased forever.
                            </p>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20"
                                >
                                    Yes, Delete My Account
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="bg-dark-800 hover:bg-dark-700 text-white font-bold py-4 rounded-xl transition-all"
                                >
                                    No, Keep My Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSettings; 
