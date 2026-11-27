// Dán file vào một dự án Google Apps Script rồi chạy createD1ResearchForms một lần.
// Mở hai liên kết chỉnh sửa trong Nhật ký thực thi để xem các bản nháp.

function createD1ResearchForms() {
  const survey = createD1Survey_();
  console.log("Khảo sát D1 — chỉnh sửa: " + survey.getEditUrl());

  const interview = createD1InterviewForm_();
  console.log("Phiếu phỏng vấn D1 — chỉnh sửa: " + interview.getEditUrl());
}

function createD1Survey_() {
  const survey = FormApp.create("Khảo sát trải nghiệm xử lý sự cố đơn ShopeeFood | D1 BDHT", false);
  configureD1Form_(survey, "Nhóm BDHT khảo sát cách khách xử lý sự cố thiếu món, sai món hoặc giao trễ trên ShopeeFood. Khảo sát tự nguyện, ẩn danh và mất khoảng 2–4 phút. Hãy trả lời một lần, dựa trên trải nghiệm của chính bạn. Vui lòng bỏ tên, số điện thoại, email, địa chỉ và mã đơn khỏi câu trả lời.");

  const consent = survey.addMultipleChoiceItem()
    .setTitle("Bạn có ở ngoài nhóm BDHT và đồng ý tham gia khảo sát không?")
    .setRequired(true);

  const eligibilityPage = survey.addPageBreakItem().setTitle("Điều kiện tham gia");

  const recentIncident = survey.addMultipleChoiceItem()
    .setTitle("Trong 30 ngày qua, bạn có trực tiếp đặt món trên ShopeeFood và gặp đơn thiếu món, sai món hoặc giao trễ hơn giờ hẹn không?")
    .setRequired(true);

  const incidentPage = survey.addPageBreakItem().setTitle("Lần gần nhất bạn gặp sự cố");

  survey.addCheckboxItem()
    .setTitle("Ở lần gần nhất trong 30 ngày qua, đơn của bạn gặp sự cố nào?")
    .setChoiceValues([
      "Thiếu món",
      "Sai món",
      "Giao trễ hơn giờ hẹn",
    ])
    .setRequired(true);

  survey.addMultipleChoiceItem()
    .setTitle("Trong 30 ngày qua, bạn gặp các sự cố này ở bao nhiêu đơn ShopeeFood?")
    .setChoiceValues([
      "1 đơn",
      "2 đơn",
      "3 đơn",
      "Từ 4 đơn trở lên",
      "Không nhớ",
    ])
    .setHelpText("Nếu một đơn gặp nhiều sự cố, tính đơn đó một lần.")
    .setRequired(true);

  const firstAction = survey.addMultipleChoiceItem()
    .setTitle("Sau khi nhận ra sự cố ở lần đó, bạn bắt đầu xử lý bằng cách nào?")
    .setHelpText("Chọn bước đầu tiên bạn thực sự đã làm để tìm hỗ trợ, nếu có.")
    .setRequired(true);

  const supportPage = survey.addPageBreakItem().setTitle("Quá trình tìm hỗ trợ");

  survey.addCheckboxItem()
    .setTitle("Trong lúc tìm hoặc sử dụng kênh hỗ trợ, bạn gặp điều gì?")
    .setChoiceValues([
      "Khó tìm kênh liên hệ",
      "Không rõ cần gửi thông tin hoặc bằng chứng gì",
      "Phải liên hệ lại hoặc gửi lại thông tin",
      "Chờ phản hồi lâu hơn dự kiến",
      "Không rõ kết quả hoặc bước tiếp theo",
      "Có vướng mắc khác",
      "Không gặp vướng mắc",
      "Không nhớ",
    ])
    .setHelpText("Nếu chọn “Không gặp vướng mắc” hoặc “Không nhớ”, vui lòng chỉ chọn phương án đó.")
    .setRequired(true);

  survey.addMultipleChoiceItem()
    .setTitle("Bạn đã dành khoảng bao lâu để tìm hỗ trợ, điền thông tin hoặc trao đổi về sự cố?")
    .setChoiceValues([
      "Dưới 5 phút",
      "5–9 phút",
      "10–19 phút",
      "20–29 phút",
      "Từ 30 phút trở lên",
      "Không nhớ",
    ])
    .setHelpText("Chỉ tính thời gian bạn trực tiếp thao tác hoặc trao đổi. Bỏ qua thời gian chờ phản hồi.")
    .setRequired(true);

  const outcomePage = survey.addPageBreakItem().setTitle("Kết quả của lần đó");

  survey.addMultipleChoiceItem()
    .setTitle("Yêu cầu hỗ trợ về đơn đó đến nay có kết quả gì?")
    .setChoiceValues([
      "Vấn đề được giải quyết đầy đủ",
      "Vấn đề được giải quyết một phần",
      "Đang chờ phản hồi hoặc xử lý",
      "Việc xử lý đã kết thúc và vấn đề vẫn còn",
      "Tôi không gửi yêu cầu hỗ trợ",
      "Không nhớ",
    ])
    .setRequired(true);

  survey.addMultipleChoiceItem()
    .setTitle("Với đơn đó, bạn đã chủ động liên hệ hoặc gửi yêu cầu hỗ trợ mấy lượt?")
    .setChoiceValues([
      "0 lượt",
      "1 lượt",
      "2 lượt",
      "Từ 3 lượt trở lên",
      "Không nhớ",
    ])
    .setHelpText("Tính lượt đầu và mỗi lần bạn chủ động liên hệ lại. Nếu bạn chưa liên hệ hay gửi yêu cầu nào, chọn 0 lượt.")
    .setRequired(true);

  survey.addParagraphTextItem()
    .setTitle("Bạn có thể kể ngắn về bước dễ hoặc khó nhất ở lần đó, hoặc lý do bạn không tìm hỗ trợ?")
    .setHelpText("Bạn có thể bỏ qua câu này. Vui lòng bỏ tên, thông tin liên hệ, địa chỉ và mã đơn.")
    .setRequired(false);

  const submit = FormApp.PageNavigationType.SUBMIT;
  consent.setChoices([
    consent.createChoice("Tôi ở ngoài nhóm BDHT và đồng ý tham gia", eligibilityPage),
    consent.createChoice("Tôi thuộc nhóm BDHT", submit),
    consent.createChoice("Tôi không đồng ý tham gia", submit),
  ]);

  recentIncident.setChoices([
    recentIncident.createChoice("Có", incidentPage),
    recentIncident.createChoice("Không", submit),
    recentIncident.createChoice("Không nhớ", submit),
  ]);

  firstAction.setChoices([
    firstAction.createChoice("Tìm hỗ trợ trong ứng dụng ShopeeFood", supportPage),
    firstAction.createChoice("Liên hệ quán", supportPage),
    firstAction.createChoice("Liên hệ tài xế", supportPage),
    firstAction.createChoice("Tìm một kênh hỗ trợ khác", supportPage),
    firstAction.createChoice("Tôi không tìm hỗ trợ hay liên hệ ai", outcomePage),
  ]);

  return survey;
}

