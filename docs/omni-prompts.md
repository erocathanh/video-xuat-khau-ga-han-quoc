# Đề vẽ các cảnh quay của video (ChatCut Omni + Codex)

Nguyên văn đề, đọc lại từ hồ sơ sinh của từng tệp trong dự án ChatCut (đọc ngày 09/10/2026). Đây là đề THẬT đã dùng, không phải tóm tắt.

Máy: ChatCut Omni, mô hình `gemini-omni-1.1-flash-preview`, khổ dọc 9:16.

## Sáu cảnh minh hoạ (b-roll) — 720p, 6 giây, đề tiếng Anh

| tệp | đề |
|---|---|
| `le-1-san-khau.mp4` | Vertical shot of a corporate export launch ceremony in a large hall in Vietnam: a stage with a big blank LED screen glowing red and gold, colourful confetti falling, a row of people in business suits seen from behind and at a distance, clapping, an audience in the foreground slightly out of focus. No readable text, no logos, no recognisable faces. Photorealistic, festive warm light. |
| `le-2-cat-bang.mp4` | Vertical close-up of a ribbon-cutting moment at a festive business event: golden scissors cut a wide red satin ribbon with a big red flower bow, confetti drifting down, warm red and gold stage lights softly blurred behind. Only hands and the ribbon in frame. No text, no logos. Photorealistic, shallow depth of field, slow motion. |
| `nha-may-1-day-chuyen.mp4` | Vertical documentary shot inside a modern, very clean poultry processing plant. Long stainless-steel overhead conveyor line carrying rows of plucked whole raw chickens on shackles, moving smoothly through the frame. Bright white industrial lighting, food-safety hygiene, light steam. Slow camera push along the line. No people's faces, no logos, no text, no brand marks. Photorealistic, natural colour, shallow depth of field. |
| `nha-may-2-cong-nhan.mp4` | Vertical documentary close shot in a food factory: workers in full white hygiene suits, hairnets, face masks and blue gloves inspecting and trimming raw chicken pieces on a stainless-steel table, quick careful hand movements. Faces covered by masks, not recognisable. Bright clean white light. No logos, no text. Photorealistic, natural colour, gentle handheld camera. |
| `cang-1-tren-cao.mp4` | Vertical aerial drone shot slowly flying over a busy river container port in southern Vietnam on a sunny day: stacks of colourful shipping containers, gantry cranes, a large container ship moored at the quay, small boats on the brown river, green tropical land in the distance. No readable text or company logos on containers or ship. Photorealistic, cinematic, natural colour. |
| `cang-2-container-lanh.mp4` | Vertical shot at a container terminal: a gantry crane lifts a white refrigerated reefer container and lowers it onto a ship deck, cables tight, port workers in hi-vis vests small in the background. Clear daylight. No readable text, numbers or logos on containers. Photorealistic, cinematic, slow upward tilt. |

## Ba cảnh người dẫn — 1080p, ảnh đầu khung là `xkga/codex-mat/nguoi-dan-thanh-v01.png`

| tệp | dài | đề |
|---|---|---|
| `thanh-clip-1.mp4` | 6 giây | The man at the desk looks straight into the camera and speaks clearly in Vietnamese, calm, confident, warm male voice, natural lip movement and small hand gestures, exactly this sentence: «Khó nhất không phải lúc giao hàng, mà là quy trình phải viết ra, thay vì để kẹt trong đầu.» Static camera, same podcast studio, soft warm light. No text, no subtitles, no music. |
| `thanh-clip-2-1-A.mp4` | 5 giây | The man at the desk looks straight into the camera and speaks clearly in Vietnamese, calm, confident, warm male voice, natural lip movement, a small open-hand gesture, exactly this sentence: «Để đưa quy trình ra khỏi đầu, và để ây ai cùng gánh,» Static camera, same podcast studio, soft warm light. No text, no subtitles, no music. |
| `thanh-clip-2-2-A.mp4` | 5 giây | The man at the desk looks straight into the camera, smiles warmly and speaks clearly in Vietnamese, inviting tone, warm male voice, natural lip movement, points gently toward the camera at the end, exactly this sentence: «hãy bấm vào link, học miễn phí ngày 15 và 16 tháng 10 cùng Thanh.» Static camera, same podcast studio, soft warm light. No text, no subtitles, no music. |

Ghi chú: «ây ai» là cách viết để máy đọc phát âm đúng chữ «AI»; chữ trên hình vẫn viết «AI».

## Ảnh đầu khung người dẫn — Codex CLI (`gpt-6-astra`, công cụ vẽ ảnh, 0 credit ChatCut)

Ảnh tham chiếu mặt: `xkga/codex-mat/mat-owner-tham-chieu.jpeg`. Kết quả: `xkga/codex-mat/nguoi-dan-thanh-v01.png`. Đề:

> Vẽ MỘT ảnh siêu thực khổ dọc 1080x1920, lưu thành tệp nguoi-dan-thanh-v01.png trong thư mục hiện tại. Người trong ảnh là đúng người trong ảnh tham chiếu mat-owner-tham-chieu.jpeg (giữ khuôn mặt, kiểu tóc, nét mặt; LẤY LÀM THAM CHIẾU MẶT). Bối cảnh giống một phòng quay podcast: người đàn ông ngồi sau một chiếc bàn tối màu, nhìn thẳng ống kính, miệng hơi mở như đang nói, hai tay đặt nhẹ trên bàn; một micro podcast màu đen đứng bên phải khung hình gần mặt bàn; một chậu cây xanh nhỏ ở góc phải dưới; vài cuốn sách xếp mờ ở góc trái dưới; nền tối nâu ấm có một vệt sáng tròn mềm phía sau đầu. Áo sơ mi tối màu lịch sự. Ánh sáng studio mềm, độ sâu trường ảnh nông. Người ở khoảng giữa khung, đầu ở khoảng 1/3 phía trên. KHÔNG có chữ, KHÔNG logo, KHÔNG phụ đề.

## Tệp xuất thô

- `xkga/omni/omni-6-canh-v01.mp4` — sáu cảnh minh hoạ nối liền, xuất từ ChatCut để xem duyệt.
- `xkga/omni/nguoi-dan-3-clip-v01.mp4` — ba cảnh người dẫn nối liền.
- `xkga/omni/soi.jpg`, `soi-nguoi-dan.jpg` — tấm soi (mỗi cảnh vài khung) dùng lúc duyệt.
