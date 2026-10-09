// Text table for the XkgaVi assembly (rows of ra-loi-doc-video-ga-han-quoc_v02.md, section 2).
// overlay  = the row's «chữ trên hình» column, one array item per <br> line (verbatim).
// captions = the row's «lời đọc» split at « / », emphasis stars removed; «ây ai» (TTS spelling)
//            shown as «AI» per the script's own rule (chữ trên hình giữ «AI»).
// Swap values here; XkgaVi reads nothing else for these rows.
export const T_ROWS = {
  aiLabel: "HÌNH MINH HOẠ DO AI TẠO",
  overlay: {
    2: ["25/08/2026", "XUẤT KHẨU LÔ ĐẦU TIÊN", "SANG HÀN QUỐC"],
    3: ["22/04/2026", "CHÍNH THỨC MỞ CỬA", "GIAI ĐOẠN ĐẦU: MỖI NƯỚC 2 DOANH NGHIỆP"],
    8: ["QUY TRÌNH CHUẨN HOÁ", "CONTAINER RỜI CẢNG"],
    10: ["THÀNH CÔNG ĐẾN TỪ", "CHUỖI QUY TRÌNH BÀI BẢN"],
  } as Record<number, string[]>,
  captions: {
    7: ["Khó nhất", "không phải lúc giao hàng,", "mà là quy trình", "phải viết ra", "thay vì để kẹt", "trong đầu."],
    11: ["Để đưa quy trình ra khỏi đầu", "và để AI cùng gánh,"],
    12: ["hãy bấm vào link", "học miễn phí", "ngày 15 và 16 tháng 10 cùng Thanh."],
  } as Record<number, string[]>,
};
