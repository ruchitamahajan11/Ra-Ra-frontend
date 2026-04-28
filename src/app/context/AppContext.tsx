import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Company, Quotation, Agreement, Invoice,
  initialQuotations, initialAgreements, initialInvoices,
} from '../data/mockData';
import api from '../../services/api';

interface AppContextType {
  isAuthenticated: boolean;
  companies: Company[];
  quotations: Quotation[];
  agreements: Agreement[];
  invoices: Invoice[];
  companiesLoading: boolean;
  companiesError: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, data: Partial<Company>) => void;
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, data: Partial<Quotation>) => void;
  addAgreement: (agreement: Omit<Agreement, 'id'>) => void;
  updateAgreement: (id: string, data: Partial<Agreement>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ✅ Setting this to 'false' is what forces the app to open the login page first
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [agreements, setAgreements] = useState<Agreement[]>(initialAgreements);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  // ✅ Fetch companies from backend on app load
  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      setCompaniesError(null);
      try {
        console.log('🌐 Fetching companies from backend...');
        const response = await api.get('/api/companies');
        const data = response.data;
        console.log('✅ Companies fetched:', data);
        if (data.success) {
          setCompanies(data.data);
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch companies:', err.message);
        setCompaniesError(err.message);
      } finally {
        setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const login = (email: string, password: string): boolean => {
    // Hardcoded credentials
    if (email === 'admin@techcorp.in' && password === 'Admin@123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAuthenticated(false);

  const addCompany = (c: Company) => setCompanies(prev => [c, ...prev]);
  const updateCompany = (id: string, data: Partial<Company>) =>
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

  const addQuotation = (q: Quotation) => setQuotations(prev => [q, ...prev]);
  const updateQuotation = (id: string, data: Partial<Quotation>) =>
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));

  const addAgreement = (a: Omit<Agreement, 'id'>) =>
    setAgreements(prev => [...prev, { ...a, id: `agr-${Date.now()}` }]);
  const updateAgreement = (id: string, data: Partial<Agreement>) =>
    setAgreements(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));

  const addInvoice = (inv: Omit<Invoice, 'id'>) =>
    setInvoices(prev => [...prev, { ...inv, id: `inv-${Date.now()}` }]);
  const updateInvoice = (id: string, data: Partial<Invoice>) =>
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));

  return (
    <AppContext.Provider value={{
      isAuthenticated, companies, quotations, agreements, invoices,
      companiesLoading, companiesError,
      login, logout,
      addCompany, updateCompany,
      addQuotation, updateQuotation,
      addAgreement, updateAgreement,
      addInvoice, updateInvoice,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}