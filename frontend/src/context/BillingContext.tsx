import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Bill,
  PaymentCollection,
  DiscountRequest,
  RefundRequest,
  BillCancellation,
  SupplierPayable,
  BillingAuditLog,
  BillingKPIs,
} from '../types/billing';
import {
  fetchBillsApi,
  fetchBillingKPIsApi,
  createBillApi,
  fetchPaymentCollectionsApi,
  recordPaymentCollectionApi,
  fetchDiscountRequestsApi,
  createDiscountRequestApi,
  fetchRefundRequestsApi,
  createRefundRequestApi,
  fetchBillCancellationsApi,
  fetchSupplierPayablesApi,
  fetchBillingAuditLogsApi,
} from '../services/api';

interface BillingContextType {
  bills: Bill[];
  collections: PaymentCollection[];
  discounts: DiscountRequest[];
  refunds: RefundRequest[];
  cancellations: BillCancellation[];
  supplierPayables: SupplierPayable[];
  auditLogs: BillingAuditLog[];
  kpis: BillingKPIs;
  loading: boolean;
  selectedBillForModal: Bill | null;
  setSelectedBillForModal: (bill: Bill | null) => void;
  selectedReceiptForModal: PaymentCollection | null;
  setSelectedReceiptForModal: (receipt: PaymentCollection | null) => void;
  refreshBillingData: () => Promise<void>;
  createNewBill: (billData: Partial<Bill>) => Promise<Bill>;
  collectPayment: (paymentData: Partial<PaymentCollection>) => Promise<PaymentCollection>;
  requestDiscount: (discountData: Partial<DiscountRequest>) => Promise<DiscountRequest>;
  requestRefund: (refundData: Partial<RefundRequest>) => Promise<RefundRequest>;
  approveDiscount: (id: string, approverName: string) => Promise<void>;
  approveRefund: (id: string, approverName: string) => Promise<void>;
  cancelBill: (billNumber: string, reason: string, staffName: string) => Promise<void>;
  paySupplier: (invoiceNumber: string, amount: number, paymentMode: string, referenceNo: string, remarks?: string) => Promise<void>;
}

