# Video dọc «Xuất thịt gà chế biến sang Hàn Quốc»

Video dọc 1080×1920, 30 khung/giây, dài **130,2 giây** (3.906 khung; tiếng dài 130,26 giây), kể chuyện lô thịt gà chế biến đầu tiên của Việt Nam xuất sang Hàn Quốc: hai bộ câu hỏi mỗi bộ khoảng 1.000 trang, quy trình đánh giá 8 bước của APQA và MFDS, yêu cầu xử lý nhiệt, rồi tám thị trường. Cuối video là ba câu của người dẫn mời học buổi miễn phí 15 và 16/10.

Video dựng bằng **Remotion 4** (React). Mọi thứ cần để dựng lại đều nằm sẵn trong kho này: lời đọc đã thu, nhạc nền, các cảnh quay, ảnh vệ tinh, phông chữ. **Không cần khoá API nào** để dựng lại video.

## Cài trên máy mới (một lệnh)

```bash
git clone https://github.com/erocathanh/video-xuat-khau-ga-han-quoc.git video-xuat-khau-ga-han-quoc && cd video-xuat-khau-ga-han-quoc && ./install.sh
```

`install.sh` chạy lại bao nhiêu lần cũng được:
1. kiểm `node` (bản 18 trở lên), `ffmpeg`, `python3`; thiếu cái nào thì in ra lệnh `brew install …` và **hỏi y/N** trước khi cài (`--yes` để tự đồng ý, `--skip-brew` để không đụng Homebrew);
2. `npm ci`;
3. `pip3 install --user numpy pillow` nếu chưa có (chỉ cần khi dựng lại tiếng hoặc bản đồ);
4. dựng thử một khung hình ra `out/smoke-test.png`, in `INSTALL-OK` nếu được.

## Dựng video

```bash
npm run render          # ra out/xuat-khau-ga-han-quoc.mp4 (khoảng vài phút)
npm run studio          # mở Remotion Studio để xem và chỉnh trực tiếp
npm run still           # một khung hình ra out/still.png
npm run typecheck       # kiểm kiểu TypeScript
```
Xem nhanh bản nhỏ: `npx remotion render src/index.ts XkgaVi out/nho.mp4 --scale=0.25`.

## Bản đã chốt

Kho này dựng ra đúng bản **v02**: so với v01 chỉ sửa hai nhãn chữ, hàng 3 thành «GIAI ĐOẠN ĐẦU: MỖI NƯỚC 2 DOANH NGHIỆP» và ghim Việt Nam thành «NƠI XUẤT PHÁT». Video thành phẩm không nằm trong kho vì quá nặng; chạy `npm run render` là ra.

## Bản đồ thư mục

| đường | là gì |
|---|---|
| `src/index.ts`, `src/Root.tsx` | đăng ký composition. `XkgaVi` = cả video; `XkgaInfographic`, `XkgaMapIntro`, `XkgaMapMarkets` = từng cảnh để xem riêng |
| `src/xkga/XkgaVi.tsx` | ráp 12 hàng lời đọc thành video: chọn cảnh, nối mờ, phụ đề, tiếng |
| `src/xkga/texts.ts`, `texts-info.ts`, `texts-rows.ts` | **mọi chữ hiện trên hình** (bản đồ · đồ hoạ · phụ đề và chữ từng hàng) |
| `src/xkga/timeline.ts` | mốc giờ từng hàng — **do máy sinh**, đừng sửa tay |
| `src/xkga/MapIntro.tsx`, `MapMarkets.tsx`, `SatMap.tsx` | cảnh bản đồ vệ tinh (Việt Nam có Hoàng Sa, Trường Sa) |
| `src/xkga/infographic.tsx` | cảnh đồ hoạ: hai cơ quan, 6 khâu, xử lý nhiệt |
| `src/xkga/common.tsx`, `font.ts` | bộ màu/hiệu ứng chung; nạp phông Be Vietnam Pro từ tệp trong kho |
| `src/xkga/data/countries.ts` | đường biên các nước (Natural Earth), do `scripts/extract_countries.py` sinh |
| `xkga/tts/` | lời đọc: `lines.tsv` (chữ từng hàng), `rows.json` (12 hàng), `trim-NN.wav` (lời đã cắt lặng, dùng để dựng), `loi-canh-NN.mp3` (bản thu gốc) |
| `xkga/omni/` | cảnh quay ChatCut Omni: 6 cảnh minh hoạ + 3 cảnh người dẫn + hai tệp xuất thô + tấm soi |
| `xkga/codex-mat/` | ảnh đầu khung người dẫn (`nguoi-dan-thanh-v01.png`) và ảnh tham chiếu mặt |
| `xkga/build_timeline.py` | dựng lại `timeline.json`, `src/xkga/timeline.ts`, `public/xkga/voice-mix.wav`, `music-bed.wav`, chép cảnh vào `public/xkga/media/` |
| `xkga/make_music_xkga.py` | tự tổng hợp nhạc nền (numpy, 0 đồng) |
| `xkga/chu-tren-hinh-can-viet.md` | bảng khoá chữ đã điền (lưu lịch sử) |
| `public/xkga/` | thứ Remotion đọc khi dựng: ảnh vệ tinh, tiếng đã trộn, nhạc nền, `media/` |
| `scripts/` | `extract_countries.py` (đường biên), `make_bluemarble_crop.py` (ảnh vệ tinh Đông Á) |
| `assets/fonts/` | Be Vietnam Pro TTF + `OFL.txt` |
| `docs/` | lời đọc v02, bảng chữ trên hình 58 khoá, phiếu kiểm chứng dữ kiện, đề vẽ các cảnh |
| `out/` | nơi ra video (không lưu vào git) |

