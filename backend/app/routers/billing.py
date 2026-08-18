from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.billing import (
    Bill, BillItem, PaymentCollection, DiscountRequest,
    RefundRequest, BillCancellation, SupplierPayable, BillingAuditLog
)
from app.schemas.billing import (
    BillCreateSchema, BillResponseSchema, PaymentCollectionCreateSchema,
    DiscountRequestSchema, RefundRequestSchema, BillCancellationSchema,
    SupplierPayableSchema, BillingAuditLogSchema
)

router = APIRouter(prefix="/billing", tags=["Billing & Revenue Management"])


@router.get("/kpis")
def get_billing_kpis(db: Session = Depends(get_db)):
    bills = db.query(Bill).all()
    collections = db.query(PaymentCollection).all()
    refunds = db.query(RefundRequest).filter(RefundRequest.status.in_(["Approved", "Processed"])).all()
    discounts = db.query(DiscountRequest).filter(DiscountRequest.status == "Approved").all()
    payables = db.query(SupplierPayable).all()

    today_str = datetime.now().strftime("%Y-%m-%d")

    today_collected = sum(c.current_payment for c in collections if c.payment_date.startswith(today_str))
    today_billing = sum(b.net_amount for b in bills if b.bill_date.startswith(today_str))
    total_outstanding = sum(b.pending_amount for b in bills if b.payment_status in ["Pending", "Partially Paid", "Overdue"])
    today_refunds = sum(r.refund_amount for r in refunds if r.refund_date.startswith(today_str))
    today_discounts = sum(d.discount_amount for d in discounts if d.request_date.startswith(today_str))

    # Revenue by department / module
    opd_rev = sum(b.paid_amount for b in bills if b.bill_type == "OPD")
    ipd_rev = sum(b.paid_amount for b in bills if b.bill_type == "IPD")
    lab_rev = sum(b.paid_amount for b in bills if b.bill_type == "Lab")
    pharmacy_rev = sum(b.paid_amount for b in bills if b.bill_type == "Pharmacy")
    procedure_rev = sum(b.paid_amount for b in bills if b.bill_type == "Procedure")

    total_revenue = sum(b.paid_amount for b in bills)
    total_expenses = sum(p.paid_amount for p in payables) + sum(r.refund_amount for r in refunds)
    net_revenue = total_revenue - total_expenses

    return {
        "today_revenue": today_collected,
        "today_billing": today_billing,
        "today_collection": today_collected,
        "total_outstanding": total_outstanding,
        "today_refunds": today_refunds,
        "today_discounts": today_discounts,
        "opd_revenue": opd_rev,
        "ipd_revenue": ipd_rev,
        "lab_revenue": lab_rev,
        "pharmacy_revenue": pharmacy_rev,
        "procedure_revenue": procedure_rev,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "net_revenue": net_revenue,
    }


@router.get("/bills", response_model=List[BillResponseSchema])
def get_all_bills(
    bill_type: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Bill)
    if bill_type:
        query = query.filter(Bill.bill_type == bill_type)
    if payment_status:
        query = query.filter(Bill.payment_status == payment_status)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Bill.bill_number.ilike(search_fmt)) |
            (Bill.patient_name.ilike(search_fmt)) |
            (Bill.uhid.ilike(search_fmt)) |
            (Bill.doctor_name.ilike(search_fmt))
        )
    return query.order_by(Bill.created_at.desc()).all()


@router.post("/bills", response_model=BillResponseSchema)
def create_bill(payload: BillCreateSchema, db: Session = Depends(get_db)):
    count = db.query(Bill).count() + 1
    bill_no = payload.bill_number or f"BILL-2026-{count:05d}"
    
    new_bill = Bill(
        bill_number=bill_no,
        patient_id=payload.patient_id,
        patient_name=payload.patient_name,
        uhid=payload.uhid,
        appointment_id=payload.appointment_id,
        ipd_number=payload.ipd_number,
        bill_type=payload.bill_type,
        department=payload.department,
        doctor_name=payload.doctor_name,
        gross_amount=payload.gross_amount,
        discount_amount=payload.discount_amount,
        tax_amount=payload.tax_amount,
        net_amount=payload.net_amount,
        paid_amount=payload.paid_amount,
        pending_amount=payload.pending_amount,
        payment_mode=payload.payment_mode,
        payment_status=payload.payment_status,
        discharge_status=payload.discharge_status,
        bill_date=payload.bill_date or datetime.now().strftime("%Y-%m-%d"),
        due_date=payload.due_date,
        billing_staff=payload.billing_staff,
        branch=payload.branch,
        notes=payload.notes,
    )
    db.add(new_bill)
    db.flush()

    for item in payload.items:
        bill_item = BillItem(
            bill_id=new_bill.id,
            service_name=item.service_name,
            category=item.category,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            gross_amount=item.gross_amount,
            discount=item.discount,
            tax=item.tax,
            net_amount=item.net_amount,
        )
        db.add(bill_item)

    # Log audit
    audit = BillingAuditLog(
        transaction_id=f"AUD-{int(datetime.now().timestamp())}",
        bill_number=bill_no,
        entity_type="Bill",
        action="Created",
        previous_value=None,
        new_value=f"Bill created for {payload.patient_name} ({payload.uhid}) - ₹{payload.net_amount}",
        user_name=payload.billing_staff,
        user_role="Billing Officer",
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        reason="New Bill Generation"
    )
    db.add(audit)

    db.commit()
    db.refresh(new_bill)
    return new_bill


@router.get("/payments", response_model=List[PaymentCollectionCreateSchema])
def get_payment_collections(db: Session = Depends(get_db)):
    return db.query(PaymentCollection).order_by(PaymentCollection.created_at.desc()).all()


