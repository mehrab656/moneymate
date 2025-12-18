import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const GlobalInvoiceLayout2 = ({ invoice }) => {
    const invoiceRef = useRef();

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
            <div ref={invoiceRef}>
                <header className="invoice-layout2-header">
                    <h1>Malinstay Homes Rental LLC</h1><br/>
                    <h6>Your Comfort is Our Priority</h6>
                    <div>
                        <p><strong>Invoice #:</strong> {invoice.number}</p>
                        <p><strong>Date:</strong> {invoice.date}</p>
                    </div>
                </header>
                <div  className="invoice-layout2-invoice">

                    <section className="invoice-layout2-client">
                        <p><strong>Billed To:</strong></p>
                        <p>{invoice.client.name}</p>
                        <p>{invoice.client.email}</p>
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
                <div className="invoice-layout2-actions">
                    {/*<button onClick={() => window.print()}>Print</button>*/}
                    <button onClick={downloadPDF}>Download PDF</button>
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
