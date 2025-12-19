import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useGetCurrentCompanyDataQuery } from "../api/slices/dashBoardSlice.js";

const GlobalInvoiceLayout2 = ({ invoice }) => {
    const invoiceRef = useRef();
    const currentCompanyID =
      typeof window !== "undefined" ? localStorage.getItem("CURRENT_COMPANY") : null;
    const { data: currentCompanyResp } = useGetCurrentCompanyDataQuery(
      { id: currentCompanyID },
      { skip: !currentCompanyID }
    );
    const activeCompany = currentCompanyResp?.data || null;
    const companyName = activeCompany?.name || "Company Name";
    let logoUrl = null;
    const logoVal = activeCompany?.logo || null;
    if (typeof logoVal === "string" && logoVal && logoVal !== "null") {
      const trimmed = logoVal.trim();
      if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("/")
      ) {
        logoUrl = trimmed;
      } else {
        const base = window.__APP_CONFIG__?.VITE_APP_BASE_URL || "";
        logoUrl = `${base}/storage/files/company/${trimmed}`;
      }
    }

    const downloadPDF = async () => {
        const element = invoiceRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`invoice-${invoice.number}.pdf`);
    };

    const subtotal = invoice.items.reduce(
        (sum, item) => sum + item.qty * item.price,
        0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return (
        <>
            <div ref={invoiceRef} className="invoice-layout2-page">
                <header className="invoice-layout2-header">
                    <div className="inv-header-left">
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt="Company Logo"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                    </div>
                    <div className="inv-header-center">
                      <h1 style={{ margin: 0 }}>{companyName}</h1>
                      <h6 style={{ margin: 0, opacity: 0.9 }}>
                        {activeCompany?.activity || activeCompany?.slogan || ""}
                      </h6>
                    </div>
                    <div className="inv-header-right" />
                </header>
                <div className="invoice-layout2-invoice invoice-layout2-body">
                    <div className="invoice-layout2-meta">
                      <div className="meta-item">
                        <span className="meta-label">Invoice #:</span>
                        <span className="meta-value">{invoice.number}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Date:</span>
                        <span className="meta-value">{invoice.date}</span>
                      </div>
                    </div>

                    <section className="invoice-layout2-client">
                        <p><strong>Billed To:</strong></p>
                        <p>{invoice.client.name}</p>
                        <p>{invoice.client.email}</p>
                        {invoice.client?.phone && <p>{invoice.client.phone}</p>}
                        {invoice.client?.address && <p>{invoice.client.address}</p>}
                    </section>

                    <table>
                        <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoice.items.map((item, i) => (
                            <tr key={i}>
                                <td>{item.description}</td>
                                <td>{item.qty}</td>
                                <td>${item.price.toFixed(2)}</td>
                                <td>${(item.qty * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="invoice-layout2-totals">
                        <p>Subtotal: ${subtotal.toFixed(2)}</p>
                        <p>Tax (10%): ${tax.toFixed(2)}</p>
                        <h3>Total: ${total.toFixed(2)}</h3>
                    </div>
                </div>
                <footer className="invoice-layout2-print-footer">
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <span>{activeCompany?.email || ""}</span>
                      <span>{activeCompany?.address || ""}</span>
                      <span>{activeCompany?.phone || ""}</span>
                      <span>{activeCompany?.web_site || ""}</span>
                    </div>
                </footer>
                <div className="invoice-layout2-actions">
                    {/*<button onClick={() => window.print()}>Print</button>*/}
                    <button onClick={downloadPDF} className="btn btn-secondary btn-sm">Download PDF</button>
                    <span>admin@malinstay.com</span>
                    <span>Ras Al Khor,Smark 2, Office 98</span>
                    <span>+971 55 125 8910</span>
                    <span>malinstay.com</span>
                </div>
            </div>

        </>
    );
};

export default GlobalInvoiceLayout2;
