// src/hooks/useDeclarationsApi.js
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function useDeclarationsApi() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCodes, setAvailableCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [exporters, setExporters] = useState([]);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/declarations`);
      if (!res.ok) throw new Error('Failed to fetch declarations');
      const data = await res.json();
      setDeclarations(data);
    } catch (err) {
      console.error('Error fetching declarations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTariffCodes = async () => {
    try {
      const res = await fetch(`${API_URL}/tariffs`);
      const data = await res.json();
      setAvailableCodes(data);
    } catch (err) {
      console.error('Failed to load tariff codes:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const fetchExporters = async () => {
    try {
      const res = await fetch(`${API_URL}/exporters`);
      const data = await res.json();
      setExporters(data);
    } catch (err) {
      console.error('Failed to load exporters:', err);
    }
  };

  const saveDeclaration = async (declaration) => {
    const isEditing = !!declaration.id;
    const url = isEditing
      ? `${API_URL}/declarations/${declaration.id}`
      : `${API_URL}/declarations`;

    const res = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(declaration),
    });

    if (!res.ok) throw new Error('Failed to save declaration');

    const saved = await res.json();
    setDeclarations((prev) =>
      isEditing
        ? prev.map((d) => (d.id === saved.id ? saved : d))
        : [...prev, saved]
    );
    return saved;
  };

  const saveTariffs = async (declarationId, tariffs) => {
    const res = await fetch(`${API_URL}/declarations/${declarationId}/tariffs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tariffs }),
    });
    if (!res.ok) throw new Error('Failed to save tariffs');

    const updated = await res.json();
    setDeclarations((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    return updated;
  };

  const deleteDeclaration = async (id) => {
    const res = await fetch(`${API_URL}/declarations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete declaration');

    setDeclarations((prev) => prev.filter((d) => d.id !== id));
  };

  const generateXml = async (data) => {
    const res = await fetch(`${API_URL}/generate-xml`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate XML');
    const blob = await res.blob();
    return blob;
  };

  useEffect(() => {
    fetchDeclarations();
    if (availableCodes.length === 0) fetchTariffCodes();
  }, [availableCodes]);

  return {
    declarations,
    loading,
    availableCodes,
    users,
    exporters,
    fetchUsers,
    fetchExporters,
    fetchDeclarations,
    saveDeclaration,
    saveTariffs,
    deleteDeclaration,
    generateXml,
  };
}