const defaultKPIs: BillingKPIs = {
  today_revenue: 248600,
  today_billing: 315400,
  today_collection: 248600,
  total_outstanding: 66800,
  today_refunds: 12500,
  today_discounts: 18400,
  opd_revenue: 85000,
  ipd_revenue: 105000,
  lab_revenue: 32000,
  pharmacy_revenue: 24600,
  procedure_revenue: 18000,
  total_revenue: 264600,
  total_expenses: 61500,
  net_revenue: 203100,
};

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [collections, setCollections] = useState<PaymentCollection[]>([]);
  const [discounts, setDiscounts] = useState<DiscountRequest[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [cancellations, setCancellations] = useState<BillCancellation[]>([]);
  const [supplierPayables, setSupplierPayables] = useState<SupplierPayable[]>([]);
  const [auditLogs, setAuditLogs] = useState<BillingAuditLog[]>([]);
  const [kpis, setKpis] = useState<BillingKPIs>(defaultKPIs);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedBillForModal, setSelectedBillForModal] = useState<Bill | null>(null);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<PaymentCollection | null>(null);

  const refreshBillingData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        billsRes,
        kpiRes,
        paymentsRes,
        discountsRes,
        refundsRes,
        cancellationsRes,
        payablesRes,
        auditRes,
      ] = await Promise.allSettled([
        fetchBillsApi(),
        fetchBillingKPIsApi(),
        fetchPaymentCollectionsApi(),
        fetchDiscountRequestsApi(),
        fetchRefundRequestsApi(),
        fetchBillCancellationsApi(),
        fetchSupplierPayablesApi(),
        fetchBillingAuditLogsApi(),
      ]);

      if (billsRes.status === 'fulfilled' && Array.isArray(billsRes.value)) {
        setBills(billsRes.value);
      }
      if (kpiRes.status === 'fulfilled' && kpiRes.value) {
        setKpis(kpiRes.value);
      }
      if (paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value)) {
        setCollections(paymentsRes.value);
      }
      if (discountsRes.status === 'fulfilled' && Array.isArray(discountsRes.value)) {
        setDiscounts(discountsRes.value);
      }
      if (refundsRes.status === 'fulfilled' && Array.isArray(refundsRes.value)) {
        setRefunds(refundsRes.value);
      }
      if (cancellationsRes.status === 'fulfilled' && Array.isArray(cancellationsRes.value)) {
        setCancellations(cancellationsRes.value);
      }
      if (payablesRes.status === 'fulfilled' && Array.isArray(payablesRes.value)) {
        setSupplierPayables(payablesRes.value);
      }
      if (auditRes.status === 'fulfilled' && Array.isArray(auditRes.value)) {
        setAuditLogs(auditRes.value);
      }
    } catch (err) {
      console.warn('Error fetching billing data, using local fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBillingData();
  }, [refreshBillingData]);

  const createNewBill = async (billData: Partial<Bill>): Promise<Bill> => {
    try {
      const res = await createBillApi(billData);
      await refreshBillingData();
      return res;
    } catch (err) {
      // Fallback local update
      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        bill_number: billData.bill_number || `BILL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        patient_name: billData.patient_name || 'Guest Patient',
        uhid: billData.uhid || 'UHID-2026-9999',
        bill_type: billData.bill_type || 'OPD',
        department: billData.department || 'General OPD',
        doctor_name: billData.doctor_name || 'Duty Medical Officer',
        gross_amount: billData.gross_amount || 0,
        discount_amount: billData.discount_amount || 0,
        tax_amount: billData.tax_amount || 0,
        net_amount: billData.net_amount || 0,
        paid_amount: billData.paid_amount || 0,
        pending_amount: billData.pending_amount || 0,
        payment_mode: billData.payment_mode || 'Cash',
        payment_status: billData.payment_status || 'Pending',
        bill_date: billData.bill_date || new Date().toISOString().split('T')[0],
        billing_staff: billData.billing_staff || 'Cashier',
        branch: billData.branch || 'Main Branch',
        items: billData.items || [],
      };
      setBills((prev) => [newBill, ...prev]);
      return newBill;
    }
  };

  const collectPayment = async (paymentData: Partial<PaymentCollection>): Promise<PaymentCollection> => {
    try {
      const res = await recordPaymentCollectionApi(paymentData);
      await refreshBillingData();
      return res;
    } catch (err) {
      const newColl: PaymentCollection = {
        receipt_number: paymentData.receipt_number || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        bill_number: paymentData.bill_number || 'BILL-2026-0000',
        patient_name: paymentData.patient_name || 'Patient',
        uhid: paymentData.uhid || 'UHID-0000',
        service_type: paymentData.service_type || 'OPD',
        total_bill: paymentData.total_bill || 0,
        previously_paid: paymentData.previously_paid || 0,
        current_payment: paymentData.current_payment || 0,
        remaining_due: paymentData.remaining_due || 0,
        payment_mode: paymentData.payment_mode || 'Cash',
        transaction_ref: paymentData.transaction_ref || 'CASH-POS',
        payment_date: paymentData.payment_date || new Date().toLocaleString(),
        collected_by: paymentData.collected_by || 'Cashier',
        branch: paymentData.branch || 'Main Branch',
      };
      setCollections((prev) => [newColl, ...prev]);
      // Update local bill status
      setBills((prev) =>
        prev.map((b) => {
          if (b.bill_number === paymentData.bill_number) {
            const updatedPaid = b.paid_amount + (paymentData.current_payment || 0);
            const updatedPending = Math.max(0, b.net_amount - updatedPaid);
            return {
              ...b,
              paid_amount: updatedPaid,
              pending_amount: updatedPending,
              payment_status: updatedPending <= 0 ? 'Paid' : 'Partially Paid',
            };
          }
          return b;
        })
      );
      return newColl;
    }
  };

  const requestDiscount = async (discountData: Partial<DiscountRequest>): Promise<DiscountRequest> => {
    try {
      const res = await createDiscountRequestApi(discountData);
      await refreshBillingData();
      return res;
    } catch (err) {
      const newDisc: DiscountRequest = {
        discount_code: `DISC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        bill_number: discountData.bill_number || '',
        patient_name: discountData.patient_name || '',
        uhid: discountData.uhid || '',
        original_amount: discountData.original_amount || 0,
        discount_type: discountData.discount_type || 'Fixed Amount',
        discount_value: discountData.discount_value || 0,
        discount_amount: discountData.discount_amount || 0,
        reason: discountData.reason || 'Concession',
        requested_by: discountData.requested_by || 'Billing Officer',
        status: 'Pending',
        request_date: new Date().toISOString().split('T')[0],
      };
      setDiscounts((prev) => [newDisc, ...prev]);
      return newDisc;
    }
  };

  const requestRefund = async (refundData: Partial<RefundRequest>): Promise<RefundRequest> => {
    try {
      const res = await createRefundRequestApi(refundData);
      await refreshBillingData();
      return res;
    } catch (err) {
      const newRef: RefundRequest = {
        refund_code: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        bill_number: refundData.bill_number || '',
        patient_name: refundData.patient_name || '',
        uhid: refundData.uhid || '',
        original_amount: refundData.original_amount || 0,
        paid_amount: refundData.paid_amount || 0,
        refund_amount: refundData.refund_amount || 0,
        refund_reason: refundData.refund_reason || 'Service cancelled',
        refund_mode: refundData.refund_mode || 'Cash',
        requested_by: refundData.requested_by || 'Billing Officer',
        refund_date: new Date().toISOString().split('T')[0],
        status: 'Requested',
      };
      setRefunds((prev) => [newRef, ...prev]);
      return newRef;
    }
  };

  const approveDiscount = async (id: string, approverName: string) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id || d.discount_code === id ? { ...d, status: 'Approved', approved_by: approverName } : d))
    );
  };

  const approveRefund = async (id: string, approverName: string) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id || r.refund_code === id ? { ...r, status: 'Approved', approved_by: approverName } : r))
    );
  };

  const cancelBill = async (billNumber: string, reason: string, staffName: string) => {
    setBills((prev) =>
      prev.map((b) => (b.bill_number === billNumber ? { ...b, payment_status: 'Cancelled', notes: `Cancelled: ${reason}` } : b))
    );
    setCancellations((prev) => [
      {
        cancellation_code: `CAN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        bill_number: billNumber,
        patient_name: bills.find((b) => b.bill_number === billNumber)?.patient_name || 'Patient',
        uhid: bills.find((b) => b.bill_number === billNumber)?.uhid || 'UHID',
        original_amount: bills.find((b) => b.bill_number === billNumber)?.net_amount || 0,
        cancellation_reason: reason,
        requested_by: staffName,
        cancellation_date: new Date().toISOString().split('T')[0],
        status: 'Cancelled',
      },
      ...prev,
    ]);
  };

  const paySupplier = async (invoiceNumber: string, amount: number, paymentMode: string, referenceNo: string, remarks?: string) => {
    setSupplierPayables((prev) =>
      prev.map((sp) => {
        if (sp.invoice_number === invoiceNumber) {
          const newPaid = sp.paid_amount + amount;
          const newOutstanding = Math.max(0, sp.invoice_amount - newPaid);
          const newStatus = newOutstanding <= 0 ? 'Paid' : 'Partially Paid';
          return {
            ...sp,
            paid_amount: newPaid,
            outstanding_amount: newOutstanding,
            payment_status: newStatus,
          };
        }
        return sp;
      })
    );
  };

  return (
    <BillingContext.Provider
      value={{
        bills,
        collections,
        discounts,
        refunds,
        cancellations,
        supplierPayables,
        auditLogs,
        kpis,
        loading,
        selectedBillForModal,
        setSelectedBillForModal,
        selectedReceiptForModal,
        setSelectedReceiptForModal,
        refreshBillingData,
        createNewBill,
        collectPayment,
        requestDiscount,
        requestRefund,
        approveDiscount,
        approveRefund,
        cancelBill,
        paySupplier,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
