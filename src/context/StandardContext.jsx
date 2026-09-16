import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import API from "../api/api";
import { subjectsByStandard as defaultSubjectsMap } from "../utils/subjectsByStandard";
import toast from "react-hot-toast";
import { getGujaratiErrorMessage } from "../utils/gujaratiMessages";

const StandardContext = createContext(null);

const getInitialStandards = () => {
  try {
    const cached = sessionStorage.getItem("cached_standards");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return Object.entries(defaultSubjectsMap).map(([name, subjects], index) => ({
    _id: `default_${index}_${encodeURIComponent(name)}`,
    name,
    subjects: Array.isArray(subjects) ? [...subjects] : [],
    order: index,
    isDefault: true,
  }));
};

export const StandardProvider = ({ children }) => {
  const [standardsList, setStandardsList] = useState(getInitialStandards);
  const [loading, setLoading] = useState(false);

  // Fetch standards from API
  const fetchStandards = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await API.get("/standards");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStandardsList(res.data);
        try {
          sessionStorage.setItem("cached_standards", JSON.stringify(res.data));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Error fetching standards:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandards();
  }, [fetchStandards]);

  // Derived map: { "ધોરણ 1": ["ગુજરાતી", "ગણિત", ...], ... }
  const subjectsByStandard = useMemo(() => {
    if (standardsList.length === 0) {
      return defaultSubjectsMap;
    }
    const map = {};
    standardsList.forEach((std) => {
      map[std.name] = std.subjects || [];
    });
    return map;
  }, [standardsList]);

  // Derived array of standard names: ["બાલ મંદિર", "ધોરણ 1", ...]
  const standardNames = useMemo(() => {
    return Object.keys(subjectsByStandard);
  }, [subjectsByStandard]);

  // 1️⃣ Add New Standard
  const addStandard = async (name, initialSubjects = []) => {
    try {
      const res = await API.post("/standards", {
        name: name.trim(),
        subjects: initialSubjects,
      });
      setStandardsList((prev) => [...prev.filter((s) => s.name !== res.data.name), res.data]);
      toast.success(`ધોરણ "${res.data.name}" સફળતાપૂર્વક ઉમેરાયું.`);
      return res.data;
    } catch (err) {
      const msg = getGujaratiErrorMessage(err, "ધોરણ ઉમેરવામાં સમસ્યા આવી.");
      toast.error(msg);
      throw err;
    }
  };

  // 2️⃣ Add Subject to Standard
  const addSubject = async (standardId, subjectName, standardName) => {
    try {
      const res = await API.post(`/standards/${standardId}/subjects`, {
        subject: subjectName.trim(),
        standardName,
      });
      setStandardsList((prev) =>
        prev.map((s) => (s._id === standardId || s.name === (standardName || res.data.name) ? res.data : s))
      );
      toast.success(`વિષય "${subjectName}" સફળતાપૂર્વક ઉમેરાયો.`);
      return res.data;
    } catch (err) {
      const msg = getGujaratiErrorMessage(err, "વિષય ઉમેરવામાં સમસ્યા આવી.");
      toast.error(msg);
      throw err;
    }
  };

  // 3️⃣ Remove Subject from Standard
  const removeSubject = async (standardId, subjectName, standardName) => {
    try {
      const res = await API.delete(
        `/standards/${standardId}/subjects/${encodeURIComponent(subjectName)}?standardName=${encodeURIComponent(standardName || "")}`
      );
      setStandardsList((prev) =>
        prev.map((s) => (s._id === standardId || s.name === (standardName || res.data.name) ? res.data : s))
      );
      toast.success(`વિષય "${subjectName}" દૂર કરવામાં આવ્યો.`);
      return res.data;
    } catch (err) {
      const msg = getGujaratiErrorMessage(err, "વિષય દૂર કરવામાં સમસ્યા આવી.");
      toast.error(msg);
      throw err;
    }
  };

  // 4️⃣ Delete Standard
  const deleteStandard = async (standardId, standardName) => {
    try {
      await API.delete(`/standards/${standardId}?standardName=${encodeURIComponent(standardName || "")}`);
      setStandardsList((prev) => prev.filter((s) => s._id !== standardId && s.name !== standardName));
      toast.success(`ધોરણ "${standardName}" સફળતાપૂર્વક ડિલીટ થયું.`);
    } catch (err) {
      const msg = getGujaratiErrorMessage(err, "ધોરણ ડિલીટ કરવામાં સમસ્યા આવી.");
      toast.error(msg);
      throw err;
    }
  };

  const value = {
    standardsList,
    subjectsByStandard,
    standardNames,
    loading,
    refreshStandards: fetchStandards,
    addStandard,
    addSubject,
    removeSubject,
    deleteStandard,
  };

  return (
    <StandardContext.Provider value={value}>
      {children}
    </StandardContext.Provider>
  );
};

export const useStandards = () => {
  const context = useContext(StandardContext);
  if (!context) {
    throw new Error("useStandards must be used within a StandardProvider");
  }
  return context;
};
