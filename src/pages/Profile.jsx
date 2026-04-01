import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser, selectIsAdmin } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';
import {
    User, MapPin, Phone, Mail, Edit2, Save, X, Plus,
    Trash2, CheckCircle, Loader2, AlertCircle, Star, Home, Briefcase, ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─────────────────────────── helpers ────────────────────────────
const LABEL_ICONS = {
    Home: <Home size={14} />,
    Office: <Briefcase size={14} />,
};

function AddressCard({ addr, onSetDefault, onEdit, onDelete }) {
    return (
        <div className={`relative rounded-2xl border p-5 transition-all ${addr.is_default
            ? 'border-stone-900 bg-stone-50 shadow-sm'
            : 'border-stone-200 hover:border-stone-400 bg-white'}`}>
            {/* Label badge */}
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    {addr.label && (
                        <span className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            {LABEL_ICONS[addr.label] ?? null}
                            {addr.label}
                        </span>
                    )}
                    {addr.is_default && (
                        <span className="flex items-center gap-1 rounded-full bg-stone-900 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                            <CheckCircle size={11} /> Default
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!addr.is_default && (
                        <button
                            onClick={() => onSetDefault(addr.address_id)}
                            title="Set as default"
                            className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-500 transition-all hover:border-stone-900 hover:text-stone-900"
                        >
                            Set Default
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(addr)}
                        className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900"
                        title="Edit"
                    >
                        <Edit2 size={14} />
                    </button>
                    {!addr.is_default && (
                        <button
                            onClick={() => onDelete(addr.address_id)}
                            className="rounded-full p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
            <p className="font-bold text-stone-900">{addr.address_line1}</p>
            {addr.address_line2 && <p className="text-sm text-stone-500">{addr.address_line2}</p>}
            <p className="text-sm text-stone-600">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code}</p>
            <p className="text-sm text-stone-400">{addr.country}</p>
        </div>
    );
}

// ─────────────────── Address Form (add / edit) ───────────────────
const EMPTY_FORM = {
    label: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
};

function AddressForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
    const setCheck = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.checked }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const inputCls = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-900 transition-colors";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-6">
            <h3 className="font-bold text-stone-900">{initial ? 'Edit Address' : 'New Address'}</h3>

            {/* Label quick-select */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Label</label>
                <div className="flex gap-2">
                    {['Home', 'Office', 'Other'].map(l => (
                        <button
                            type="button" key={l}
                            onClick={() => setForm(prev => ({ ...prev, label: l }))}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${form.label === l
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : 'border-stone-200 text-stone-600 hover:border-stone-500'}`}
                        >
                            {l}
                        </button>
                    ))}
                    <input
                        type="text"
                        placeholder="Custom…"
                        value={['Home', 'Office', 'Other'].includes(form.label) ? '' : form.label}
                        onChange={set('label')}
                        className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-1 text-sm outline-none focus:border-stone-900 transition-colors min-w-0"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Address Line 1 *</label>
                <input required type="text" value={form.address_line1} onChange={set('address_line1')} className={inputCls} placeholder="123 Main Street" />
            </div>
            <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Address Line 2</label>
                <input type="text" value={form.address_line2} onChange={set('address_line2')} className={inputCls} placeholder="Apt, Floor, Suite…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1.5">City *</label>
                    <input required type="text" value={form.city} onChange={set('city')} className={inputCls} placeholder="Mumbai" />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1.5">State</label>
                    <input type="text" value={form.state} onChange={set('state')} className={inputCls} placeholder="Maharashtra" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Postal Code *</label>
                    <input required type="text" value={form.postal_code} onChange={set('postal_code')} className={inputCls} placeholder="400001" />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1.5">Country *</label>
                    <input required type="text" value={form.country} onChange={set('country')} className={inputCls} placeholder="India" />
                </div>
            </div>

            {/* is_default only shown when adding (not editing, since editing doesn't change default) */}
            {!initial && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                    <input type="checkbox" checked={form.is_default} onChange={setCheck('is_default')} className="accent-stone-900" />
                    Set as default shipping address
                </label>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-stone-700 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {initial ? 'Update' : 'Save Address'}
                </button>
                <button type="button" onClick={onCancel} className="flex items-center gap-2 rounded-full border border-stone-200 px-5 py-2 text-sm font-semibold text-stone-600 hover:border-stone-900 transition-all">
                    <X size={14} /> Cancel
                </button>
            </div>
        </form>
    );
}

// ──────────────────────────── Page ──────────────────────────────
export default function Profile() {
    const user = useAppSelector(selectUser);
    const isAdmin = useAppSelector(selectIsAdmin);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');

    // ── Profile state ──
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }

    // ── Address state ──
    const [addresses, setAddresses] = useState([]);
    const [addrLoading, setAddrLoading] = useState(true);
    const [addrError, setAddrError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddr, setEditingAddr] = useState(null); // address object being edited
    const [addrSaving, setAddrSaving] = useState(false);

    // ── Load profile ──
    useEffect(() => {
        authApi.getCurrentUser()
            .then(data => {
                setProfile(data);
                setProfileForm({ full_name: data.full_name, phone: data.phone || '' });
            })
            .catch(() => setProfileMsg({ type: 'error', text: 'Failed to load profile' }))
            .finally(() => setProfileLoading(false));
    }, []);

    // ── Load addresses ──
    const loadAddresses = useCallback(() => {
        setAddrLoading(true);
        authApi.addresses.getByUser(user?.user_id)
            .then(data => { setAddresses(data); setAddrError(''); })
            .catch(e => setAddrError(e.message))
            .finally(() => setAddrLoading(false));
    }, [user?.user_id]);

    useEffect(() => { loadAddresses(); }, [loadAddresses]);

    // ── Profile save ──
    const handleProfileSave = async () => {
        setProfileSaving(true);
        setProfileMsg(null);
        try {
            await authApi.updateCurrentUser(profileForm);
            setProfile(prev => ({ ...prev, ...profileForm }));
            setEditing(false);
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (e) {
            setProfileMsg({ type: 'error', text: e.message || 'Update failed' });
        } finally {
            setProfileSaving(false);
            setTimeout(() => setProfileMsg(null), 4000);
        }
    };

    // ── Address operations ──
    const handleAddAddress = async (form) => {
        setAddrSaving(true);
        try {
            await authApi.addresses.create(form);
            setShowAddForm(false);
            loadAddresses();
        } catch (e) {
            alert(e.message || 'Failed to add address');
        } finally {
            setAddrSaving(false);
        }
    };

    const handleUpdateAddress = async (form) => {
        setAddrSaving(true);
        try {
            await authApi.addresses.update(editingAddr.address_id, form);
            setEditingAddr(null);
            loadAddresses();
        } catch (e) {
            alert(e.message || 'Failed to update address');
        } finally {
            setAddrSaving(false);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await authApi.addresses.setDefault(addressId);
            loadAddresses();
        } catch (e) {
            alert(e.message || 'Failed to set default');
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            await authApi.addresses.delete(addressId);
            loadAddresses();
        } catch (e) {
            alert(e.message || 'Failed to delete address');
        }
    };

    // ── Avatar initial ──
    const initials = (profile?.full_name || user?.full_name || '?')
        .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    const inputCls = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-stone-900 transition-colors";
    const readCls = "w-full rounded-xl border border-stone-100 bg-stone-50 px-4 py-2.5 text-sm text-stone-700";

    return (
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-900 text-2xl font-black text-white shadow-lg select-none">
                        {initials}
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-black tracking-tighter text-stone-900">
                            {profile?.full_name || user?.full_name}
                        </h1>
                        <p className="text-sm text-stone-400">{profile?.email || user?.email}</p>
                    </div>
                </div>

                {!isAdmin && (
                    <Link
                        to="/store/orders"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-stone-100 px-6 py-3 text-sm font-bold text-stone-900 transition-all hover:bg-stone-200 active:scale-95 shadow-sm"
                    >
                        <ClipboardList size={18} />
                        View My Orders
                    </Link>
                )}
            </div>

            {/* Tabs */}
            <div className="mb-8 flex gap-1 rounded-2xl border border-stone-100 bg-stone-50 p-1">
                {[
                    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
                    { id: 'addresses', label: 'Addresses', icon: <MapPin size={15} /> },
                    ...(!isAdmin ? [{ id: 'orders', label: 'My Orders', icon: <ClipboardList size={15} /> }] : []),
                ].map(tab => (
                    <Link
                        key={tab.id}
                        to={tab.id === 'orders' ? '/store/orders' : '#'}
                        onClick={(e) => {
                            if (tab.id === 'orders') return;
                            e.preventDefault();
                            setActiveTab(tab.id);
                        }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        {tab.icon} {tab.label}
                    </Link>
                ))}
            </div>

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
                <div>
                    {profileLoading ? (
                        <div className="flex items-center gap-3 text-stone-400">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm">Loading profile…</span>
                        </div>
                    ) : (
                        <div className="space-y-6 rounded-3xl border border-stone-100 bg-white p-8 shadow-sm">
                            {profileMsg && (
                                <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${profileMsg.type === 'success'
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-red-200 bg-red-50 text-red-600'}`}>
                                    {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {profileMsg.text}
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5">Full Name</label>
                                {editing
                                    ? <input type="text" className={inputCls} value={profileForm.full_name}
                                        onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} />
                                    : <p className={readCls}>{profile?.full_name}</p>}
                            </div>

                            {/* Email (read-only always) */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5">Email</label>
                                <div className="flex items-center gap-2">
                                    <p className={readCls}>{profile?.email}</p>
                                    <Mail size={16} className="shrink-0 text-stone-300" />
                                </div>
                                <p className="mt-1 text-[11px] text-stone-400">Email cannot be changed here. Contact support.</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5">Phone</label>
                                {editing
                                    ? <input type="tel" className={inputCls} value={profileForm.phone}
                                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="+91 98765 43210" />
                                    : <p className={readCls}>{profile?.phone || <span className="text-stone-400 italic">Not provided</span>}</p>}
                            </div>

                            {/* Member since */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5">Member Since</label>
                                <p className={readCls}>
                                    {profile?.created_at
                                        ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : '—'}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                {editing ? (
                                    <>
                                        <button
                                            onClick={handleProfileSave}
                                            disabled={profileSaving}
                                            className="flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-stone-700 active:scale-95 disabled:opacity-50"
                                        >
                                            {profileSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                            Save Changes
                                        </button>
                                        <button onClick={() => { setEditing(false); setProfileForm({ full_name: profile.full_name, phone: profile.phone || '' }); }}
                                            className="flex items-center gap-2 rounded-full border border-stone-200 px-5 py-2 text-sm font-semibold text-stone-600 hover:border-stone-900 transition-all">
                                            <X size={14} /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 rounded-full border border-stone-200 px-5 py-2 text-sm font-semibold text-stone-700 hover:border-stone-900 hover:text-stone-900 transition-all"
                                    >
                                        <Edit2 size={14} /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Addresses Tab ── */}
            {activeTab === 'addresses' && (
                <div className="space-y-5">
                    {addrLoading ? (
                        <div className="flex items-center gap-3 text-stone-400">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm">Loading addresses…</span>
                        </div>
                    ) : addrError ? (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <AlertCircle size={16} /> {addrError}
                        </div>
                    ) : addresses.length === 0 && !showAddForm ? (
                        <div className="rounded-3xl border-2 border-dashed border-stone-200 p-12 text-center">
                            <MapPin size={40} className="mx-auto mb-3 text-stone-300" />
                            <p className="font-semibold text-stone-700">No addresses saved yet</p>
                            <p className="mt-1 text-sm text-stone-400">Add an address to speed up checkout.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map(addr => (
                                <div key={addr.address_id}>
                                    {editingAddr?.address_id === addr.address_id ? (
                                        <AddressForm
                                            initial={editingAddr}
                                            onSave={handleUpdateAddress}
                                            onCancel={() => setEditingAddr(null)}
                                            saving={addrSaving}
                                        />
                                    ) : (
                                        <AddressCard
                                            addr={addr}
                                            onSetDefault={handleSetDefault}
                                            onEdit={(a) => { setEditingAddr(a); setShowAddForm(false); }}
                                            onDelete={handleDelete}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add new address */}
                    {showAddForm ? (
                        <AddressForm
                            onSave={handleAddAddress}
                            onCancel={() => setShowAddForm(false)}
                            saving={addrSaving}
                        />
                    ) : (
                        !editingAddr && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 py-4 text-sm font-semibold text-stone-500 transition-all hover:border-stone-900 hover:text-stone-900"
                            >
                                <Plus size={16} /> Add New Address
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
