// Text table for the XkgaInfographic scene (reference 37.1–75.5 s).
// Values = column «MỚI» of ra-chu-tren-hinh-58-khoa_v01.md (md5 9278ddec).
// Line breaks inside a value are rendered as line breaks ("\n").
// Keys marked BỎ in that table are removed here and their elements are removed from the scene:
//   step7, step8, badgeNo, diagBeforeDesc, diagBeforeZone, diagBeforeNote,
//   diagAfterDesc, diagAfterZone, diagAfterNote, warnNote.
export const T_INFO = {
  agency1Name: "APQA",
  agency1Desc: "Cơ quan Kiểm dịch\nĐộng, Thực vật Hàn Quốc",
  agency2Name: "MFDS",
  agency2Desc: "Bộ An toàn Thực phẩm\nvà Dược phẩm Hàn Quốc",
  dateRange: "Tháng 7 đến\ntháng 12/2025",
  inspectBar: "ĐOÀN LIÊN NGÀNH HÀN QUỐC\nKIỂM TRA THỰC ĐỊA TOÀN CHUỖI",
  stepsLabel: "CÁC KHÂU HAI BỘ CÂU HỎI BAO QUÁT",
  // Tile grid: one tile per item (table keys step1..step6). Count is data-driven: ≤6 -> 3 columns, 7–8 -> 4.
  steps: [
    "Vùng\nchăn nuôi", // step1
    "Tình hình\ndịch bệnh", // step2
    "Kiểm tra trước &\nsau giết mổ", // step3
    "Chế biến", // step4
    "Xử lý nhiệt", // step5
    "Đóng gói &\nvận chuyển", // step6
  ],
  badgeOk: "ĐẠT 100% TIÊU CHÍ\nTRONG MỌI KHÂU",
  heatTitle: "XỬ LÝ NHIỆT",
  heatSub: "TIÊU CHUẨN BẮT BUỘC",
  heatTempValue: ">80°C",
  heatTempLabel: "NHIỆT ĐỘ TÂM SẢN PHẨM",
  heatTimeValue: "≥ 1 PHÚT",
  heatTimeLabel: "THỜI GIAN TỐI THIỂU",
  heatSepValue: "TÁCH BIỆT",
  heatSepLabel: "BỐ TRÍ RIÊNG",
  diagTitle: "QUY TRÌNH XỬ LÝ NHIỆT",
  diagBefore: "TRƯỚC XỬ LÝ NHIỆT",
  diagAfter: "SAU XỬ LÝ NHIỆT",
  // Table value «TÂM SP > 80°C»; «TÂM SẢN PHẨM» used as the coordinator asked (it fits).
  diagOvenSpec: "TÂM SẢN PHẨM > 80°C\n≥ 1 PHÚT",
  noCrossTitle: "KHU VỰC TÁCH BIỆT",
  noCrossSub: "LỐI VÀO VÀ PHÒNG THAY ĐỒ BỐ TRÍ RIÊNG",
  warnTop: "TRƯỚC VÀ SAU XỬ LÝ NHIỆT",
  warnMain: "BẮT BUỘC PHẢI TÁCH BIỆT",
} as const;

export type InfoKey = keyof typeof T_INFO;
