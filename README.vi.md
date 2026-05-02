<sub><a href="README.en.md">English</a> · <b>🌐 Tiếng Việt</b> · <a href="README.md">中文</a></sub>

<div align="center">

# Huashu Design

> *"Gõ một câu. Nhấn enter. Một bản thiết kế có thể đem đi bàn giao rơi ngay vào tay bạn."*
> *「打字。回车。一份能交付的设计。」*

[![License](https://img.shields.io/badge/License-Personal%20Use%20Only-orange.svg)](LICENSE)
[![Agent-Agnostic](https://img.shields.io/badge/Agent-Agnostic-blueviolet)](https://skills.sh)
[![Skills](https://img.shields.io/badge/skills.sh-Compatible-green)](https://skills.sh)

<br>

**Chỉ cần nói một câu với agent của bạn — Claude Code, Cursor, Codex, OpenClaw, Hermes đều dùng được.**

<br>

Chỉ trong 3 đến 30 phút, bạn có thể ship một **animation ra mắt sản phẩm**, một prototype app có thể bấm được, một bộ slide PPT có thể chỉnh sửa, hoặc một infographic đạt chất lượng in ấn.

Không phải kiểu “AI làm vậy là ổn rồi” — mà là thứ trông như được một team thiết kế thật sự làm ra. Nếu bạn đưa cho skill bộ nhận diện thương hiệu của mình (logo, bảng màu, ảnh chụp UI), nó sẽ đọc được chất thương hiệu; nếu bạn không có gì cả, 20 hệ triết lý thiết kế tích hợp sẵn vẫn đủ để kéo kết quả ra khỏi vùng AI slop.

**Mọi animation trong README này đều do chính huashu-design tạo ra.** Không cần Figma, không cần After Effects — chỉ cần một câu prompt + chạy skill. Lần tới nếu bạn cần video promo cho đợt ra mắt sản phẩm, giờ bạn cũng làm được.

```
npx skills add alchaincyf/huashu-design
```

[Xem demo](#demo-gallery) · [Cài đặt](#cài-đặt) · [Làm được gì](#làm-được-gì) · [Cách hoạt động](#cơ-chế-cốt-lõi) · [So với Claude Design](#so-với-claude-design)

> 📖 **Lưu ý cho người đọc tiếng Việt**: skill này được xây dựng bởi một tác giả nói tiếng Trung. Prompt cho agent (`SKILL.md`, `references/*.md`) hiện vẫn là tiếng Trung, nhưng agent có thể xử lý tốt các yêu cầu bằng tiếng Anh và tiếng Việt. Các demo bên dưới là bản song song cho tiếng Anh/tiếng Việt; bản tiếng Trung nằm ở các tệp tên mặc định (xem [README.md](README.md)).

</div>

---

<p align="center">
  <video src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.mp4" autoplay muted loop playsinline width="100%">
    Trình duyệt của bạn không hỗ trợ phát video inline. <a href="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.mp4">Tải MP4</a>.
  </video>
</p>

<p align="center"><sub>▲ Hero animation dài 10 giây cho thấy huashu-design làm được gì (<a href="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.mp4">tải MP4</a> nếu autoplay không hoạt động)</sub></p>

---

## Cài đặt

```bash
npx skills add alchaincyf/huashu-design
```

Sau đó chỉ cần nói chuyện với Claude Code:

```
"Làm cho tôi một bộ keynote về AI psychology. Đưa ra 3 hướng phong cách để tôi chọn."
"Tạo một prototype iOS cho app Pomodoro — 4 màn hình, bấm được thật."
"Biến logic này thành animation dài 60 giây. Xuất MP4 và GIF."
"Làm một expert review 5 chiều cho thiết kế này."
```

Không cần nút bấm, không cần panel, không cần plugin Figma. Bất khả tri nền tảng agent — dùng được với Claude Code, Cursor, Trae, Hermes, OpenClaw, hoặc bất kỳ agent nào hỗ trợ markdown skill.

---

## Làm được gì

| Năng lực | Đầu ra | Thời gian thường gặp |
|---|---|---|
| Nguyên mẫu tương tác (App / Web) | HTML một file · khung iPhone thật · có thể bấm · được Playwright xác minh | 10–15 phút |
| Bộ slide | HTML deck (trình chiếu trong trình duyệt) + PPTX có thể chỉnh sửa (giữ nguyên text frame) | 15–25 phút |
| Motion design | MP4 (25fps / nội suy 60fps) + GIF (tối ưu palette) + BGM | 8–12 phút |
| Biến thể thiết kế | 3+ phương án đặt cạnh nhau · Tweaks thay đổi tham số trực tiếp · khám phá nhiều chiều | 10 phút |
| Infographic / data viz | Typography chất lượng in ấn · xuất PDF/PNG/SVG | 10 phút |
| Cố vấn định hướng thiết kế | 5 trường phái × 20 triết lý · gợi ý 3 hướng · tạo demo song song | 5 phút |
| Đánh giá chuyên gia 5 chiều | Biểu đồ radar + Keep/Fix/Quick Wins · danh sách hành động cụ thể | 3 phút |

---

## Thư viện demo

> Đây là các phiên bản demo song song cho tiếng Việt. Bản tiếng Trung nằm ở các tệp tên mặc định (xem README tiếng Trung).

### Cố vấn định hướng thiết kế

Đây là cơ chế fallback cho những brief còn mơ hồ: chọn ra 3 hướng thật sự khác biệt từ 5 trường phái × 20 triết lý thiết kế, tạo song song cả 3 demo, rồi để người dùng chọn.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w3-fallback-advisor-en.gif" width="100%"></p>

### Prototype ứng dụng iOS

Khung iPhone 15 Pro chính xác từng pixel (Dynamic Island / status bar / Home Indicator) · điều hướng nhiều màn hình theo state · ảnh thật lấy từ Wikimedia/Met/Unsplash · chạy Playwright click test trước khi bàn giao.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c1-ios-prototype-en.gif" width="100%"></p>

### Engine motion design

Mô hình timeline Stage + Sprite theo lát thời gian · `useTime` / `useSprite` / `interpolate` / `Easing` — bốn API đủ để bao phủ mọi nhu cầu animation · một lệnh để xuất MP4 / GIF / bản nội suy 60fps / thành phẩm có BGM.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c3-motion-design-en.gif" width="100%"></p>

### HTML Slides → PPTX có thể chỉnh sửa

HTML deck để trình chiếu trong trình duyệt · `html2pptx.js` đọc computed style của DOM và dịch từng phần tử sang object PowerPoint thật · file xuất ra là **text frame thật**, không phải ảnh chụp giả dạng slide.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c2-slides-pptx-en.gif" width="100%"></p>

### Tweaks · Chuyển biến thể trực tiếp

Màu sắc / typography / mật độ thông tin được tham số hóa · bật/tắt bằng side panel · hoàn toàn frontend + lưu bằng `localStorage` · refresh vẫn giữ nguyên.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c4-tweaks-en.gif" width="100%"></p>

### Infographic / trực quan hóa dữ liệu

Typography chất lượng tạp chí · chia cột chính xác bằng CSS Grid · chi tiết dàn chữ với `text-wrap: pretty` · chạy trên dữ liệu thật · xuất PDF vector / PNG 300dpi / SVG.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c5-infographic-en.gif" width="100%"></p>

### Expert Critique 5 chiều

Tính nhất quán triết lý · thứ bậc thị giác · độ chỉn chu trong thực thi · tính chức năng · mức độ đổi mới — mỗi trục chấm 0–10 · hiển thị bằng radar chart · xuất ra danh sách Keep / Fix / Quick Wins.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c6-expert-review-en.gif" width="100%"></p>

### Quy trình Junior Designer

Không cố gắng chơi “một phát ăn ngay”: bắt đầu bằng assumptions + placeholders + reasoning, cho người dùng xem sớm, rồi lặp tiếp. Sửa một hiểu nhầm ở giai đoạn đầu rẻ hơn gấp 100 lần so với sửa muộn.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w2-junior-designer-en.gif" width="100%"></p>

### Core Asset Protocol · quy trình cứng 5 bước

Bắt buộc khi tác vụ liên quan tới một thương hiệu cụ thể: hỏi → tìm → tải asset (3 đường fallback) → xác minh + trích xuất → viết `brand-spec.md` bao quát **logo, ảnh sản phẩm, ảnh chụp UI, màu sắc, font** — tức toàn bộ asset cần thiết, không chỉ màu.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w1-brand-protocol-en.gif" width="100%"></p>

---

## Cơ chế cốt lõi

### Core Asset Protocol

Đây là quy tắc cứng nhất trong skill. Khi tác vụ chạm vào một thương hiệu cụ thể (Stripe, Linear, Anthropic, DJI, công ty của bạn, v.v.), quy trình 5 bước sẽ được thực thi:

| Bước | Hành động | Mục đích |
|---|---|---|
| 1 · Hỏi | Checklist 6 loại asset: logo / ảnh sản phẩm / ảnh chụp UI / bảng màu / font / brand guideline | Tôn trọng những tài nguyên sẵn có |
| 2 · Tìm nguồn chính thức | `<brand>.com/brand` · `<brand>.com/press` · `brand.<brand>.com` · trang sản phẩm · launch film | Tìm asset có tính thẩm quyền |
| 3 · Tải theo loại asset | Logo (SVG → inline-SVG trong HTML → avatar mạng xã hội) · Ảnh sản phẩm (hero → press kit → frame từ video ra mắt → AI tạo từ ảnh tham chiếu) · UI (ảnh chụp App Store → frame từ video chính thức) | Ba đường fallback cho từng loại asset |
| 4 · Xác minh + trích xuất | Kiểm tra độ chuẩn của logo · độ phân giải ảnh sản phẩm · độ mới của UI · grep mã màu hex từ asset thật | **Không bao giờ đoán từ trí nhớ** |
| 5 · Cố định thành spec | Viết `brand-spec.md` với đường dẫn logo, ảnh sản phẩm, ảnh chụp UI, CSS variables cho màu/font | Kiến thức chưa được cố định sẽ bay mất |

**Thứ tự ưu tiên của asset** (theo rubric nội bộ của skill):

1. Logo — bắt buộc với mọi thương hiệu
2. Ảnh render sản phẩm — bắt buộc với sản phẩm vật lý
3. Ảnh chụp UI — bắt buộc với sản phẩm số
4. Giá trị màu — phụ trợ
5. Font — phụ trợ

Đã A/B test (v1 vs v2, mỗi bên 6 agent): **v2 giảm phương sai ổn định đi 5 lần**. Độ ổn định của chính độ ổn định — đó mới là moat thật sự.

### Cố vấn định hướng thiết kế (Fallback)

Được kích hoạt khi brief quá mơ hồ để triển khai:

- Không làm bừa theo直觉 chung chung — chuyển sang Fallback mode
- Đề xuất 3 hướng thật sự khác biệt từ 5 trường phái × 20 triết lý, mỗi hướng **thuộc một trường phái khác nhau**
- Mỗi hướng đi kèm tác phẩm tiêu biểu, từ khóa cảm quan, và nhà thiết kế đại diện
- Tạo 3 visual demo song song để người dùng chọn
- Sau khi chốt hướng, tiếp tục vào luồng Junior Designer chính

### Quy trình Junior Designer

Đây là chế độ làm việc mặc định cho mọi loại tác vụ:

- Gửi toàn bộ nhóm câu hỏi trong một lần, chờ có đủ câu trả lời rồi mới đi tiếp
- Viết assumptions + placeholders + reasoning comments trực tiếp vào HTML
- Cho người dùng xem sớm (kể cả mới chỉ là các khối màu xám)
- Điền nội dung thật → làm variations → thêm Tweaks — và cho xem ở từng giai đoạn đó
- Tự mở trình duyệt bằng Playwright để nhìn lại lần cuối trước khi bàn giao

### Xác minh sự thật trước (Nguyên tắc #0)

Đây là quy tắc ưu tiên cao nhất, được thêm vào sau một failure mode có thật: khi tác vụ nhắc tới một sản phẩm / công nghệ / sự kiện cụ thể (ví dụ: “DJI Pocket 4”, “Nano Banana Pro”, “Gemini 3 Pro”), hành động đầu tiên **phải** là `WebSearch` để xác minh sự tồn tại, trạng thái phát hành, phiên bản hiện tại và thông số. Không đưa ra khẳng định dựa trên trí nhớ từ tập dữ liệu huấn luyện. Chi phí cho một lần search: khoảng 10 giây. Chi phí cho một giả định sai: 1–2 giờ làm lại.

### Quy tắc chống AI-slop

Tránh rơi vào mẫu số chung thị giác của ảnh sinh bởi AI (gradient tím / icon emoji / card bo góc + viền trái nổi màu / SVG hình người / dùng Inter làm display / **CSS silhouette thay cho ảnh sản phẩm thật**). Thay vào đó, dùng `text-wrap: pretty` + CSS Grid + serif display được chọn kỹ + màu sắc oklch.

---

## So với Claude Design

Nói thẳng: triết lý của Core Asset Protocol được học từ những system prompt mà Anthropic viết cho Claude Design. Prompt đó nhấn mạnh đúng một điều — **thiết kế hi-fi tốt không bắt đầu từ một trang trắng; nó mọc ra từ design context đã tồn tại**. Một nguyên tắc đó thôi đã tạo ra khác biệt giữa thiết kế 65 điểm và 90 điểm.

Khác biệt về định vị:

| | Claude Design | huashu-design |
|---|---|---|
| Hình thái | Sản phẩm web (dùng trong trình duyệt) | Skill (dùng trong Claude Code) |
| Quota | Quota theo gói thuê bao | Tiêu hao API · chạy agent song song không bị khóa quota |
| Đầu ra | Canvas + xuất Figma | HTML / MP4 / GIF / PPTX có thể chỉnh sửa / PDF |
| Cách tương tác | GUI (bấm, kéo, sửa) | Hội thoại (nói với agent, chờ xong) |
| Animation phức tạp | Hạn chế | Timeline Stage + Sprite · xuất 60fps |
| Tương thích agent | Chỉ Claude.ai | Claude Code / Cursor / Trae / Hermes / OpenClaw |

Claude Design là một **graphics tool tốt hơn**. Huashu-design làm cho **lớp công cụ đồ họa biến mất**. Hai con đường, hai nhóm người dùng khác nhau.

---

## Giới hạn

- **Không có vòng lặp PPTX-to-Figma với layer còn chỉnh sửa được.** Đầu ra là HTML — có thể chụp màn hình, quay video, xuất ảnh — nhưng không kéo thả vào Keynote để chỉnh vị trí text.
- **Animation phức tạp ở mức Framer Motion nằm ngoài phạm vi.** 3D, mô phỏng vật lý, hệ hạt đều vượt khỏi biên của skill.
- **Chất lượng thiết kế thương hiệu từ số 0 sẽ rơi xuống khoảng 60–65 điểm.** Làm hi-fi từ hư không vốn luôn chỉ là phương án cuối cùng.

Đây là một skill 80 điểm, không phải một sản phẩm 100 điểm. Với những người không muốn mở giao diện đồ họa, một skill 80 điểm hữu dụng hơn một sản phẩm 100 điểm.

---

## Cấu trúc kho mã

```
huashu-design/
├── SKILL.md                 # Tài liệu chính (agent đọc, tiếng Trung)
├── README.md                # README tiếng Trung (mặc định)
├── README.en.md             # README tiếng Anh
├── README.vi.md             # README tiếng Việt
├── assets/                  # Starter Components
│   ├── animations.jsx       # Stage + Sprite + Easing + interpolate
│   ├── ios_frame.jsx        # Khung iPhone 15 Pro
│   ├── android_frame.jsx
│   ├── macos_window.jsx
│   ├── browser_window.jsx
│   ├── deck_stage.js        # Engine slide HTML
│   ├── deck_index.html      # Bộ ghép nhiều file deck
│   ├── design_canvas.jsx    # Hiển thị biến thể đặt cạnh nhau
│   ├── showcases/           # 24 mẫu dựng sẵn (8 bối cảnh × 3 phong cách)
│   └── bgm-*.mp3            # 6 track nền theo từng ngữ cảnh
├── references/              # Tài liệu đào sâu theo từng tác vụ (tiếng Trung)
│   ├── animation-pitfalls.md
│   ├── design-styles.md     # 20 triết lý thiết kế chi tiết
│   ├── slide-decks.md
│   ├── editable-pptx.md
│   ├── critique-guide.md
│   ├── video-export.md
│   └── ...
├── scripts/                 # Toolchain xuất file
│   ├── render-video.js      # HTML → MP4
│   ├── convert-formats.sh   # MP4 → 60fps + GIF
│   ├── add-music.sh         # MP4 + BGM
│   ├── export_deck_pdf.mjs
│   ├── export_deck_pptx.mjs
│   ├── html2pptx.js
│   └── verify.py
└── demos/                   # Các demo năng lực được README tham chiếu tới
```

---

## Nguồn gốc

Ngày Anthropic ra mắt Claude Design, Huasheng nghịch nó đến 4 giờ sáng. Vài ngày sau anh nhận ra mình không mở lại nó thêm lần nào nữa — không phải vì nó tệ (thực ra nó là sản phẩm hoàn thiện nhất trong ngách này), mà vì anh thích để một agent làm việc trong terminal hơn là phải mở bất kỳ giao diện đồ họa nào.

Vì vậy Huasheng bảo agent mổ xẻ chính Claude Design (bao gồm cả những system prompt đang lan truyền trong cộng đồng, brand asset protocol, cơ chế component), chưng cất thành một spec có cấu trúc, rồi viết lại thành một skill cài vào Claude Code.

Cảm ơn Anthropic vì đã viết prompt cho Claude Design đủ rõ ràng, và xin ghi công Huasheng (Huashu) là creator của huashu-design. Kiểu tác phẩm phái sinh được truyền cảm hứng từ sản phẩm khác như vậy chính là một dạng văn hóa mã nguồn mở mới trong kỷ nguyên AI.

---

## Giấy phép · Quyền sử dụng

**Dùng cá nhân thì miễn phí và không bị hạn chế** — học tập, nghiên cứu, làm đồ cho bản thân, viết bài, side project, đăng mạng xã hội cá nhân. Cứ dùng thoải mái, không cần xin phép.

**Dùng cho doanh nghiệp / thương mại thì bị hạn chế** — bất kỳ công ty, nhóm, hoặc tổ chức vì lợi nhuận nào tích hợp skill này vào sản phẩm, dịch vụ đối ngoại, hoặc deliverable cho khách hàng **đều phải được Huasheng cho phép trước**. Bao gồm nhưng không giới hạn ở:
- Dùng skill như một phần của toolchain nội bộ công ty
- Dùng đầu ra từ skill làm phương thức sáng tạo chính cho deliverable đối ngoại
- Xây dựng sản phẩm thương mại dựa trên skill này
- Dùng nó trong các dự án khách hàng có tính phí

**Liên hệ cấp phép thương mại**: qua bất kỳ nền tảng xã hội nào bên dưới.

---

## Kết nối · Huasheng (Huashu)

Huasheng là một AI-native coder, nhà phát triển độc lập, và content creator về AI. Tác phẩm tiêu biểu: Cat Fill Light (Top 1 App Store mục Paid), *A Book on DeepSeek*, Nüwa.skill (12k+ sao trên GitHub). Tổng cộng hơn 300k người theo dõi trên các nền tảng.

| Nền tảng | Tài khoản | Liên kết |
|---|---|---|
| X / Twitter | @AlchainHust | https://x.com/AlchainHust |
| WeChat Official Account | 花叔 | Tìm “花叔” trên WeChat |
| Bilibili | 花叔 | https://space.bilibili.com/14097567 |
| YouTube | 花叔 | https://www.youtube.com/@Alchain |
| Xiaohongshu | 花叔 | https://www.xiaohongshu.com/user/profile/5abc6f17e8ac2b109179dfdf |
| Official Site | huasheng.ai | https://www.huasheng.ai/ |
| Developer Hub | bookai.top | https://bookai.top |

Nếu cần cấp phép thương mại, hợp tác, hoặc nội dung tài trợ, hãy DM qua bất kỳ kênh nào ở trên.