@router.post("/payments", response_model=PaymentCollectionCreateSchema)
def record_payment_collection(payload: PaymentCollectionCreateSchema, db: Session = Depends(get_db)):
    rc_count = db.query(PaymentCollection).count() + 1
    rc_number = payload.receipt_number or f"REC-2026-{rc_count:05d}"

    payment = PaymentCollection(
        receipt_number=rc_number,
        bill_id=payload.bill_id,
        bill_number=payload.bill_number,
        patient_name=payload.patient_name,
        uhid=payload.uhid,
        service_type=payload.service_type,
        total_bill=payload.total_bill,
        previously_paid=payload.previously_paid,
        current_payment=payload.current_payment,
        remaining_due=payload.remaining_due,
        payment_mode=payload.payment_mode,
        transaction_ref=payload.transaction_ref,
        payment_date=payload.payment_date or datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        collected_by=payload.collected_by,
        branch=payload.branch,
        notes=payload.notes,
    )
    db.add(payment)

    # Update bill paid & pending amounts
    bill = db.query(Bill).filter(Bill.bill_number == payload.bill_number).first()
    if bill:
        bill.paid_amount += payload.current_payment
        bill.pending_amount = max(0.0, bill.net_amount - bill.paid_amount)
        if bill.pending_amount <= 0:
            bill.payment_status = "Paid"
        else:
            bill.payment_status = "Partially Paid"
        bill.payment_mode = payload.payment_mode

    # Log audit
    audit = BillingAuditLog(
        transaction_id=f"AUD-{int(datetime.now().timestamp())}",
        bill_number=payload.bill_number,
        entity_type="Payment",
        action="Collected",
        previous_value=f"Prev Paid: ₹{payload.previously_paid}",
        new_value=f"Collected ₹{payload.current_payment} via {payload.payment_mode}. Remaining: ₹{payload.remaining_due}",
        user_name=payload.collected_by,
        user_role="Cashier",
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        reason=f"Payment Received ({rc_number})"
    )
    db.add(audit)

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/discounts", response_model=List[DiscountRequestSchema])
def get_discount_requests(db: Session = Depends(get_db)):
    return db.query(DiscountRequest).order_by(DiscountRequest.created_at.desc()).all()


@router.post("/discounts", response_model=DiscountRequestSchema)
def create_discount_request(payload: DiscountRequestSchema, db: Session = Depends(get_db)):
    d_count = db.query(DiscountRequest).count() + 1
    d_code = payload.discount_code or f"DISC-2026-{d_count:04d}"

    disc = DiscountRequest(
        discount_code=d_code,
        bill_number=payload.bill_number,
        patient_name=payload.patient_name,
        uhid=payload.uhid,
        original_amount=payload.original_amount,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        discount_amount=payload.discount_amount,
        reason=payload.reason,
        requested_by=payload.requested_by,
        approved_by=payload.approved_by,
        status=payload.status,
        request_date=payload.request_date or datetime.now().strftime("%Y-%m-%d"),
    )
    db.add(disc)

    audit = BillingAuditLog(
        transaction_id=f"AUD-{int(datetime.now().timestamp())}",
        bill_number=payload.bill_number,
        entity_type="Discount",
        action="Requested",
        previous_value=None,
        new_value=f"Discount request {d_code} for ₹{payload.discount_amount} ({payload.reason})",
        user_name=payload.requested_by,
        user_role="Billing Staff",
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        reason=payload.reason
    )
    db.add(audit)

    db.commit()
    db.refresh(disc)
    return disc


@router.get("/refunds", response_model=List[RefundRequestSchema])
def get_refund_requests(db: Session = Depends(get_db)):
    return db.query(RefundRequest).order_by(RefundRequest.created_at.desc()).all()


@router.post("/refunds", response_model=RefundRequestSchema)
def create_refund_request(payload: RefundRequestSchema, db: Session = Depends(get_db)):
    r_count = db.query(RefundRequest).count() + 1
    r_code = payload.refund_code or f"REF-2026-{r_count:04d}"

    ref = RefundRequest(
        refund_code=r_code,
        bill_number=payload.bill_number,
        patient_name=payload.patient_name,
        uhid=payload.uhid,
        original_amount=payload.original_amount,
        paid_amount=payload.paid_amount,
        refund_amount=payload.refund_amount,
        refund_reason=payload.refund_reason,
        refund_mode=payload.refund_mode,
        requested_by=payload.requested_by,
        approved_by=payload.approved_by,
        refund_date=payload.refund_date or datetime.now().strftime("%Y-%m-%d"),
        status=payload.status,
    )
    db.add(ref)

    audit = BillingAuditLog(
        transaction_id=f"AUD-{int(datetime.now().timestamp())}",
        bill_number=payload.bill_number,
        entity_type="Refund",
        action="Requested",
        previous_value=None,
        new_value=f"Refund request {r_code} for ₹{payload.refund_amount} ({payload.refund_reason})",
        user_name=payload.requested_by,
        user_role="Billing Officer",
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        reason=payload.refund_reason
    )
    db.add(audit)

    db.commit()
    db.refresh(ref)
    return ref


@router.get("/cancellations", response_model=List[BillCancellationSchema])
def get_cancellations(db: Session = Depends(get_db)):
    return db.query(BillCancellation).order_by(BillCancellation.created_at.desc()).all()


@router.get("/supplier-payables", response_model=List[SupplierPayableSchema])
def get_supplier_payables(db: Session = Depends(get_db)):
    return db.query(SupplierPayable).order_by(SupplierPayable.created_at.desc()).all()


@router.get("/audit-logs", response_model=List[BillingAuditLogSchema])
def get_billing_audit_logs(db: Session = Depends(get_db)):
    return db.query(BillingAuditLog).order_by(BillingAuditLog.created_at.desc()).all()