function createD1InterviewForm_() {
  const interview = FormApp.create("Phiếu ghi chép phỏng vấn về sự cố đơn ShopeeFood | D1 BDHT", false);
  configureD1Form_(interview, "Phiếu 10–15 phút dành cho người phỏng vấn ghi chép. Mỗi phiếu dùng một mã P1, P2… Người tham gia phải ở ngoài BDHT, từng trực tiếp đặt ShopeeFood và gặp đơn thiếu món, sai món hoặc giao trễ trong 30 ngày qua. Giải thích mục đích và xin đồng ý trước khi ghi. Vui lòng bỏ tên, số điện thoại, email, địa chỉ và mã đơn khỏi ghi chép.");

  interview.addCheckboxItem()
    .setTitle("Xác nhận sàng lọc và đồng ý tham gia")
    .setChoiceValues(["Người tham gia đủ điều kiện và đã đồng ý tham gia."])
    .setRequired(true);

  interview.addTextItem()
    .setTitle("Mã người tham gia")
    .setHelpText("Dùng P1, P2… theo thứ tự ghi phiếu.")
    .setRequired(true);

  interview.addDateItem()
    .setTitle("Ngày phỏng vấn")
    .setRequired(true);

  interview.addTextItem()
    .setTitle("Mã người hỏi, mã người ghi và hình thức phỏng vấn")
    .setHelpText("Dùng mã TV cho thành viên nhóm. Ghi trực tiếp, video hoặc điện thoại.")
    .setRequired(true);

  interview.addParagraphTextItem()
    .setTitle("Sự cố và diễn biến của lần gần nhất")
    .setHelpText("Hỏi người tham gia đã nhận ra điều gì và làm gì tiếp theo. Ghi sự việc theo thứ tự kể.")
    .setRequired(true);

  interview.addParagraphTextItem()
    .setTitle("Mục tiêu và lý do chọn bước đầu tiên")
    .setHelpText("Hỏi họ muốn giải quyết việc gì. Nếu chưa tìm hỗ trợ, hỏi điều gì khiến họ chọn như vậy.")
    .setRequired(true);

  interview.addParagraphTextItem()
    .setTitle("Các bước tiếp theo và trải nghiệm tìm hỗ trợ")
    .setHelpText("Hỏi có bước nào dễ hoặc khó, có cần tìm, gửi hoặc gửi lại thông tin không.")
    .setRequired(false);

  interview.addParagraphTextItem()
    .setTitle("Số đơn, số lượt liên hệ, thời gian thao tác và thời gian chờ")
    .setHelpText("Hỏi số đơn có sự cố trong 30 ngày. Ba số còn lại dựa trên đơn gần nhất. Ghi “không nhớ” khi cần.")
    .setRequired(true);

  interview.addParagraphTextItem()
    .setTitle("Kết quả thực tế và cách người tham gia xử lý sau đó")
    .setHelpText("Hỏi xem có lần nào họ xử lý khác lần vừa kể không.")
    .setRequired(true);

  const quoteConsent = interview.addMultipleChoiceItem()
    .setTitle("Người tham gia có đồng ý cho trích lời đã ẩn danh không?")
    .setRequired(true);

  const quotePage = interview.addPageBreakItem().setTitle("Trích nguyên văn đã ẩn danh");

  interview.addParagraphTextItem()
    .setTitle("Một đến hai câu nói nguyên văn")
    .setHelpText("Ghi lại câu thực sự đã nghe. Dùng [đã ẩn] cho chi tiết nhận dạng.")
    .setRequired(false);

  const takeawayPage = interview.addPageBreakItem().setTitle("Ghi nhận sau buổi hỏi");

  interview.addMultipleChoiceItem()
    .setTitle("Người tham gia có gặp vướng mắc khi tìm hoặc dùng kênh hỗ trợ không?")
    .setChoiceValues(["Có", "Không", "Chưa đủ thông tin"])
    .setRequired(true);

  interview.addParagraphTextItem()
    .setTitle("Chi tiết từ lời kể, hậu quả thực tế và điều khác với giả thuyết D1")
    .setRequired(true);

  quoteConsent.setChoices([
    quoteConsent.createChoice("Có", quotePage),
    quoteConsent.createChoice("Không", takeawayPage),
  ]);

  return interview;
}

function configureD1Form_(form, description) {
  form.setDescription(description);
  form.setCollectEmail(false);
  form.setPublishingSummary(false);
  form.setConfirmationMessage("Cảm ơn bạn đã dành thời gian.");
}
