import React, { forwardRef } from "react";
import "./ReceiptDocument.css";
import { getMediaUrl, handleImageError } from "../../utils/mediaUrl";

// Helper for Indian English number to words if not passed
const numberToWordsIndian = (num) => {
  const n = Math.floor(Number(num));
  if (isNaN(n) || n <= 0) return "";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (number) => {
    if (number === 0) return "";
    let str = "";
    if (Math.floor(number / 10000000) > 0) {
      str += inWords(Math.floor(number / 10000000)) + " Crore ";
      number %= 10000000;
    }
    if (Math.floor(number / 100000) > 0) {
      str += inWords(Math.floor(number / 100000)) + " Lakh ";
      number %= 100000;
    }
    if (Math.floor(number / 1000) > 0) {
      str += inWords(Math.floor(number / 1000)) + " Thousand ";
      number %= 1000;
    }
    if (Math.floor(number / 100) > 0) {
      str += inWords(Math.floor(number / 100)) + " Hundred ";
      number %= 100;
    }
    if (number > 0) {
      if (number < 20) {
        str += a[number] + " ";
      } else {
        str += b[Math.floor(number / 10)] + " " + a[number % 10] + " ";
      }
    }
    return str.trim();
  };

  return `${inWords(n)} Rupees Only`;
};

