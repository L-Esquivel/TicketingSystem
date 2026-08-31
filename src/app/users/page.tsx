'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { CreateUserModal } from '../../components/CreateUserModal';
import { EditUserModal } from '../../components/EditUserModal';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  Lock,
  KeyRound,
  ShieldAlert,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { formatDate, formatTimeAgo } from '../../lib/utils';
import { toast } from 'sonner';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, meRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/auth/me'),
      ]);

      const usersData = await usersRes.json();
      const meData = await meRes.json();

      if (usersData.success) {
        setUsers(usersData.data);
      }
      if (meData.success && meData.data) {
        setCurrentUser(meData.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (targetUser: any) => {
    if (currentUser?.id === targetUser.id) {
      toast.error('You cannot delete your own logged-in account');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete user "${targetUser.name}" (${targetUser.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`User ${targetUser.name} deleted successfully`);
        fetchUsers();
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting user');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            👑 Super Admin
          </span>
        );
      case 'EXECUTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            👔 Executive / Director
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            🛠️ IT Technician
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#090d16]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                User Management & Access Security
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage administrative accounts, IT support technicians, role-based permissions, and password credentials.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
                />
              ))
            ) : users.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No users found.</p>
              </div>
            ) : (
              users.map((user) => {
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border ${
                      isCurrent
                        ? 'border-blue-500/80 shadow-md shadow-blue-500/10'
                        : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                    } transition-all flex flex-col justify-between`}
                  >
                    <div>
                      {/* Top Row: Role & Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500 text-white shadow-sm">
                              You
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedUserToEdit(user);
                              setIsEditOpen(true);
                            }}
                            title="Edit user & password"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              title="Delete user"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="mt-4 flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                          {user.name?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                            {user.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Added {formatDate(user.createdAt)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedUserToEdit(user);
                          setIsEditOpen(true);
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Reset Password
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchUsers()}
      />

      <EditUserModal
        user={selectedUserToEdit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUserToEdit(null);
        }}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
}
