import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AnalysisResult {
  id: string;
  userId: string;
  type: "blood" | "urine" | "imaging" | "other";
  title: string;
  date: Date;
  results: Record<string, any>;
  status: "pending" | "completed" | "abnormal";
  notes?: string;
  recommendations?: string[];
}

export interface MedicalRecord {
  id: string;
  userId: string;
  type: "appointment" | "prescription" | "vaccination" | "surgery" | "other";
  title: string;
  date: Date;
  doctor?: string;
  clinic?: string;
  description?: string;
  attachments?: string[];
}

export interface MedicalDataState {
  analysisResults: AnalysisResult[];
  medicalRecords: MedicalRecord[];
  isLoading: boolean;
  error: string | null;
}

export interface MedicalDataActions {
  addAnalysisResult: (result: Omit<AnalysisResult, "id">) => void;
  updateAnalysisResult: (id: string, updates: Partial<AnalysisResult>) => void;
  deleteAnalysisResult: (id: string) => void;
  addMedicalRecord: (record: Omit<MedicalRecord, "id">) => void;
  updateMedicalRecord: (id: string, updates: Partial<MedicalRecord>) => void;
  deleteMedicalRecord: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearAllData: () => void;
}

export type MedicalDataStore = MedicalDataState & MedicalDataActions;

export const useMedicalDataStore = create<MedicalDataStore>()(
  persist(
    (set, get) => ({
      // Initial state
      analysisResults: [],
      medicalRecords: [],
      isLoading: false,
      error: null,

      // Actions
      addAnalysisResult: result => {
        const newResult: AnalysisResult = {
          ...result,
          id: Date.now().toString(),
        };

        set(state => ({
          analysisResults: [...state.analysisResults, newResult],
        }));
      },

      updateAnalysisResult: (id, updates) => {
        set(state => ({
          analysisResults: state.analysisResults.map(result =>
            result.id === id ? { ...result, ...updates } : result
          ),
        }));
      },

      deleteAnalysisResult: id => {
        set(state => ({
          analysisResults: state.analysisResults.filter(
            result => result.id !== id
          ),
        }));
      },

      addMedicalRecord: record => {
        const newRecord: MedicalRecord = {
          ...record,
          id: Date.now().toString(),
        };

        set(state => ({
          medicalRecords: [...state.medicalRecords, newRecord],
        }));
      },

      updateMedicalRecord: (id, updates) => {
        set(state => ({
          medicalRecords: state.medicalRecords.map(record =>
            record.id === id ? { ...record, ...updates } : record
          ),
        }));
      },

      deleteMedicalRecord: id => {
        set(state => ({
          medicalRecords: state.medicalRecords.filter(
            record => record.id !== id
          ),
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      clearAllData: () => {
        set({
          analysisResults: [],
          medicalRecords: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "medical-data-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
