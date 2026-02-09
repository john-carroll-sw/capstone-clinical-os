/**
 * PersonaContext — the demo superpower
 * 
 * Stores the current department + role selection and provides
 * the active persona to the entire app. All data-fetching hooks
 * read from this context to filter mock data by persona.
 * 
 * Changing the persona re-routes to the appropriate default page.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type Department,
  type Role,
  type Persona,
  PERSONAS,
  DEFAULT_PERSONA,
} from '../data/healthcare/personas';

interface PersonaContextValue {
  /** Currently active persona */
  persona: Persona;
  /** Current department filter */
  department: Department;
  /** Current role */
  role: Role;
  /** All available personas */
  personas: Persona[];
  /** Switch to a specific persona by ID */
  setPersonaById: (id: string) => void;
  /** Switch department + role (finds best matching persona) */
  setDepartmentAndRole: (department: Department, role: Role) => void;
  /** Switch just the department (keeps current role) */
  setDepartment: (department: Department) => void;
  /** Switch just the role (keeps current department) */
  setRole: (role: Role) => void;
  /** Switch role without navigating (used for auto-sync on surface change) */
  setRoleQuiet: (role: Role) => void;
  /** Switch role + department without navigating (used for clinician sub-page sync) */
  syncPersonaQuiet: (role: Role, department: Department) => void;
}

const PersonaCtx = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>(DEFAULT_PERSONA);
  
  // We need to handle navigation inside the provider, but useNavigate 
  // requires being inside a Router. We'll try/catch in case this is
  // rendered outside a Router (e.g., tests).
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch {
    // Not inside a Router — navigation is a no-op
  }

  const navigateToPersonaDefault = useCallback((p: Persona) => {
    if (navigate) {
      navigate(p.defaultRoute);
    }
  }, [navigate]);

  const setPersonaById = useCallback((id: string) => {
    const found = PERSONAS.find(p => p.id === id);
    if (found) {
      setPersona(found);
      navigateToPersonaDefault(found);
    }
  }, [navigateToPersonaDefault]);

  const setDepartmentAndRole = useCallback((department: Department, role: Role) => {
    // Find the best matching persona
    const match = PERSONAS.find(p => p.department === department && p.role === role)
      || PERSONAS.find(p => p.role === role)
      || DEFAULT_PERSONA;
    setPersona(match);
    navigateToPersonaDefault(match);
  }, [navigateToPersonaDefault]);

  const setDepartment = useCallback((department: Department) => {
    setPersona(prev => {
      const match = PERSONAS.find(p => p.department === department && p.role === prev.role)
        || PERSONAS.find(p => p.department === department)
        || prev;
      return match;
    });
  }, []);

  const setRole = useCallback((role: Role) => {
    setPersona(prev => {
      const match = PERSONAS.find(p => p.role === role && p.department === prev.department)
        || PERSONAS.find(p => p.role === role)
        || prev;
      // Navigate to the new persona's default route
      if (navigate && match.id !== prev.id) {
        navigate(match.defaultRoute);
      }
      return match;
    });
  }, [navigate]);

  /** Switch role without triggering navigation — for auto-sync when surface changes */
  const setRoleQuiet = useCallback((role: Role) => {
    setPersona(prev => {
      const match = PERSONAS.find(p => p.role === role && p.department === prev.department)
        || PERSONAS.find(p => p.role === role)
        || prev;
      return match;
    });
  }, []);

  /** Switch role + department without triggering navigation — for clinician sub-page sync */
  const syncPersonaQuiet = useCallback((role: Role, department: Department) => {
    setPersona(prev => {
      const match = PERSONAS.find(p => p.role === role && p.department === department)
        || PERSONAS.find(p => p.role === role)
        || prev;
      return match;
    });
  }, []);

  return (
    <PersonaCtx.Provider value={{
      persona,
      department: persona.department,
      role: persona.role,
      personas: PERSONAS,
      setPersonaById,
      setDepartmentAndRole,
      setDepartment,
      setRole,
      setRoleQuiet,
      syncPersonaQuiet,
    }}>
      {children}
    </PersonaCtx.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaCtx);
  if (!ctx) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return ctx;
}