const ReceiptDocument = forwardRef(({ receipt, config, sachivSignatureUrl, forPrint = false, className = "" }, ref) => {
  if (!receipt) return null;

  const signatureSrc = receipt.sachivSignatureUrl || sachivSignatureUrl || "";
  const formattedAmount = Number(receipt.amount || 0).toLocaleString("en-IN");
  const words = receipt.amountInWords || numberToWordsIndian(receipt.amount);

  const societyNameMr = receipt.societyNameMr || config?.mandalNameMr || "म्हाडा टॉवर्स उत्सव मंडळ";
  const societyNameEn = receipt.societyNameEn || config?.mandalNameEn || "MHADA Towers Utsav Mandal";
  const regNo = receipt.regNo || config?.regNo || "१२४३/२०२५ - पुणे";
  const addressMr = receipt.addressMr || config?.addressMr || "पिंपरी वाघेरे, पिंपरी चिंचवड, पुणे - ४११०१७";

  return (
    <div
      ref={ref}
      className={`receipt-document-wrapper ${forPrint ? "for-print" : ""} ${className}`}
      style={{ boxSizing: "border-box" }}
    >
      <div className="receipt-voucher-card">
        <div className="receipt-inner-border">
          
          {/* 1. Society Header with Mandal Logo */}
          <div className="receipt-header-row">
            <div className="receipt-logo-box">
              <img
                src={getMediaUrl("/logo.jpg")}
                alt="Mandal Official Logo"
                className="receipt-logo-img"
                onError={handleImageError}
              />
            </div>
            
            <div className="receipt-header-info">
              <div className="receipt-shree-ganesh">॥ श्री गणेशाय नमः ॥</div>
              <h1 className="receipt-mandal-name-mr">{societyNameMr}</h1>
              <h2 className="receipt-mandal-name-en">{societyNameEn}</h2>
              <p className="receipt-address">{addressMr}</p>
              <p className="receipt-reg-no">धर्मादाय नोंदणी क्र. {regNo}</p>
            </div>
          </div>

          {/* 2. Official Receipt Title Badge */}
          <div className="receipt-badge-center">
            <span className="receipt-badge-pill">
              पावती / OFFICIAL RECEIPT
            </span>
          </div>

          {/* 3. Metadata Row: Receipt Number & Date */}
          <div className="receipt-meta-box">
            <div>
              <span>पावती पुस्तक क्रमांक / Receipt No: </span>
              <span className="receipt-meta-value">{receipt.receiptNo}</span>
            </div>
            <div>
              <span>दिनांक / Date: </span>
              <span className="receipt-meta-value">{receipt.paymentDate}</span>
            </div>
          </div>

          {/* 4. Resident Details (Stable Table/Flex Structure with Underlines) */}
          <div className="receipt-details-section">
            {/* Resident Name */}
            <div className="receipt-field-row">
              <span className="receipt-field-label">
                श्री / श्रीमती / M/s (Received From):
              </span>
              <span className="receipt-field-value-underline receipt-field-resident-name">
                {receipt.residentName}
              </span>
            </div>

            {/* Flat No & Building (2-column grid) */}
            <div className="receipt-grid-two-col">
              <div className="receipt-field-row">
                <span className="receipt-field-label">फ्लॅट क्र. / Flat No:</span>
                <span className="receipt-field-value-underline" style={{ fontFamily: "monospace", color: "#5B0914" }}>
                  {receipt.flatNo}
                </span>
              </div>
              <div className="receipt-field-row">
                <span className="receipt-field-label">इमारत / Building:</span>
                <span className="receipt-field-value-underline" style={{ color: "#5B0914" }}>
                  {receipt.building}
                </span>
              </div>
            </div>

            {/* Purpose */}
            <div className="receipt-field-row">
              <span className="receipt-field-label">
                कारणास्तव / On Account Of (Purpose):
              </span>
              <span className="receipt-field-value-underline" style={{ color: "#2D060B" }}>
                {receipt.purpose}
              </span>
            </div>

            {/* Payment Mode & Transaction Reference (2-column grid) */}
            <div className="receipt-grid-two-col">
              <div className="receipt-field-row">
                <span className="receipt-field-label">पेमेंट पद्धत / Mode:</span>
                <span className="receipt-field-value-underline" style={{ fontWeight: 800 }}>
                  {receipt.paymentMode || "UPI"}
                </span>
              </div>
              <div className="receipt-field-row">
                <span className="receipt-field-label">धनादेश / संदर्भ क्र. / Txn Ref:</span>
                <span className="receipt-field-value-underline" style={{ fontFamily: "monospace" }}>
                  {receipt.transactionRef || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Amount Received & In Words Box */}
          <div className="receipt-amount-container">
            <div>
              <span className="receipt-amount-label">प्राप्त रक्कम / Amount Received:</span>
              <span className="receipt-amount-number">₹ {formattedAmount}/-</span>
            </div>
            <div className="receipt-amount-words-box">
              <span className="receipt-amount-words-label">रक्कम अक्षरी / In Words:</span>
              <span className="receipt-amount-words-text">{words}</span>
            </div>
          </div>

          {/* 6. Description Note (if entered) */}
          {receipt.description ? (
            <div className="receipt-description-box">
              "{receipt.description}"
            </div>
          ) : null}

          {/* 7. Footer: Official Notes & Digital Signature */}
          <div className="receipt-footer-row">
            <div className="receipt-footer-notes">
              <p style={{ fontWeight: 800, color: "#44403C" }}>नोंद / Notes & Conditions:</p>
              <p>• ही अधिकृत संगणकीय पावती आहे.</p>
              <p>• धनादेश / ऑनलाइन ट्रान्सफर रकमेच्या वटण्यावर आधारित.</p>
              <p>• मंडळाच्या सर्व उपक्रमात सहकार्य केल्याबद्दल सस्नेह धन्यवाद.</p>
            </div>

            {/* Digital Signature */}
            <div className="receipt-signature-box">
              <div className="receipt-signature-img-area">
                {signatureSrc ? (
                  <img
                    src={getMediaUrl(signatureSrc)}
                    alt="Digital Signature"
                    className="receipt-signature-img"
                    onError={handleImageError}
                  />
                ) : (
                  <span className="receipt-signature-placeholder">
                    (स्वाक्षरी / Signature)
                  </span>
                )}
              </div>
              <div className="receipt-signature-line">
                <span className="receipt-signatory-title-mr">
                  सचिव / अधिकृत स्वाक्षरी
                </span>
                <span className="receipt-signatory-title-en">
                  Authorized Signatory
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

ReceiptDocument.displayName = "ReceiptDocument";

export default ReceiptDocument;
