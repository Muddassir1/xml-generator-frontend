// src/hooks/useDeclarationsApi.js
import { useEffect, useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function useDeclarationsApi() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCodes, setAvailableCodes] = useState([]);
  const [masterBill, setMasterBill] = useState(null);
  const [users, setUsers] = useState([]);
  const [exporters, setExporters] = useState([]);

  const fetchDeclarations = useCallback(async (transportMode = null) => {
    try {
      setLoading(true);
      const url = transportMode 
        ? `${API_URL}/declarations?transportMode=${transportMode}`
        : `${API_URL}/declarations`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch declarations');
      const data = await res.json();
      setDeclarations(data);
    } catch (err) {
      console.error('Error fetching declarations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTariffCodes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/tariffs`);
      const data = await res.json();
      setAvailableCodes(data);
    } catch (err) {
      console.error('Failed to load tariff codes:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  const fetchExporters = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/exporters`);
      const data = await res.json();
      setExporters(data);
    } catch (err) {
      console.error('Failed to load exporters:', err);
    }
  }, []);

  const saveDeclaration = useCallback(async (declaration) => {
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
  }, []);

  const saveTariffs = useCallback(async (declarationId, tariffs) => {
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
  }, []);

  const deleteDeclaration = useCallback(async (id) => {
    const res = await fetch(`${API_URL}/declarations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete declaration');

    setDeclarations((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const deleteDeclarations = useCallback(async (ids) => {
    const res = await fetch(`${API_URL}/declarations`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to delete declarations');

    const result = await res.json();
    setDeclarations((prev) => prev.filter((d) => !ids.includes(d.id)));
    return result;
  }, []);

   const fetchMasterBill = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/master-bill`);
      const data = await res.json();
      setMasterBill(data);
    } catch (err) {
      console.error('Failed to load master bill:', err);
    }
  }, []);

  const generateXml = useCallback(async (data) => {
    const res = await fetch(`${API_URL}/generate-xml`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate XML');
    const blob = await res.blob();
    return blob;
  }, []);

  useEffect(() => {
    if (availableCodes.length === 0) fetchTariffCodes();
  }, [availableCodes, fetchTariffCodes]);

  return {
    declarations,
    loading,
    availableCodes,
    users,
    exporters,
    masterBill,
    fetchUsers,
    fetchExporters,
    fetchDeclarations,
    saveDeclaration,
    saveTariffs,
    deleteDeclaration,
    deleteDeclarations,
    fetchMasterBill,
    generateXml,
  };
}
