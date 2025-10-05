"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "GERANT" | "EMPLOYE" | "AUDITEUR";
  createdAt: string;
}

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 403) {
        setCurrentUserRole("EMPLOYE"); // Not admin
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUser(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "GERANT":
        return "Gérant";
      case "EMPLOYE":
        return "Employé";
      case "AUDITEUR":
        return "Auditeur";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Configuration système et gestion des utilisateurs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentUserRole === "EMPLOYE" ? (
              <p className="text-gray-600">
                Vous n'avez pas les permissions pour gérer les utilisateurs.
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded"
                  >
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Créé le {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {getRoleLabel(user.role)}
                      </span>
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          disabled={updatingUser === user.id}
                          className="p-1 border rounded text-sm disabled:opacity-50"
                        >
                          <option value="EMPLOYE">Employé</option>
                          <option value="AUDITEUR">Auditeur</option>
                          <option value="GERANT">Gérant</option>
                        </select>
                        {updatingUser === user.id && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Préférences Système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="minStockDefault">
                Seuil de Stock Minimum par Défaut
              </Label>
              <Input
                id="minStockDefault"
                type="number"
                defaultValue="10"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Fonctionnalité à implémenter
              </p>
            </div>

            <div>
              <Label htmlFor="alertDays">
                Jours avant alerte de péremption
              </Label>
              <Input id="alertDays" type="number" defaultValue="30" disabled />
              <p className="text-xs text-gray-500 mt-1">
                Fonctionnalité à implémenter
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rôles et Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold text-green-600">Gérant</h3>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Gestion des utilisateurs</li>
                  <li>• Accès à tous les rapports</li>
                  <li>• Configuration système</li>
                  <li>• Toutes les permissions employé</li>
                </ul>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-semibold text-blue-600">Employé</h3>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Gestion des produits</li>
                  <li>• Gestion des stocks</li>
                  <li>• Inventaire</li>
                  <li>• Consultation des rapports</li>
                </ul>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-semibold text-purple-600">Auditeur</h3>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Lecture seule</li>
                  <li>• Accès aux rapports</li>
                  <li>• Historique des mouvements</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