## Sửa video

**Sửa chữ trên hình:** sửa trong `src/xkga/texts.ts`, `texts-info.ts`, `texts-rows.ts`, rồi `npm run studio` để xem. Chữ phải khớp `docs/ra-chu-tren-hinh-58-khoa_v01.md` và dữ kiện có nguồn ở `docs/kiem-chung-video-ga-han-quoc-20261009.json`; sửa dữ kiện thì sửa tài liệu trước.

**Sửa lời đọc:**
1. thay `xkga/tts/trim-NN.wav` của hàng cần đổi (giữ tên tệp; lời đã cắt lặng hai đầu), sửa chữ tương ứng trong `xkga/tts/lines.tsv`, `rows.json` và `src/xkga/texts-rows.ts`;
2. chạy `python3 xkga/build_timeline.py` — tính lại độ dài từng hàng, trộn lại tiếng (−16 LUFS), sinh lại nhạc nền, ghi lại `src/xkga/timeline.ts`;
3. `npm run render`.
Lời của người dẫn (hàng 7, 11, 12) nằm sẵn trong cảnh quay, đổi lời là phải quay lại cảnh (xem «Cảnh quay làm thế nào» dưới).

**Đổi các nước trên bản đồ:** sửa danh sách `KEEP` trong `scripts/extract_countries.py`, rồi
```bash
curl -sSL -o /tmp/ne50.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
python3 scripts/extract_countries.py /tmp/ne50.geojson src/xkga/data/countries.ts
```
rồi sửa chỗ dùng nước đó trong `MapMarkets.tsx` / `texts.ts`. **Việt Nam luôn phải có Hoàng Sa và Trường Sa** (đã vẽ trong `SatMap.tsx`).

## Cảnh quay làm thế nào

- **6 cảnh minh hoạ** (lễ công bố · cắt băng · dây chuyền · công nhân · cảng từ trên cao · cẩu container lạnh): ChatCut Omni, `gemini-omni-1.1-flash-preview`, 720p, 6 giây, khổ 9:16.
- **3 cảnh người dẫn**: ảnh đầu khung vẽ bằng Codex CLI từ ảnh tham chiếu mặt, rồi ChatCut Omni 1080p (6 + 5 + 5 giây) nói đúng câu ghi trong đề.
- Đề nguyên văn từng cảnh: `docs/omni-prompts.md`.
- **Chi phí ước:** khoảng **40 credit ChatCut** cho 9 cảnh (ước tính, chưa đối chiếu hoá đơn). Ảnh Codex, lời đọc dựng sẵn và nhạc nền tự tổng hợp: 0 credit ChatCut.

## Nguồn dữ liệu và giấy phép

| thứ | nguồn | giấy phép |
|---|---|---|
| ảnh vệ tinh `public/xkga/bluemarble*.jpg` | NASA Blue Marble (bản 2004) | công cộng (public domain) |
| đường biên các nước | Natural Earth 1:50m | công cộng (public domain) |
| phông Be Vietnam Pro | The Be Vietnam Pro Project Authors | SIL Open Font License 1.1 — `assets/fonts/OFL.txt` |
| dữ kiện trong lời đọc | các nguồn báo ghi trong `docs/kiem-chung-video-ga-han-quoc-20261009.json` | trích dẫn |
| cảnh quay, ảnh người dẫn | do AI tạo (ChatCut Omni, Codex) cho dự án này | chỉ dùng để học với kho này |

Kho mở công khai để học viên tải về học và sửa thành video của mình. Mã nguồn chưa gắn giấy phép mở (`UNLICENSED`). Ảnh và cảnh quay có mặt người dẫn (Eroca Thanh): không dùng lại vào video khác; muốn có người dẫn của mình thì thay bằng ảnh và cảnh của bạn.

## Claude Code làm gì khi mở kho này

Mở `claude` trong thư mục kho: Claude Code tự đọc `CLAUDE.md` (luật dựng và sửa). Câu gợi ý:
- «Dựng lại video» → chạy `./install.sh` nếu chưa có `node_modules`, rồi `npm run render`, báo đường dẫn và độ dài.
- «Đổi chữ ô X thành …» → sửa đúng khoá trong `src/xkga/texts*.ts`, dựng một khung hình để soi.
- «Thay lời hàng N» → thay `trim-NN.wav`, chạy `python3 xkga/build_timeline.py`, dựng lại.
Claude Code sẽ không tự bịa dữ kiện: chữ và lời chỉ lấy từ `docs/`.
